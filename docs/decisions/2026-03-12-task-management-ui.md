---
title: タスク管理UI実装（一覧・作成・更新・削除）
description: App RouterベースのタスクCRUD UIの設計判断
tags: [ADR, Next.js, App Router, Server Components, Server Actions, UI]
---

# タスク管理UI実装（一覧・作成・更新・削除）

## 背景

バックエンドのタスク管理CRUD APIに対応するフロントエンドUIが必要だった。App Routerの機能（Server Components, Server Actions）を活用した設計が求められた。

## 決定内容

- **一覧ページ** (`/tasks`): Server Componentでデータ取得、`loading.tsx`/`error.tsx`で状態表示
- **作成ページ** (`/tasks/new`): TaskFormコンポーネント + Server Actions
- **詳細・編集ページ** (`/tasks/[id]`): 動的ルートでタスク取得・更新
- **削除**: 確認ダイアログ付きのClient Componentボタン + Server Actions
- **共通コンポーネント**: TaskStatusBadge（ステータス表示）、TaskForm（作成/編集兼用）、DeleteButton
- **Server Actions**: `actions.ts` に集約し、`revalidatePath` でキャッシュ再検証

## 代替案

| 案 | 却下理由 |
|---|---------|
| Client Componentで全UI構築 | Server Componentsの利点（初回表示速度・SEO）を活かせない |
| Route Handler (API Routes) 経由 | Server Actionsの方がフォーム送信がシンプル |
| 一覧と編集を同一ページ（モーダル） | App Routerのファイルベースルーティングを活かす方がコードが明確 |

## 結果

- Server Componentsで初回表示が高速
- Server Actionsでフォーム送信がシームレス（クライアントJSの削減）
- `loading.tsx`/`error.tsx`でUXが向上（App Router標準パターン）
- TaskFormコンポーネントが作成/編集で再利用されコードが簡潔
