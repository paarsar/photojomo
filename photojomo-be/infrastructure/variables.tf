variable "aws_region" {
  description = "AWS region to deploy resources"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Deployment environment (dev, staging, prod)"
  type        = string
  default     = "dev"
}

variable "project_name" {
  description = "Project name used for resource naming"
  type        = string
  default     = "photojomo"
}

# ── Database ──────────────────────────────────────────────────────────────────

variable "db_name" {
  description = "Name of the PostgreSQL database"
  type        = string
  default     = "photojomo"
}

variable "db_username" {
  description = "Master username for the RDS instance"
  type        = string
  default     = "photojomo_admin"
}

variable "db_password" {
  description = "Master password for the RDS instance"
  type        = string
  sensitive   = true
}

variable "db_instance_class" {
  description = "RDS instance class"
  type        = string
  default     = "db.t3.micro"
}

# ── Lambda ────────────────────────────────────────────────────────────────────

variable "contact_service_jar_path" {
  description = "Local path to the contact-service uber-jar (contact-service-aws.jar)"
  type        = string
  default     = "../contact-service/target/contact-service.jar"
}
