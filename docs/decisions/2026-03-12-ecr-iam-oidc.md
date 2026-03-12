---
title: Terraform ECR・IAMロール・OIDC連携モジュール構築
description: コンテナレジストリ・IAMロール・GitHub Actions OIDC連携の設計判断
tags: [ADR, Terraform, ECR, IAM, OIDC, GitHub Actions]
---

# Terraform ECR・IAMロール・OIDC連携モジュール構築

## 背景

ECS FargateへのコンテナデプロイにはECRリポジトリが必要。また、ECSタスクのSecrets Manager/CloudWatch Logsアクセス権限と、GitHub ActionsからのCI/CDパイプライン実行にはIAMロール設計が必要だった。

## 決定内容

- **ECR**: 環境ごとにリポジトリを作成、ライフサイクルポリシーで直近10件保持、push時スキャン有効
- **ECSタスク実行ロール**: AmazonECSTaskExecutionRolePolicy + Secrets Manager読み取り + CloudWatch Logs書き込み
- **ECSタスクロール**: アプリケーション用（現時点では追加権限なし）
- **GitHub Actions OIDC**: OIDCプロバイダー登録 + リポジトリ条件付きロール（ECRプッシュ・ECS更新・PassRole）

## 代替案

| 案 | 却下理由 |
|---|---------|
| IAMユーザー + アクセスキーでCI/CD | 長期クレデンシャルはセキュリティリスク。OIDCの方が安全 |
| ECRライフサイクルなし | 古いイメージが蓄積しコスト増加 |
| 全権限を1ロールに集約 | 最小権限の原則に反する。タスク実行・タスク・CIで分離 |

## 結果

- OIDCにより長期クレデンシャル不要でGitHub Actionsからデプロイ可能
- 最小権限のIAMポリシーでセキュリティを確保
- ECRライフサイクルで不要イメージを自動削除
