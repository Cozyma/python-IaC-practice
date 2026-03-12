variable "project_name" {
  description = "プロジェクト名"
  type        = string
}

variable "environment" {
  description = "環境名"
  type        = string
}

variable "github_repository" {
  description = "GitHubリポジトリ（owner/repo形式）"
  type        = string
}

variable "secrets_arns" {
  description = "ECSタスクがアクセスするSecrets ManagerのARNリスト"
  type        = list(string)
  default     = []
}
