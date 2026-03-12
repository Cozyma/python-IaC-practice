---
title: FastAPIアプリケーション基盤構築（DI・非同期処理）
description: FastAPIの基盤設計と非同期DBアクセス・DI構成の判断
tags: [ADR, FastAPI, SQLAlchemy, 非同期, DI]
---

# FastAPIアプリケーション基盤構築（DI・非同期処理）

## 背景

タスク管理APIのバックエンドとして、非同期処理対応のWebフレームワークが必要だった。テスト容易性と保守性を確保するため、依存性注入（DI）パターンの導入も求められた。

## 決定内容

- **設定管理**: Pydantic Settingsで環境変数から設定を読み込み（`app/config.py`）
- **DB接続**: SQLAlchemy AsyncSession + asyncpg ドライバによる非同期DB接続（`app/database.py`）
- **DI**: FastAPIの `Depends` でDBセッションを注入する `get_db` ジェネレータ関数
- **ライフサイクル**: `lifespan` コンテキストマネージャでエンジンの適切な破棄を保証
- **OpenAPI**: `/docs`（Swagger UI）と `/redoc` を有効化

## 代替案

| 案 | 却下理由 |
|---|---------|
| 同期ドライバ（psycopg2） | I/O待ちでスレッドがブロックされ、スループットが低下する |
| Django / Flask | 非同期サポートが限定的。FastAPIはOpenAPI自動生成も優秀 |
| 環境変数を直接 `os.getenv` で取得 | バリデーション・型変換がなく、設定ミスの検出が遅れる |
| `on_event("startup/shutdown")` | FastAPI公式で非推奨。`lifespan` が推奨パターン |

## 結果

- 非同期I/Oにより高スループットなAPI基盤を実現
- `Depends` によるDIで、テスト時にDBセッションをモックに差し替え可能
- Pydantic Settingsで設定のバリデーションが起動時に行われ、設定ミスを即座に検出
