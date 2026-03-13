---
title: ドキュメント一覧（INDEX）
description: docs配下の全ドキュメントの索引
tags: [索引, ドキュメント]
---

# ドキュメント一覧（INDEX）

| File Path | Title / Description (Japanese) | Tags |
| :--- | :--- | :--- |
| `docs/POLICY.md` | 開発ポリシー（仕様駆動 + Issue駆動ワークフロー） | 規約, ポリシー, ワークフロー, SSOT |
| `docs/docs-and-testing-policy.md` | ドキュメント管理方針とテスト基本方針（汎用） | 規約, ドキュメント, テスト, エージェント |

## decisions/

| File Path | Title / Description (Japanese) | Tags |
| :--- | :--- | :--- |
| `docs/decisions/2026-03-12-ci-pipeline-setup.md` | CIパイプライン構築（Ruff・mypy・pytest） | ADR, CI/CD, GitHub Actions, Ruff, mypy, pytest |
| `docs/decisions/2026-03-12-local-dev-environment.md` | ローカル開発環境構築（docker-compose.yml） | ADR, Docker, 開発環境, PostgreSQL |
| `docs/decisions/2026-03-12-fastapi-async-architecture.md` | FastAPIアプリケーション基盤構築（DI・非同期処理） | ADR, FastAPI, SQLAlchemy, 非同期, DI |
| `docs/decisions/2026-03-12-db-models-and-alembic.md` | DBモデル定義・Pydanticスキーマ・Alembicマイグレーション導入 | ADR, SQLAlchemy, Pydantic, Alembic, データベース |
| `docs/decisions/2026-03-12-crud-api-implementation.md` | タスク管理CRUD API実装・OpenAPI定義 | ADR, FastAPI, CRUD, OpenAPI, テスト |
| `docs/decisions/2026-03-12-terraform-foundation.md` | Terraform基盤構築（モジュール構成・tfstate管理） | ADR, Terraform, IaC, S3, tfstate |
| `docs/decisions/2026-03-12-vpc-network-module.md` | Terraform VPC・ネットワークモジュール構築 | ADR, Terraform, VPC, ネットワーク, セキュリティグループ |
| `docs/decisions/2026-03-12-ecr-iam-oidc.md` | Terraform ECR・IAMロール・OIDC連携モジュール構築 | ADR, Terraform, ECR, IAM, OIDC, GitHub Actions |
| `docs/decisions/2026-03-12-rds-secrets-manager.md` | Terraform RDS (PostgreSQL) モジュール・Secrets Manager連携 | ADR, Terraform, RDS, PostgreSQL, Secrets Manager |
| `docs/decisions/2026-03-12-ecs-alb-module.md` | Terraform ECS (Fargate)・ALBモジュール構築 | ADR, Terraform, ECS, Fargate, ALB, CloudWatch |
| `docs/decisions/2026-03-12-cd-pipeline.md` | CDパイプライン構築（Terraform Plan・IaC静的解析） | ADR, CI/CD, Terraform, tflint, tfsec, GitHub Actions |
| `docs/decisions/2026-03-12-deploy-workflow.md` | デプロイワークフロー構築（ECR→ECS・Terraform apply） | ADR, CI/CD, GitHub Actions, ECS, ECR, Terraform, Alembic |
| `docs/decisions/2026-03-12-nextjs-initial-setup.md` | Next.js (App Router) 初期セットアップ | ADR, Next.js, TypeScript, ESLint, Prettier, フロントエンド |
| `docs/decisions/2026-03-12-tailwind-css-setup.md` | Tailwind CSS 導入・デザインシステム基盤 | ADR, Tailwind CSS, フロントエンド, デザイン |
| `docs/decisions/2026-03-12-api-client.md` | APIクライアント構築（FastAPIバックエンド連携） | ADR, フロントエンド, API, TypeScript, fetch |
| `docs/decisions/2026-03-12-task-management-ui.md` | タスク管理UI実装（一覧・作成・更新・削除） | ADR, Next.js, App Router, Server Components, Server Actions, UI |
| `docs/decisions/2026-03-12-frontend-test-foundation.md` | フロントエンドテスト基盤構築（Vitest + Testing Library） | ADR, Vitest, Testing Library, MSW, フロントエンド, テスト |
| `docs/decisions/2026-03-12-openai-api-integration.md` | OpenAI API統合方針（タスク解説機能） | ADR, OpenAI, FastAPI, SSE, ストリーミング, DI, セキュリティ |
| `docs/decisions/2026-03-12-terraform-openai-secret.md` | Terraform OpenAI APIキー管理（Secrets Manager・ECS連携） | ADR, Terraform, Secrets Manager, ECS, OpenAI, セキュリティ |
| `docs/decisions/2026-03-12-fastapi-openai-endpoint.md` | FastAPI OpenAI連携エンドポイント実装（SSEストリーミング） | ADR, FastAPI, OpenAI, SSE, DI, tenacity, ストリーミング |
| `docs/decisions/2026-03-12-openai-test-mock.md` | OpenAI連携テスト・モック化方針 | ADR, pytest, OpenAI, モック, テスト, CI |
| `docs/decisions/2026-03-12-explain-ui.md` | タスク解説UI実装（SSEストリーミング表示） | ADR, Next.js, SSE, ストリーミング, OpenAI, UI |
| `docs/decisions/2026-03-12-auth-strategy.md` | 認証機能設計方針（JWT認証） | ADR, 認証, JWT, bcrypt, セキュリティ, FastAPI, Next.js |

## guidelines/

| File Path | Title / Description (Japanese) | Tags |
| :--- | :--- | :--- |
| `docs/guidelines/development-guide.md` | 開発ガイド — このリポジトリの育て方（具体例付き） | ガイド, 開発フロー, 具体例, Issue, PR, ブランチ, ADR |
