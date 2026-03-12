---
title: DBモデル定義・Pydanticスキーマ・Alembicマイグレーション導入
description: タスク管理ドメインのデータモデル設計とマイグレーション管理の判断
tags: [ADR, SQLAlchemy, Pydantic, Alembic, データベース]
---

# DBモデル定義・Pydanticスキーマ・Alembicマイグレーション導入

## 背景

タスク管理APIのデータ層を構築するにあたり、DBスキーマの定義・APIの入出力バリデーション・スキーマ変更の履歴管理が必要だった。

## 決定内容

- **SQLAlchemyモデル**: `mapped_column` による型安全なモデル定義（`app/models/task.py`）
- **Pydanticスキーマ**: Create/Update/Responseの3分割でリクエスト・レスポンスを厳密に型定義（`app/schemas/task.py`）
- **ステータス管理**: `StrEnum`（`TaskStatus`）で `todo` / `in_progress` / `done` を定義
- **Alembic**: 非同期対応の設定で、マイグレーション履歴をコードとして管理
- **初回マイグレーション**: `tasks` テーブルの作成スクリプトを手動作成

## 代替案

| 案 | 却下理由 |
|---|---------|
| Alembicなしで直接DDL実行 | スキーマ変更の履歴が追えず、環境間の差異が生じる |
| マイグレーション自動生成のみ | 初回は手動で明示的に定義した方がレビュー時に意図が伝わる |
| ステータスをDBのENUM型で定義 | マイグレーション時の変更が煩雑。アプリ層でStrEnumにより制約する方が柔軟 |

## 結果

- モデルとスキーマの責務が明確に分離され、保守性が向上
- Pydanticによりリクエストバリデーションが自動化
- Alembicによりスキーマ変更が追跡可能になり、デプロイ時のマイグレーション実行が可能に
