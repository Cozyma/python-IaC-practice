---
title: Terraform OpenAI APIキー管理（Secrets Manager・ECS連携）
description: OpenAI APIキーをSecrets Manager経由でECS Fargateコンテナに注入するインフラ構成の設計判断
tags: [ADR, Terraform, Secrets Manager, ECS, OpenAI, セキュリティ]
---

# Terraform OpenAI APIキー管理（Secrets Manager・ECS連携）

## 背景

OpenAI API統合（#39 ADR）において、APIキーを安全にECS Fargateコンテナへ渡す仕組みが必要だった。既存のSecrets Manager運用（RDS接続情報）と統一した方式で管理する。

## 決定内容

- **computeモジュール**: `openai_secret_arn` 変数を追加、ECSタスク定義の `secrets` ブロックで `OPENAI_API_KEY` として注入
- **条件付き注入**: `openai_secret_arn` が空文字の場合はsecretsに含めない（既存環境への影響なし）
- **IAMモジュール**: 既存の `secrets_arns` リストにOpenAIシークレットARNを追加するだけで権限付与される設計（変更不要）
- **ローカル開発**: `docker-compose.yml` で `env_file: .env` を追加し、`.env` から `OPENAI_API_KEY` を読み込み
- **`.env.example`**: `OPENAI_API_KEY` と `OPENAI_MODEL` のプレースホルダーを追加

## 代替案

| 案 | 却下理由 |
|---|---------|
| 環境変数ハードコード | セキュリティリスク、シークレットのローテーション不可 |
| SSM Parameter Store | Secrets Managerの方が自動ローテーション対応、既存RDSと統一 |
| 専用のsecretsモジュール新設 | 既存IAMモジュールの `secrets_arns` で十分対応可能 |

## 結果

- 既存IAM権限モデルと統合され、追加のIAMポリシー変更が不要
- `openai_secret_arn` のデフォルト空文字により、既存環境に影響なし
- ローカル開発でも `.env` から同じ環境変数名で利用可能
