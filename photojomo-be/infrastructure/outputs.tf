output "rds_endpoint" {
  description = "RDS PostgreSQL endpoint"
  value       = aws_db_instance.postgres.address
}

output "rds_port" {
  description = "RDS PostgreSQL port"
  value       = aws_db_instance.postgres.port
}

output "contact_service_lambda_arn" {
  description = "ARN of the contact-service Lambda function"
  value       = aws_lambda_function.contact_service.arn
}

output "contact_service_lambda_name" {
  description = "Name of the contact-service Lambda function"
  value       = aws_lambda_function.contact_service.function_name
}

output "api_gateway_url" {
  description = "Base URL for the HTTP API"
  value       = aws_apigatewayv2_stage.default.invoke_url
}

output "save_contact_endpoint" {
  description = "Endpoint to save contact information"
  value       = "${aws_apigatewayv2_stage.default.invoke_url}/contacts"
}
