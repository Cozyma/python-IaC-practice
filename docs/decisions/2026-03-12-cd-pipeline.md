---
title: CDパイプライン構築（Terraform Plan・IaC静的解析）
description: インフラコードの品質チェックとPlan自動化の設計判断
tags: [ADR, CI/CD, Terraform, tflint, tfsec, GitHub Actions]
---

# CDパイプライン構築（Terraform Plan・IaC静的解析）

## 背景

Terraformコードの変更がインフラに与える影響を事前に可視化し、セキュリティリスクを自動検出する仕組みが必要だった。

## 決定内容

- **ワークフロー構成**: 5ジョブ（fmt / validate / tflint / tfsec / plan）
- **トリガー**: `infra/` 配下の変更時のみ（pathsフィルター）
- **Terraform Plan**: PRコメントに結果を自動投稿し、変更内容を可視化
- **tflint**: Terraformのベストプラクティス・構文チェック
- **tfsec**: インフラコードのセキュリティ脆弱性スキャン
- **バックエンド**: `init -backend=false` でCI上ではステート接続なしで実行

## 代替案

| 案 | 却下理由 |
|---|---------|
| Plan結果をログのみに出力 | PRコメントの方がレビュー時に確認しやすい |
| Terraform CloudのSpeculative Plan | 無料枠制限あり、GitHub Actionsの方が柔軟 |
| tfsecの代わりにcheckov | tfsecの方がTerraform特化で設定が簡潔 |

## 結果

- PR上でインフラ変更の影響を即座に確認可能
- tflint/tfsecでセキュリティ・ベストプラクティスを自動担保
- `infra/` 以外の変更ではワークフローが実行されず効率的
