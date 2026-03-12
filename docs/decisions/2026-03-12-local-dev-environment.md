---
title: ローカル開発環境構築（docker-compose.yml）
description: Docker Composeによるローカル開発環境の設計判断
tags: [ADR, Docker, 開発環境, PostgreSQL]
---

# ローカル開発環境構築（docker-compose.yml）

## 背景

FastAPIアプリケーションの開発にはPostgreSQLが必要であり、開発者ごとの環境差異を排除するためにコンテナ化されたローカル開発環境が求められた。

## 決定内容

- `docker-compose.yml` で `app`（FastAPI）と `db`（PostgreSQL 16）の2サービス構成
- appコンテナはソースコードをボリュームマウントし、`--reload` で変更を即時反映
- dbコンテナはhealthcheckを設定し、DB起動完了後にappが接続する依存制御
- PostgreSQLデータは名前付きボリュームで永続化

## 代替案

| 案 | 却下理由 |
|---|---------|
| ローカルにPostgreSQLを直接インストール | 環境差異が生じやすく、セットアップ手順が煩雑 |
| SQLite をローカル開発用に使用 | 本番（RDS PostgreSQL）との互換性問題が発生する |
| devcontainer | 導入コストが高く、本プロジェクトの規模にはオーバースペック |

## 結果

- `docker compose up -d` のみでアプリ+DBが起動する
- ホットリロードにより開発中のフィードバックが高速
- `.env.example` にDB接続情報のテンプレートを記載し、セットアップ手順を明確化
