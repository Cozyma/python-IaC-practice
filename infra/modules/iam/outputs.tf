output "ecs_task_execution_role_arn" {
  description = "ECSタスク実行ロールARN"
  value       = aws_iam_role.ecs_task_execution.arn
}

output "ecs_task_role_arn" {
  description = "ECSタスクロールARN"
  value       = aws_iam_role.ecs_task.arn
}

output "github_actions_role_arn" {
  description = "GitHub Actions用ロールARN"
  value       = aws_iam_role.github_actions.arn
}
