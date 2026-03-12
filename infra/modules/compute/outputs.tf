output "alb_dns_name" {
  description = "ALBのDNS名"
  value       = aws_lb.main.dns_name
}

output "alb_arn" {
  description = "ALBのARN"
  value       = aws_lb.main.arn
}

output "ecs_cluster_name" {
  description = "ECSクラスター名"
  value       = aws_ecs_cluster.main.name
}

output "ecs_service_name" {
  description = "ECSサービス名"
  value       = aws_ecs_service.app.name
}

output "log_group_name" {
  description = "CloudWatch Logsロググループ名"
  value       = aws_cloudwatch_log_group.app.name
}
