---
title: タスク解説UI実装（SSEストリーミング表示）
description: OpenAI APIによるタスク解説のフロントエンドUI実装の設計判断
tags: [ADR, Next.js, SSE, ストリーミング, OpenAI, UI]
---

# タスク解説UI実装（SSEストリーミング表示）

## 背景

バックエンドのSSEストリーミングエンドポイント（`POST /tasks/{task_id}/explain`）に対応するフロントエンドUIが必要だった。LLMの応答待ち時間によるUX低下を防ぐため、テキストを逐次描画する仕組みが求められた。

## 決定内容

- **APIクライアント**: `streamExplain()` — `AsyncGenerator` でSSEチャンクをyield
  - `ReadableStream` + `TextDecoder` でバイトストリームを解析
  - `data:` プレフィックスのパース、`[DONE]` での終了判定
- **ExplainButton** (Client Component):
  - 「AIで解説」ボタン → クリックでストリーミング開始
  - `useState` でテキスト蓄積、ローディング状態、エラー状態を管理
  - テキストは `whitespace-pre-wrap` で改行を保持して表示
- **タスク詳細ページ統合**: `tasks/[id]/page.tsx` に `ExplainButton` を配置
- **MSWハンドラー**: SSEエンドポイントのモックを追加
- **Vitestテスト**: ボタン表示・ストリーミング描画・エラー表示を検証

## 代替案

| 案 | 却下理由 |
|---|---------|
| Server Actions経由 | SSEストリーミングはClient Componentでの処理が必要 |
| EventSource API | POSTリクエスト非対応、fetch + ReadableStreamの方が柔軟 |
| 全文取得後に一括表示 | LLM応答の待ち時間がそのままUXに影響する |

## 結果

- テキストが徐々に描画され、体感待ち時間が最小化
- ローディング・エラー状態の適切なUI表示
- 全21件のVitestテストが合格（既存18件 + 新規3件）
