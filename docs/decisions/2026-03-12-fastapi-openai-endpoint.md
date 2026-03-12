---
title: FastAPI OpenAI連携エンドポイント実装（SSEストリーミング）
description: タスク解説APIエンドポイントの実装設計（DI・リトライ・SSE）
tags: [ADR, FastAPI, OpenAI, SSE, DI, tenacity, ストリーミング]
---

# FastAPI OpenAI連携エンドポイント実装（SSEストリーミング）

## 背景

ADR（#39）で定めたOpenAI API統合方針に基づき、タスク状況の解説を返すAPIエンドポイントをFastAPIに実装する必要があった。

## 決定内容

- **エンドポイント**: `POST /tasks/{task_id}/explain`
  - タスク存在チェック → OpenAI API呼び出し → SSEストリーミングレスポンス
- **パッケージ追加**: `openai>=1.0.0`, `tenacity>=9.0.0`
- **DI設計**: `app/dependencies/openai.py` に `get_openai_client` ファクトリ
  - `AsyncOpenAI` を `Depends` で注入、テスト時に `dependency_overrides` でモック差し替え
- **サービス層**: `app/services/task_explainer.py`
  - `explain_task_stream()` — AsyncGenerator でSSEチャンクを生成
  - システムプロンプトでタスク解説・次アクション提案を指示
  - `@retry` デコレータ: `RateLimitError`/`APIConnectionError` に対し最大3回・指数バックオフ
- **設定追加**: `app/config.py` に `openai_api_key`, `openai_model` を追加

## 代替案

| 案 | 却下理由 |
|---|---------|
| 同期レスポンス | LLM応答の待ち時間でUXが悪化 |
| WebSocket | 片方向通信のためSSEで十分 |
| LangChain | 単一API呼び出しにはオーバースペック |
| エンドポイントを別ルーターに分離 | タスクの子リソースとして既存routerに統合する方が一貫性がある |

## 結果

- SSEストリーミングで体感待ち時間を最小化
- DI設計によりテスト時のモック差し替えが容易
- tenacityリトライで一時的なAPI障害に対する耐障害性を確保
- 既存のtasks routerに自然に統合
