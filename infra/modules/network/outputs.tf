output "vpc_id" {
  description = "VPC ID"
  value       = aws_vpc.main.id
}

output "public_subnet_ids" {
  description = "パブリックサブネットID"
  value       = aws_subnet.public[*].id
}

output "private_subnet_ids" {
  description = "プライベートサブネットID"
  value       = aws_subnet.private[*].id
}

output "alb_security_group_id" {
  description = "ALB用セキュリティグループID"
  value       = aws_security_group.alb.id
}

output "ecs_security_group_id" {
  description = "ECS用セキュリティグループID"
  value       = aws_security_group.ecs.id
}

output "rds_security_group_id" {
  description = "RDS用セキュリティグループID"
  value       = aws_security_group.rds.id
}
