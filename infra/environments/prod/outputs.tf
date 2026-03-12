output "vpc_id" {
  description = "VPC ID"
  value       = module.network.vpc_id
}

output "public_subnet_ids" {
  description = "パブリックサブネットID"
  value       = module.network.public_subnet_ids
}

output "private_subnet_ids" {
  description = "プライベートサブネットID"
  value       = module.network.private_subnet_ids
}
