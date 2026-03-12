output "repository_url" {
  description = "ECRリポジトリURL"
  value       = aws_ecr_repository.app.repository_url
}

output "repository_arn" {
  description = "ECRリポジトリARN"
  value       = aws_ecr_repository.app.arn
}
