---
title: APIクライアント構築（FastAPIバックエンド連携）
description: フロントエンドからバックエンドへの型安全な通信基盤の設計判断
tags: [ADR, フロントエンド, API, TypeScript, fetch]
---

# APIクライアント構築（FastAPIバックエンド連携）

## 背景

Next.js フロントエンドから FastAPI バックエンドの `/tasks` エンドポイントに型安全に通信する基盤が必要だった。

## 決定内容

- **APIクライアント**: `fetch` ベースの軽量クライアント（`src/lib/api.ts`）
- **型定義**: バックエンドの Pydantic スキーマと同期した TypeScript 型（`src/types/task.ts`）
- **エラーハンドリング**: `ApiError` クラスでHTTPステータスとメッセージを構造化
- **環境変数**: `NEXT_PUBLIC_API_URL` でAPI接続先を設定可能
- **API構造**: `taskApi` オブジェクトに CRUD メソッドを集約

## 代替案

| 案 | 却下理由 |
|---|---------|
| axios | fetch が標準API。追加依存を増やす必要がない |
| tRPC | バックエンドが FastAPI (Python) のため TypeScript 前提の tRPC は不適 |
| OpenAPI Generator で自動生成 | 導入コストが高い。MVPでは手動同期で十分 |
| SWR / TanStack Query | Server Components 主体のため、クライアント側キャッシュは現時点で不要 |

## 結果

- fetch ベースで追加依存なし。Server Components / Server Actions からも利用可能
- 型定義により、APIレスポンスの型安全性を確保
- `ApiError` で統一的なエラーハンドリングが可能
