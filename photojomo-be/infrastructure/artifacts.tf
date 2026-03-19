# ── S3 Bucket: Lambda Artifacts ───────────────────────────────────────────────

resource "aws_s3_bucket" "artifacts" {
  bucket = "${local.name_prefix}-lambda-artifacts"

  tags = {
    Name        = "${local.name_prefix}-lambda-artifacts"
    Environment = var.environment
    Project     = var.project_name
  }
}

resource "aws_s3_bucket_versioning" "artifacts" {
  bucket = aws_s3_bucket.artifacts.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_public_access_block" "artifacts" {
  bucket                  = aws_s3_bucket.artifacts.id
  block_public_acls       = true
  ignore_public_acls      = true
  block_public_policy     = true
  restrict_public_buckets = true
}

# ── Lambda Artifact Uploads ───────────────────────────────────────────────────

resource "aws_s3_object" "submission_service_zip" {
  bucket = aws_s3_bucket.artifacts.id
  key    = "submission-service/submission.zip"
  source = var.submission_service_zip_path
  etag   = filemd5(var.submission_service_zip_path)
}

resource "aws_s3_object" "contact_service_zip" {
  bucket = aws_s3_bucket.artifacts.id
  key    = "contact-service/contact.zip"
  source = var.contact_service_zip_path
  etag   = filemd5(var.contact_service_zip_path)
}
