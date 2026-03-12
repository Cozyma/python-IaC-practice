---
title: フロントエンドテスト基盤構築（Vitest + Testing Library）
description: Vitest・React Testing Library・MSWによるフロントエンドテスト環境の設計判断
tags: [ADR, Vitest, Testing Library, MSW, フロントエンド, テスト]
---

# フロントエンドテスト基盤構築（Vitest + Testing Library）

## 背景

フロントエンド（Next.js 15 / React 19）のコンポーネントとAPIクライアントに対する自動テストが未整備だった。CIでのテスト自動実行を含むテスト基盤の構築が必要だった。

## 決定内容

- **テストランナー**: Vitest（Vite互換・高速・ESM対応）
- **UIテスト**: React Testing Library（ユーザー視点のテスト）
- **APIモック**: MSW（Mock Service Worker）でネットワークレベルのモック
- **テスト構成**:
  - `vitest.config.ts`: jsdom環境、`@/`パスエイリアス設定
  - `src/test/setup.ts`: jest-dom拡張matchers、cleanup
  - `src/test/mocks/`: MSWハンドラー・サーバー定義
- **テスト対象**:
  - コンポーネント: TaskStatusBadge, TaskForm, DeleteButton
  - APIクライアント: CRUD操作・エラーハンドリング
- **CI統合**: `frontend-lint`ジョブにVitest実行ステップを追加

## 代替案

| 案 | 却下理由 |
|---|---------|
| Jest | ESM対応が不完全、Viteとの親和性が低い |
| Cypress Component Testing | セットアップが重く、単体テストには過剰 |
| APIモックにfetch spy | MSWの方がリアルなネットワーク層テストが可能 |

## 結果

- 18テストケースが全て合格（コンポーネント11件 + API 7件）
- CIでフロントエンドテストが自動実行される
- MSWによりバックエンド非依存でAPIクライアントをテスト可能
- テストケースの説明は日本語で統一
