---
title: タスク管理CRUD API実装・OpenAPI定義
description: CRUDエンドポイントの設計とテスト戦略の判断
tags: [ADR, FastAPI, CRUD, OpenAPI, テスト]
---

# タスク管理CRUD API実装・OpenAPI定義

## 背景

タスク管理ドメインのMVPとして、基本的なCRUD操作を提供するAPIエンドポイントが必要だった。OpenAPIドキュメントの活用とテスト容易性も要件に含まれる。

## 決定内容

- **ルーティング**: `APIRouter` で `/tasks` プレフィックスにCRUDエンドポイントを集約
- **CRUD層分離**: `app/crud/task.py` にDB操作ロジックを分離し、ルーティングから独立
- **OpenAPI**: 各エンドポイントに `summary`、`response_model`、`responses`（404等）を定義
- **テスト戦略**: `unittest.mock.patch` でCRUD関数をモックし、DB不要でAPIテストを実行
- **エンドポイント**: POST/GET(list)/GET(detail)/PUT/DELETE の5つ

## 代替案

| 案 | 却下理由 |
|---|---------|
| CRUDロジックをルーティングに直接記述 | テスト・再利用性が低下する |
| テストでDB接続を使用 | CI環境にDBが不要になり、テスト速度も向上する。DB統合テストは別途追加予定 |
| PATCH（部分更新）の採用 | MVPではPUTで十分。`exclude_unset` で部分更新の挙動は実現済み |

## 結果

- CRUD層の分離により、ルーティングとDB操作のテストを独立して実行可能
- モックベースのテストでCIにDB依存がなく、高速にフィードバック
- OpenAPIドキュメント（`/docs`）でAPIの入出力仕様が自動生成される
