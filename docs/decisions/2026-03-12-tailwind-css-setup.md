---
title: Tailwind CSS 導入・デザインシステム基盤
description: フロントエンドのスタイリング基盤としてTailwind CSS v4を導入した判断
tags: [ADR, Tailwind CSS, フロントエンド, デザイン]
---

# Tailwind CSS 導入・デザインシステム基盤

## 背景

Next.js フロントエンドのスタイリング基盤が必要だった。一貫性のあるデザインと高速な開発を実現するためのCSS戦略を決定する必要があった。

## 決定内容

- **Tailwind CSS v4**: `@tailwindcss/postcss` プラグインベースで導入
- **カスタムテーマ**: `@theme` ディレクティブで プロジェクト固有のカラーパレット（primary, success, warning, danger）を定義
- **共通レイアウト**: Header / Footer コンポーネントを `src/components/` に配置し、App Router の `layout.tsx` で全ページに適用
- **レスポンシブ**: Tailwind のモバイルファーストユーティリティを活用

## 代替案

| 案 | 却下理由 |
|---|---------|
| CSS Modules | コンポーネントごとのファイル管理が煩雑。ユーティリティファーストの方が開発速度が高い |
| styled-components / Emotion | SSR対応の設定が複雑。App Router (RSC) との相性が悪い |
| shadcn/ui 同時導入 | 基盤整備後に段階的に導入する方がスコープが明確 |

## 結果

- ユーティリティクラスで迅速なUI構築が可能
- `@theme` で色定義を一元管理し、デザインの一貫性を確保
- 共通レイアウトにより全ページで統一されたヘッダー・フッターが表示される
