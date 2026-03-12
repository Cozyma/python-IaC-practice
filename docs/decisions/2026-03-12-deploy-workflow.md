---
title: デプロイワークフロー構築（ECR→ECS・Terraform apply）
description: アプリケーションデプロイとインフラ適用の自動化設計判断
tags: [ADR, CI/CD, GitHub Actions, ECS, ECR, Terraform, Alembic]
---

# デプロイワークフロー構築（ECR→ECS・Terraform apply）

## 背景

アプリケーションコードの変更を本番環境に安全にデプロイし、インフラ変更も制御されたフローで適用する仕組みが必要だった。

## 決定内容

- **アプリデプロイ（自動）**: mainプッシュ時に `build-and-push` → `migrate` → `deploy` の3ステージで実行
  - Dockerイメージビルド → ECRプッシュ（コミットSHA + latestタグ）
  - Alembicマイグレーション: ECS Run Taskで `alembic upgrade head` を実行（デプロイ前）
  - ECSサービス更新: `force-new-deployment` でローリングアップデート + `services-stable` で完了待ち
- **Terraform Apply（手動）**: `workflow_dispatch` で環境を選択して手動実行
- **認証**: GitHub Actions OIDC（長期クレデンシャル不要）
- **環境分離**: GitHub Environments で dev/prod を分離（prod は承認ゲート設定可能）

## 代替案

| 案 | 却下理由 |
|---|---------|
| マイグレーションをDockerエントリーポイントで実行 | 複数タスク起動時に競合する。ECS Run Taskで単発実行の方が安全 |
| Terraform ApplyもmainプッシュでFself動実行 | インフラ変更は影響が大きいため、手動トリガー+承認の方が安全 |
| CodePipeline / CodeDeploy | GitHub Actionsで完結する方がシンプル。追加のAWSサービス管理不要 |

## 結果

- アプリ変更は自動デプロイで迅速にリリース
- マイグレーションがデプロイ前に確実に実行される順序制御
- インフラ変更は手動トリガーで安全に適用
- OIDCにより認証情報の管理が不要
