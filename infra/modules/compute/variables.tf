variable "project_name" {
  description = "プロジェクト名"
  type        = string
}

variable "environment" {
  description = "環境名"
  type        = string
}

variable "aws_region" {
  description = "AWSリージョン"
  type        = string
  default     = "ap-northeast-1"
}

variable "vpc_id" {
  description = "VPC ID"
  type        = string
}

variable "public_subnet_ids" {
  description = "パブリックサブネットID（ALB用）"
  type        = list(string)
}

variable "private_subnet_ids" {
  description = "プライベートサブネットID（ECS用）"
  type        = list(string)
}

variable "alb_security_group_id" {
  description = "ALB用セキュリティグループID"
  type        = string
}

variable "ecs_security_group_id" {
  description = "ECS用セキュリティグループID"
  type        = string
}

variable "ecs_task_execution_role_arn" {
  description = "ECSタスク実行ロールARN"
  type        = string
}

variable "ecs_task_role_arn" {
  description = "ECSタスクロールARN"
  type        = string
}

variable "ecr_repository_url" {
  description = "ECRリポジトリURL"
  type        = string
}

variable "db_secret_arn" {
  description = "DB接続情報のSecrets Manager ARN"
  type        = string
}

variable "openai_secret_arn" {
  description = "OpenAI APIキーのSecrets Manager ARN"
  type        = string
  default     = ""
}

variable "jwt_secret_arn" {
  description = "JWT秘密鍵のSecrets Manager ARN"
  type        = string
  default     = ""
}

variable "task_cpu" {
  description = "タスクCPU（単位）"
  type        = string
  default     = "256"
}

variable "task_memory" {
  description = "タスクメモリ（MiB）"
  type        = string
  default     = "512"
}

variable "desired_count" {
  description = "ECSサービスのタスク数"
  type        = number
  default     = 1
}
