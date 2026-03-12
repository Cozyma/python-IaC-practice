---
title: OpenAI連携テスト・モック化方針
description: OpenAI APIテストのモック戦略とCI安定化の設計判断
tags: [ADR, pytest, OpenAI, モック, テスト, CI]
---

# OpenAI連携テスト・モック化方針

## 背景

OpenAI API連携（#41）のテストにおいて、CIでの安定稼働（外部依存排除）とトークンコスト削減を両立するモック戦略が必要だった。

## 決定内容

- **サービス層テスト** (`test_task_explainer.py`):
  - `AsyncMock` で `AsyncOpenAI` クライアントをモック化
  - ストリーミングチャンク生成・空ストリーム・プロンプト構築を検証
- **APIエンドポイントテスト** (`test_api_explain.py`):
  - `app.dependency_overrides[get_openai_client]` でDIをモックに差し替え
  - SSEレスポンスの内容・Content-Type・404エラーを検証
  - `OPENAI_API_KEY` 未設定での動作確認テストを含む
- **CIへの影響**: 既存 `pytest` ステップで自動実行、追加設定不要

## 代替案

| 案 | 却下理由 |
|---|---------|
| CIで実API呼び出し | トークンコスト・外部起因CI不安定化 |
| pytest-httpx でHTTPレベルモック | OpenAIクライアント内部のHTTP実装に依存、DIモックの方がシンプル |
| conftest.py にグローバルフィクスチャ | テストファイルが少ないため、各ファイル内で完結させる方が可読性が高い |

## 結果

- 全テストが `OPENAI_API_KEY` 未設定でも合格
- DI Override パターンにより、モック差し替えが明示的で保守しやすい
- サービス層・API層の2レベルでテストカバレッジを確保
