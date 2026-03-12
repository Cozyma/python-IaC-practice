---
title: OpenAI API統合方針（タスク解説機能）
description: FastAPIバックエンドからOpenAI APIを呼び出し、タスク状況の解説をSSEストリーミングで返すアーキテクチャの設計判断
tags: [ADR, OpenAI, FastAPI, SSE, ストリーミング, DI, セキュリティ]
---

# OpenAI API統合方針（タスク解説機能）

## 背景

タスク管理アプリケーションにおいて、個々のタスクの状況（タイトル・説明・ステータス）をLLMが解説する機能が求められた。OpenAI APIの統合にあたり、セキュリティ・コスト・UX・テスト安定性の観点から設計方針を定める必要があった。

## 決定内容

### 呼び出し元: バックエンド集約

- OpenAI APIの呼び出しは **FastAPIバックエンドに集約** する
- フロントエンド（Next.js）にAPIキーを持たせない
- エンドポイント: `POST /tasks/{task_id}/explain`

### 認証情報管理: AWS Secrets Manager

- OpenAI APIキーは **AWS Secrets Manager** に格納
- ECS Fargateタスク定義の `secrets` ブロックで環境変数 `OPENAI_API_KEY` として注入
- ローカル開発: `.env` ファイルから読み込み（`docker-compose.yml` で `env_file` 参照）

### レスポンス方式: SSEストリーミング

- FastAPIの `StreamingResponse` で **Server-Sent Events (SSE)** を返却
- `media_type="text/event-stream"` でチャンクごとにテキストを送信
- フロントエンドは `ReadableStream` でリアルタイム描画

### 利用モデル

- デフォルト: **`gpt-4o-mini`**（コスト効率重視）
- `app/config.py` の設定で変更可能（`OPENAI_MODEL` 環境変数）

### DI設計: テスト容易性の確保

- `AsyncOpenAI` クライアントを FastAPIの `Depends` で注入
- `app/dependencies/openai.py` にファクトリ関数 `get_openai_client` を定義
- テスト時は `app.dependency_overrides` でモッククライアントに差し替え

### エラーハンドリング・リトライ

- **tenacity** ライブラリによる指数バックオフリトライ
  - 対象: HTTP 429（Rate Limit）、5xx（サーバーエラー）
  - 最大リトライ: 3回、初回待機: 1秒
- OpenAI API固有のエラー（`AuthenticationError` 等）は即座にHTTP 502で返却

### テスト分離: CIコスト・安定性

- CI（pytest）では **実際のOpenAI APIを呼ばない**
- `unittest.mock.AsyncMock` でクライアントをモック化
- `OPENAI_API_KEY` 未設定でもテストが通る設計

## 代替案

| 案 | 却下理由 |
|---|---------|
| Next.js側でOpenAI APIを直接呼び出し | APIキーがクライアントに露出するセキュリティリスク。Route Handler経由でも環境変数管理が二重化する |
| 同期レスポンス（非ストリーミング） | LLMの応答に数秒〜数十秒かかるため、UXが大幅に低下する |
| WebSocket | SSEで十分（サーバー→クライアントの片方向通信）。WebSocketは実装・インフラの複雑性が増す |
| LangChain経由 | 単一APIコールの用途にはオーバースペック。openai-pythonパッケージで十分 |
| CIで実API呼び出し | トークンコスト発生、外部起因のCI不安定化リスク |
| Parameter Store（SSM） | Secrets Managerの方が自動ローテーション・バージョニングに優れる。既存RDSもSecrets Managerを利用しており統一性が保たれる |

## 結果

- セキュリティ: APIキーがフロントエンドに露出しない
- UX: SSEストリーミングでテキストが徐々に表示され、体感待ち時間が短い
- テスト: CIでコスト発生ゼロ、外部依存なしで安定稼働
- 保守性: DI設計により、モデル変更やプロバイダー変更時の影響範囲が限定的
- インフラ統一: 既存のSecrets Manager運用と一貫した認証情報管理
