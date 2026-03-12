variable "project_name" {
  description = "プロジェクト名"
  type        = string
}

variable "environment" {
  description = "環境名"
  type        = string
}

variable "private_subnet_ids" {
  description = "プライベートサブネットID"
  type        = list(string)
}

variable "rds_security_group_id" {
  description = "RDS用セキュリティグループID"
  type        = string
}

variable "db_name" {
  description = "データベース名"
  type        = string
  default     = "taskdb"
}

variable "db_username" {
  description = "データベースユーザー名"
  type        = string
  default     = "postgres"
  sensitive   = true
}

variable "db_password" {
  description = "データベースパスワード"
  type        = string
  sensitive   = true
}

variable "db_instance_class" {
  description = "RDSインスタンスクラス"
  type        = string
  default     = "db.t3.micro"
}

variable "db_allocated_storage" {
  description = "初期ストレージ容量（GB）"
  type        = number
  default     = 20
}

variable "db_max_allocated_storage" {
  description = "最大ストレージ容量（GB）"
  type        = number
  default     = 100
}
