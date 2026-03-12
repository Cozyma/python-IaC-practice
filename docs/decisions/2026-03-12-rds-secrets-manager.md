---
title: Terraform RDS (PostgreSQL) モジュール・Secrets Manager連携
description: RDSインスタンスと機密情報管理の設計判断
tags: [ADR, Terraform, RDS, PostgreSQL, Secrets Manager]
---

# Terraform RDS (PostgreSQL) モジュール・Secrets Manager連携

## 背景

タスク管理APIのデータストアとしてPostgreSQLが必要。DBパスワード等の機密情報を安全に管理し、ECSタスクから参照できる仕組みが求められた。

## 決定内容

- **RDS**: PostgreSQL 16、プライベートサブネットに配置、ストレージ暗号化有効
- **環境差異**: dev（シングルAZ・スナップショットスキップ）、prod（マルチAZ・バックアップ7日保持）
- **Secrets Manager**: DB接続情報（host/port/user/password/dbname）をJSON形式で格納
- **パラメータグループ**: スロークエリログ（1秒以上）を有効化
- **sensitive変数**: `db_username`・`db_password` を sensitive 指定でtfstate/ログへの露出を防止

## 代替案

| 案 | 却下理由 |
|---|---------|
| 環境変数にパスワードを直接記述 | tfstate・CI/CDログに平文で残るリスク |
| SSM Parameter Store | Secrets Managerの方がローテーション機能が充実 |
| Aurora Serverless | コストが高い。MVPにはRDSシングルインスタンスで十分 |

## 結果

- 機密情報がSecrets Managerで一元管理され、平文での露出を防止
- 環境ごとに適切なコスト・可用性のバランスを実現
- ECSタスクからSecrets Manager参照でシームレスなDB接続が可能
