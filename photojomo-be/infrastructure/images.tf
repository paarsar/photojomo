# ── S3 Bucket: Contest Images ─────────────────────────────────────────────────

resource "aws_s3_bucket" "contest_images" {
  bucket = "${local.name_prefix}-contest-images"

  tags = {
    Name        = "${local.name_prefix}-contest-images"
    Environment = var.environment
    Project     = var.project_name
  }
}

resource "aws_s3_bucket_public_access_block" "contest_images" {
  bucket                  = aws_s3_bucket.contest_images.id
  block_public_acls       = true
  ignore_public_acls      = true
  block_public_policy     = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_cors_configuration" "contest_images" {
  bucket = aws_s3_bucket.contest_images.id

  cors_rule {
    allowed_headers = ["Content-Type"]
    allowed_methods = ["PUT"]
    allowed_origins = ["*"]
    max_age_seconds = 3000
  }
}

# ── IAM: Allow Lambdas to write to contest images bucket ──────────────────────

resource "aws_iam_policy" "lambda_write_images" {
  name = "${local.name_prefix}-lambda-write-images"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect   = "Allow"
        Action   = ["s3:PutObject"]
        Resource = "${aws_s3_bucket.contest_images.arn}/*"
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "lambda_write_images" {
  role       = aws_iam_role.lambda_exec.name
  policy_arn = aws_iam_policy.lambda_write_images.arn
}
