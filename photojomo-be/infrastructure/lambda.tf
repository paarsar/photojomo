# ── IAM Role ──────────────────────────────────────────────────────────────────

resource "aws_iam_role" "lambda_exec" {
  name = "${local.name_prefix}-lambda-exec-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect    = "Allow"
        Principal = { Service = "lambda.amazonaws.com" }
        Action    = "sts:AssumeRole"
      }
    ]
  })

  tags = {
    Environment = var.environment
    Project     = var.project_name
  }
}

# Allows Lambda to write CloudWatch logs and operate inside a VPC
resource "aws_iam_role_policy_attachment" "lambda_basic" {
  role       = aws_iam_role.lambda_exec.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaVPCAccessExecutionRole"
}

# ── CloudWatch Log Group ──────────────────────────────────────────────────────

resource "aws_cloudwatch_log_group" "contact_service" {
  name              = "/aws/lambda/${local.name_prefix}-contact-service"
  retention_in_days = 30

  tags = {
    Environment = var.environment
    Project     = var.project_name
  }
}

# ── Lambda Function: contact-service ─────────────────────────────────────────

resource "aws_lambda_function" "contact_service" {
  function_name = "${local.name_prefix}-contact-service"
  description   = "Saves user contact information to PostgreSQL"

  s3_bucket        = aws_s3_bucket.artifacts.id
  s3_key           = aws_s3_object.contact_service_jar.key
  source_code_hash = filebase64sha256(var.contact_service_jar_path)

  runtime = "java21"
  handler = "org.springframework.cloud.function.adapter.aws.FunctionInvoker"
  role    = aws_iam_role.lambda_exec.arn

  memory_size = 512
  timeout     = 30

  # Spring Boot cold start optimisation
  snap_start {
    apply_on = "PublishedVersions"
  }

  vpc_config {
    subnet_ids         = [aws_subnet.private_a.id, aws_subnet.private_b.id]
    security_group_ids = [aws_security_group.lambda.id]
  }

  environment {
    variables = {
      SPRING_CLOUD_FUNCTION_DEFINITION = "saveContact"
      DB_SECRET_ARN                    = aws_secretsmanager_secret.db_credentials.arn
    }
  }

  depends_on = [
    aws_cloudwatch_log_group.contact_service,
    aws_iam_role_policy_attachment.lambda_basic,
    aws_iam_role_policy_attachment.lambda_read_secret,
  ]

  tags = {
    Name        = "${local.name_prefix}-contact-service"
    Environment = var.environment
    Project     = var.project_name
  }
}
