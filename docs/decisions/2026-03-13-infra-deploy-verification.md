---
title: インフラ環境構築検証レポート
date: 2026-03-13
status: verified
tags: [ADR, Terraform, AWS, 検証, インフラ, IAM]
---

# インフラ環境構築検証レポート

## 概要

AWSアカウント（743938722274）上で Terraform によるリソース作成・破棄の一連の動作を検証した。
IAMユーザー `ell-kojima`（プロファイル: `aube-quest`）の権限範囲を実環境で確認し、
本番デプロイに向けたブロッカーを特定した。

## 検証環境

| 項目 | 値 |
|---|---|
| 日時 | 2026-03-13 17:20 JST |
| AWSアカウント | 743938722274 |
| IAMユーザー | ell-kojima |
| リージョン | ap-northeast-1 |
| Terraform | v1.5.7 |
| AWS Provider | hashicorp/aws v5.100.0 |
| バックエンド | ローカル（S3バックエンド未構築のため一時切替） |

## 検証結果

### terraform plan

18リソースの作成が計画された。エラーなし。

### terraform apply

17/18 リソースが正常に作成された。

| # | リソース | リソースID | 結果 |
|---|---|---|---|
| 1 | VPC (10.0.0.0/16) | vpc-01269c90dd9c6b67f | OK |
| 2 | Public Subnet (1a) | subnet-01470291089d6f685 | OK |
| 3 | Public Subnet (1c) | subnet-0771eaffb581cf1a1 | OK |
| 4 | Private Subnet (1a) | subnet-02541de2e4be8417f | OK |
| 5 | Private Subnet (1c) | subnet-0e5a3bb6cccd3438b | OK |
| 6 | Internet Gateway | igw-0fad39eecf263e836 | OK |
| 7 | Elastic IP (NAT用) | eipalloc-02d9e0992cd789e79 | OK |
| 8 | NAT Gateway | nat-0f1c0bd6cabc3c3ef | OK |
| 9 | Route Table (public) | rtb-09010b9f27249e24d | OK |
| 10 | Route Table (private) | rtb-0cebdc2274beb2e1b | OK |
| 11 | RT Association (public-1a) | rtbassoc-0efe5ae258cb05a5f | OK |
| 12 | RT Association (public-1c) | rtbassoc-07acaee484b677e5f | OK |
| 13 | RT Association (private-1a) | rtbassoc-0ea5c6d6f4aaf0c1d | OK |
| 14 | RT Association (private-1c) | rtbassoc-0fd9c1e397f6ccbd6 | OK |
| 15 | Security Group (ALB) | sg-0b9b3ea15bc3fb931 | OK |
| 16 | Security Group (ECS) | sg-09ae20db9850462d5 | OK |
| 17 | Security Group (RDS) | sg-0d7377f8f06b72a60 | OK |
| 18 | **Secrets Manager (JWT)** | — | **AccessDenied** |

### terraform destroy

17リソース全て正常に破棄された。残存リソースなし。

## IAM権限の確認結果

### アクセス可能なサービス

| サービス | 読み取り | 書き込み（検証済み） |
|---|---|---|
| EC2 (VPC/Subnet/IGW/NAT/SG/EIP/RT) | OK | OK |
| ECS | OK | 未検証（今回のスコープ外） |
| RDS | OK | 未検証（今回のスコープ外） |
| S3 | OK | 未検証 |
| ECR | OK | 未検証 |
| ALB (ELBv2) | OK | 未検証 |

### アクセス不可のサービス

| サービス | アクション | エラー |
|---|---|---|
| **Secrets Manager** | `secretsmanager:CreateSecret` | AccessDeniedException |
| IAM | `iam:GetUser`, `iam:ListAttachedUserPolicies` 等 | AccessDenied |
| DynamoDB | `dynamodb:DescribeTable` | AccessDeniedException |
| CloudFormation | `cloudformation:ListStacks` | AccessDenied |

## ブロッカーと対応方針

### 1. Secrets Manager 権限不足（重大度: 高）

`ell-kojima` ユーザーに `secretsmanager:CreateSecret` 権限がないため、
JWT秘密鍵・OpenAI APIキーの Secrets Manager 管理ができない。

**対応案:**
- (A) IAM管理者に `secretsmanager:CreateSecret` / `DeleteSecret` / `GetSecretValue` 権限を付与してもらう
- (B) Admin権限を持つユーザーがSecretを手動作成し、Terraformでは `data` ソースで参照のみ行う

### 2. S3バックエンド未構築（重大度: 高）

tfstateを管理する S3バケット `python-iac-practice-tfstate` と
DynamoDBテーブル `terraform-locks` が存在しない。

**対応案:**
- (A) IAM管理者 or Admin権限でバックエンド用リソースを手動作成
- (B) CloudFormation / 別のTerraform構成でブートストラップ

### 3. IAM権限の自己確認不可（重大度: 低）

`iam:Get*` / `iam:List*` 権限がないため、自身のポリシーを確認できない。
実運用上は問題ないが、権限トラブルシュート時に不便。

## 結論

ネットワーク層（VPC/Subnet/IGW/NAT/SG）の作成・破棄は問題なく動作する。
本番デプロイに進むには、上記ブロッカー（Secrets Manager権限 + S3バックエンド）の
解消が必要。ECS/RDS/ALBの作成権限は今回未検証のため、次回検証で確認する。
