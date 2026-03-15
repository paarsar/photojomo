# Photojomo Backend — Technical Specification

## Overview

Photojomo is a photography platform with a serverless backend built on AWS. The backend is composed of a series of Spring Boot AWS Lambda functions, a PostgreSQL database hosted on RDS, and infrastructure managed via Terraform.

---

## Repository Structure

```
photojomo/
├── SPECIFICATION.md
└── photojomo-be/
    ├── pom.xml                  # Parent Maven POM (multi-module)
    ├── infrastructure/          # Terraform infrastructure
    └── contact-service/         # Lambda: save user contact information
        ├── infra/
        │   └── Makefile         # build → upload → update Lambda
        └── src/
            └── main/
                └── resources/
                    └── db/migration/
                        └── V1__create_contacts_table.sql
```

---

## Backend — Spring Boot Lambdas

### Technology Stack

| Concern | Choice |
|---|---|
| Language | Java 21 |
| Framework | Spring Boot 3.3 |
| Lambda adapter | Spring Cloud Function 4.x (`spring-cloud-function-adapter-aws`) |
| ORM | Spring Data JPA / Hibernate |
| Database driver | PostgreSQL (org.postgresql) |
| Migrations | Flyway |
| Secrets | AWS SDK v2 — Secrets Manager |
| Build | Maven (multi-module) |
| Packaging | Maven Shade Plugin → uber-jar (`contact-service.jar`) |

### Lambda Handler

All lambdas use the Spring Cloud Function AWS adapter handler:

```
org.springframework.cloud.function.adapter.aws.FunctionInvoker
```

Each function is declared as a `java.util.function.Function<Input, Output>` Spring bean. The active function is selected via the `SPRING_CLOUD_FUNCTION_DEFINITION` environment variable.

### Build

```bash
cd photojomo-be
mvn clean package
```

Produces `contact-service/target/contact-service.jar` — the deployable artifact.

> The Maven Shade plugin is configured with `shadedArtifactAttached=false` so the shaded uber-jar replaces the original thin jar as the primary artifact. Netty is excluded from the AWS SDK dependency and replaced with `url-connection-client` to keep the jar under Lambda's 50MB direct-upload limit.

---

## Services

### contact-service

Handles saving user contact information submitted via the public API.

**Endpoint:** `POST /contacts`

**Request:**
```json
{
  "firstName": "Jane",
  "lastName":  "Doe",
  "email":     "jane@example.com",
  "phone":     "555-1234",
  "message":   "Hello!"
}
```

**Response:**
```json
{
  "id":      "uuid",
  "message": "Contact information saved successfully.",
  "success": true
}
```

**Package structure:**
```
com.photojomo.contact/
├── ContactServiceApplication.java
├── handler/
│   └── ContactFunctionConfig.java   # declares saveContact Function bean
├── model/
│   └── Contact.java                 # JPA entity
├── dto/
│   ├── ContactRequest.java
│   └── ContactResponse.java
├── service/
│   └── ContactService.java
├── repository/
│   └── ContactRepository.java       # extends JpaRepository
└── config/
    └── DataSourceConfig.java        # builds DataSource from Secrets Manager
```

---

## Database

### Engine

PostgreSQL 16.3 on Amazon RDS (`db.t3.micro` for dev).

### Access

- **Publicly accessible** — `publicly_accessible = true`, security group allows inbound on port `5432` from `0.0.0.0/0`
- RDS lives in **public subnets** with an internet gateway

### Credentials

Stored in AWS Secrets Manager as a JSON secret:

```json
{
  "username": "photojomo_admin",
  "password": "...",
  "host":     "<rds-endpoint>",
  "port":     "5432",
  "dbname":   "photojomo"
}
```

The Lambda fetches this secret at cold start via `DataSourceConfig`. Only the secret ARN (`DB_SECRET_ARN`) is stored as a Lambda environment variable.

### Connection Pool (HikariCP)

Lambda instances handle one request at a time, so the pool is kept deliberately small:

| Setting | Value |
|---|---|
| `minimumIdle` | 1 |
| `maximumPoolSize` | 2 |
| `connectionTimeout` | 10,000 ms |
| `idleTimeout` | 30,000 ms |

### Migrations

Flyway manages schema changes. Migration scripts live at:

```
contact-service/src/main/resources/db/migration/
```

Naming convention: `V{n}__{description}.sql` e.g. `V1__create_contacts_table.sql`

`spring.jpa.hibernate.ddl-auto=validate` — Hibernate validates against the schema but never modifies it. Flyway owns the schema.

---

## Infrastructure (Terraform)

### State Backend

Terraform state is stored remotely in S3:

| Setting | Value |
|---|---|
| Bucket | `photojomo-terraform-state` |
| Key | `photojomo-be/terraform.tfstate` |
| Region | `us-east-1` |
| Encryption | AES-256 (SSE-S3) |

> State locking via DynamoDB is not currently enabled pending IAM permissions (`dynamodb:CreateTable`). Once granted, create table `photojomo-terraform-locks` and add `dynamodb_table = "photojomo-terraform-locks"` to the backend block in `providers.tf`.

### Networking

```
VPC: 10.0.0.0/16
├── Public Subnets  (RDS)
│   ├── public-a: 10.0.3.0/24  (us-east-1a)
│   └── public-b: 10.0.4.0/24  (us-east-1b)
└── Private Subnets (Lambda)
    ├── private-a: 10.0.1.0/24 (us-east-1a)
    └── private-b: 10.0.2.0/24 (us-east-1b)
```

An **Internet Gateway** is attached and routed from the public subnets.

**Security groups:**

| Group | Inbound |
|---|---|
| `lambda-sg` | none (egress all) |
| `rds-sg` | 5432 from `lambda-sg`, 5432 from `0.0.0.0/0` |
| `vpc-endpoints-sg` | 443 from `lambda-sg` |

### Lambda

| Setting | Value |
|---|---|
| Runtime | `java21` |
| Handler | `org.springframework.cloud.function.adapter.aws.FunctionInvoker` |
| Memory | 512 MB |
| Timeout | 30 s |
| SnapStart | `PublishedVersions` (reduces Spring Boot cold start) |
| VPC | Private subnets, `lambda-sg` |

**Environment variables:**

| Variable | Value |
|---|---|
| `SPRING_CLOUD_FUNCTION_DEFINITION` | `saveContact` |
| `DB_SECRET_ARN` | ARN of the Secrets Manager secret |

### API Gateway

HTTP API (v2) — lower latency and cost than REST API (v1).

| Route | Integration |
|---|---|
| `POST /contacts` | `contact-service` Lambda |

CORS is enabled for all origins (`*`). The base URL is output after `terraform apply` as `api_gateway_url`.

### Secrets Manager

- Secret name: `photojomo-{environment}/db-credentials`
- VPC Interface Endpoint deployed so Lambda resolves Secrets Manager privately without leaving the VPC
- Lambda IAM policy grants `secretsmanager:GetSecretValue` scoped to the single secret ARN

### IAM

The Lambda execution role has two attached policies:

| Policy | Purpose |
|---|---|
| `AWSLambdaVPCAccessExecutionRole` (AWS managed) | CloudWatch logs + VPC network interface |
| `photojomo-{env}-lambda-read-secret` (inline) | Read DB credentials from Secrets Manager |

---

## Terraform Files

```
infrastructure/
├── providers.tf       # AWS provider, Terraform version, S3 backend
├── variables.tf       # All input variables
├── networking.tf      # VPC, subnets, IGW, route tables, security groups
├── database.tf        # RDS subnet group, RDS instance
├── lambda.tf          # IAM role, CloudWatch log group, Lambda function
├── api_gateway.tf     # HTTP API, stage, integration, route, Lambda permission
├── secrets.tf         # Secrets Manager secret, IAM policy, VPC endpoint
├── artifacts.tf       # S3 artifacts bucket + jar upload
├── outputs.tf         # RDS endpoint, Lambda ARN/name, API Gateway URLs
├── terraform.tfvars.example
└── .gitignore         # excludes terraform.tfvars (contains secrets)
```

### Artifacts Bucket

Lambda jars are too large for direct upload (>50MB). They are uploaded to S3 first:

| Setting | Value |
|---|---|
| Bucket | `photojomo-{environment}-lambda-artifacts` |
| Key | `contact-service/contact-service.jar` |
| Versioning | Enabled |

The Lambda function references `s3_bucket` and `s3_key` rather than a local `filename`.

---

## Deployment

### Prerequisites

- AWS CLI configured (`aws configure`)
- Terraform >= 1.6.0
- Java 21, Maven 3.x
- `jq` (used by the Makefile for output formatting)

### First-time Infrastructure Deploy

```bash
# 1. Build Lambda jars
cd photojomo-be
mvn clean package

# 2. Configure Terraform variables
cd infrastructure
cp terraform.tfvars.example terraform.tfvars
# Set db_password in terraform.tfvars

# 3. Deploy
terraform init
terraform plan
terraform apply
```

### Updating a Lambda (contact-service)

Use the Makefile in `contact-service/infra/` to build, upload, and update in one step:

```bash
cd contact-service/infra

# Full deploy (build → upload to S3 → update Lambda)
make deploy

# Or run steps individually
make build
make upload
make update

# Target a specific environment
make deploy ENV=prod
```

| Target | Description |
|---|---|
| `build` | Runs `mvn clean package` scoped to contact-service only |
| `upload` | Uploads jar to `photojomo-{ENV}-lambda-artifacts` S3 bucket |
| `update` | Calls `aws lambda update-function-code` to point Lambda at new jar |
| `deploy` | Runs build → upload → update in sequence |

### Verify

```bash
curl -X POST $(terraform output -raw save_contact_endpoint) \
  -H "Content-Type: application/json" \
  -d '{"firstName":"Jane","lastName":"Doe","email":"jane@example.com","phone":"555-1234","message":"Hello!"}'
```

---

## Future Work

- [ ] Input validation (`@NotBlank`, `@Email`) on request DTOs
- [ ] Global error handling and structured error responses
- [ ] Unit and integration tests
- [ ] CI/CD pipeline (GitHub Actions) — build, test, and deploy on push
- [ ] RDS Proxy — connection pooling at the AWS layer for high-concurrency scenarios
- [ ] DynamoDB state locking once IAM permissions are granted
- [ ] Tighten RDS security group to known IP ranges instead of `0.0.0.0/0`
