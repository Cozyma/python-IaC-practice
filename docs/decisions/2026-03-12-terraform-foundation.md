---
title: Terraform基盤構築（モジュール構成・tfstate管理）
description: Terraformのプロジェクト構成とリモートステート管理の設計判断
tags: [ADR, Terraform, IaC, S3, tfstate]
---

# Terraform基盤構築（モジュール構成・tfstate管理）

## 背景

AWSインフラをIaCで管理するにあたり、Terraformのプロジェクト構成・モジュール分割方針・ステート管理方法を決定する必要があった。

## 決定内容

- **ディレクトリ構成**: `infra/environments/` に環境別（dev/prod）の設定を配置、`infra/modules/` に再利用可能なモジュール
- **モジュール分割**: network / database / compute の3モジュール体制
- **tfstate管理**: S3バックエンド + DynamoDBロックで環境別にステートファイルを分離
- **タグ戦略**: `default_tags` で Project / Environment / ManagedBy を全リソースに自動付与
- **環境差異**: `terraform.tfvars` で環境ごとのパラメータを管理（VPC CIDR等）

## 代替案

| 案 | 却下理由 |
|---|---------|
| 単一main.tfに全リソース定義 | 可読性・再利用性が低く、ポートフォリオとしてモジュール分割をアピールできない |
| Terragrunt | 学習コスト・導入コストが高く、本プロジェクトの規模にはオーバースペック |
| ローカルtfstate | チームでの共有・CI/CDからのアクセスができない |
| Terraform Cloud | 無料枠の制限があり、S3の方が自由度が高い |

## 結果

- 環境別のステート分離により、dev変更がprodに影響しない
- モジュール化により、リソースの追加・変更が局所化される
- `default_tags` でリソースの帰属が明確になり、コスト管理・運用が容易
