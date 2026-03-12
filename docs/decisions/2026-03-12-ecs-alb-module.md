---
title: Terraform ECS (Fargate)・ALBモジュール構築
description: コンテナ実行基盤とロードバランサーの設計判断
tags: [ADR, Terraform, ECS, Fargate, ALB, CloudWatch]
---

# Terraform ECS (Fargate)・ALBモジュール構築

## 背景

FastAPIアプリケーションをAWS上でコンテナとして実行するための基盤が必要。サーバーレスなコンテナ実行環境とHTTPトラフィック分散が要件。

## 決定内容

- **ECSクラスター**: Container Insights有効化でメトリクス可視化
- **タスク定義**: Fargate、256 CPU / 512 MiB（dev最小構成）、Secrets Managerからの環境変数注入
- **ECSサービス**: プライベートサブネットに配置、ALBと連携
- **ALB**: パブリックサブネットに配置、`/health` でヘルスチェック
- **CloudWatch Logs**: 環境別の保持期間（dev: 7日、prod: 30日）

## 代替案

| 案 | 却下理由 |
|---|---------|
| EC2ベースのECS | サーバー管理が必要。Fargateの方がサーバーレスで運用負荷が低い |
| Lambda + API Gateway | コールドスタートが発生し、DB接続管理が煩雑 |
| ECS Serviceなし（タスク直接実行） | ヘルスチェック・オートリカバリー・ローリングアップデートが使えない |

## 結果

- Fargateでサーバー管理不要のコンテナ実行環境を実現
- ALBのヘルスチェックで異常タスクを自動的に置き換え
- CloudWatch Logsでログを集約し、運用時の調査が容易
