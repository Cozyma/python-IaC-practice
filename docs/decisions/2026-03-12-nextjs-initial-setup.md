---
title: Next.js (App Router) 初期セットアップ
description: フロントエンド基盤としてのNext.js導入と品質ツール設定の判断
tags: [ADR, Next.js, TypeScript, ESLint, Prettier, フロントエンド]
---

# Next.js (App Router) 初期セットアップ

## 背景

タスク管理APIのフロントエンドとして、SSR/RSC対応のモダンなReactフレームワークが必要だった。バックエンド（FastAPI）と同一モノレポ内で管理し、開発体験を統一する。

## 決定内容

- **フレームワーク**: Next.js 15（App Router）、TypeScript
- **ディレクトリ**: `frontend/src/app/` にApp Routerのページを配置
- **Linter**: ESLint（`next/core-web-vitals` + `eslint-config-prettier` で競合解消）
- **Formatter**: Prettier（セミコロンあり、ダブルクォート、幅80）
- **CI統合**: `ci.yml` に `frontend-lint` ジョブを追加（ESLint + Prettier check）
- **Docker**: `docker-compose.yml` にフロントエンドコンテナ追加（ホットリロード対応）
- **ビルド**: `output: "standalone"` でコンテナデプロイに最適化

## 代替案

| 案 | 却下理由 |
|---|---------|
| Vite + React Router | SSR/RSCが標準サポートされていない。Next.jsの方がフルスタック対応 |
| Pages Router | App Routerが公式推奨。Server Componentsを活用できる |
| Biome（ESLint+Prettier置換） | Next.js公式のESLint設定との統合が不十分 |
| pnpm / yarn | npmがNext.js公式のデフォルト。チーム導入コストが低い |

## 結果

- `docker compose up` でフロント+バックエンド+DBが一括起動
- CIでESLint/Prettierが自動チェックされ、コード品質を担保
- App Routerにより、今後RSC/SSRを活用したパフォーマンス最適化が可能
