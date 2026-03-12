---
title: 開発ポリシー (Development Policy)
description: 仕様駆動とIssue駆動を両立させる開発プロセスの定義
tags: [規約, ポリシー, ワークフロー, SSOT]
---

# 開発ポリシー (Development Policy)

本リポジトリでは、「仕様駆動（ドキュメントのSSOT化）」と「Issue駆動（タスクの細分化）」を両立させるためのプロセスを定義する。

> **関連ドキュメント:**
> ドキュメント管理規約・命名規則・ADRフォーマット・テスト方針は `docs/docs-and-testing-policy.md` を参照。
> 本ポリシーは開発ワークフロー（仕様定義→実装の流れ）を定義するものであり、両者は補完関係にある。

## 1. 基本原則 (State vs Transition)

* **State（状態）:** `docs/` 配下のマークダウン、および FastAPI が生成する `openapi.json` が現在のシステムの「絶対的な正解（Single Source of Truth）」である。
* **Transition（遷移）:** Issue と Pull Request は、現在の State を次の State へ移行させるための「作業手順」と「一時的な議論の場」である。仕様の決定事項を Issue のコメント欄に放置してはならない。

## 2. 開発ワークフロー

新機能の開発やインフラの変更は、以下のフェーズに従って実行する。

### Phase 1: 仕様の定義 (Doc First)

1. **Spec Issue の作成:** 何を解決するための仕様変更か Issue を作成する（テンプレート: `📝 仕様・アーキテクチャ定義`）。
2. **Spec PR の作成:** `docs/decisions/` への ADR 追記、または FastAPI のガワのみを実装し `openapi.json` を更新する PR を作成する。
3. **レビューとマージ:** 仕様を合意し、`main` にマージする。

### Phase 2: 実装 (Implementation)

1. **Impl Issue の作成:** Phase 1 でマージされた仕様（Doc）へのリンクを記載した実装用 Issue を作成する（テンプレート: `💻 実装・開発`）。必要に応じてバックエンド / フロントエンド / インフラ等で分割する。
2. **Impl PR の作成:** 仕様を満たすコードを実装し、テストを記述する。
3. **CI による検証:** 静的解析、テスト、API スキーマの差分チェックを通過したのちマージする。

### Phase 間の成果物

| Phase | 成果物 | 格納先 |
|-------|--------|--------|
| Phase 1 | ADR（設計決定記録） | `docs/decisions/` |
| Phase 1 | OpenAPI スキーマ更新 | FastAPI 自動生成 |
| Phase 2 | 実装コード + テスト | `app/`, `infra/`, `frontend/` |

## 3. 例外規定

* 軽微なバグ修正やタイポの修正においては、Phase 1 を省略し、直接 Phase 2（実装）から開始することを許容する。
* エージェント（Claude Code 等）による一括実装では、Phase 1 と Phase 2 を同一 PR 内で完結させることを許容する。ただし ADR の作成は省略しない。

## 4. コミット規約

* Conventional Commits プレフィックスを使用する: `feat:`, `fix:`, `docs:`, `chore:`, `refactor:`, `test:`, `ci:`
* コミットの粒度は「意味のある最小単位」とし、1PR あたりのサイズを小さく保つ。
