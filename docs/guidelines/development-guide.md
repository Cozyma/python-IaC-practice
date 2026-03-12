---
title: 開発ガイド — このリポジトリの育て方（具体例付き）
description: 本リポジトリで実際に機能を追加・変更する際のステップを、過去の実績に基づいた具体例で解説するガイド
tags: [ガイド, 開発フロー, 具体例, Issue, PR, ブランチ, ADR]
---

# 開発ガイド — このリポジトリの育て方

このドキュメントでは、本リポジトリで **実際に機能を追加・変更していく流れ** を、これまでの開発実績に基づいた具体例で解説します。

POLICY.md（開発ポリシー）の「理論」に対して、こちらは「実践」のドキュメントです。

---

## 目次

1. [全体の流れ（5分で理解）](#全体の流れ5分で理解)
2. [具体例 ①：バックエンドに新機能を追加する](#具体例-バックエンドに新機能を追加する)
3. [具体例 ②：インフラを変更する（Terraform）](#具体例-インフラを変更するterraform)
4. [具体例 ③：フロントエンドに画面を追加する](#具体例-フロントエンドに画面を追加する)
5. [具体例 ④：複数レイヤーにまたがる大きな機能を作る](#具体例-複数レイヤーにまたがる大きな機能を作る)
6. [ブランチ命名規則](#ブランチ命名規則)
7. [コミットメッセージの書き方](#コミットメッセージの書き方)
8. [ADR（設計判断記録）の書き方](#adr設計判断記録の書き方)
9. [よくある質問](#よくある質問)

---

## 全体の流れ（5分で理解）

どんな変更でも、基本は **Issue → ブランチ → 実装 → ADR → PR → マージ** の流れです。

```
① Issue を作る
   「何を・なぜ作るか」を明文化する

② ブランチを切る
   git checkout -b feature/XX-description

③ 実装する
   コードを書く + テストを書く

④ ADR を書く
   docs/decisions/ に「なぜそう作ったか」を記録する

⑤ コミット & プッシュ
   git push -u origin feature/XX-description

⑥ PR を作る
   gh pr create --title "feat: ... #XX"

⑦ レビュー & マージ
   gh pr merge --merge --delete-branch
```

**この流れをこれから具体例で見ていきます。**

---

## 具体例 ①：バックエンドに新機能を追加する

> **実例: タスク管理 CRUD API の実装（Issue #4, PR #20）**
>
> タスクの作成・取得・更新・削除の API エンドポイントを FastAPI に追加した。

### Step 1: Issue を作る

GitHub の Issue テンプレート「💻 実装・開発」を使って Issue を作成します。

```
タイトル: [Impl]: タスク管理CRUD API実装・OpenAPI定義

本文:
## 1. 関連する仕様・ADR
- docs/decisions/2026-03-12-fastapi-async-architecture.md

## 2. 実装タスク
- [ ] GET /tasks（一覧取得）
- [ ] GET /tasks/{id}（詳細取得）
- [ ] POST /tasks（作成）
- [ ] PUT /tasks/{id}（更新）
- [ ] DELETE /tasks/{id}（削除）
- [ ] pytest テスト

## 3. 完了条件 (Definition of Done)
- [ ] 全エンドポイントが動作すること
- [ ] テストが通ること
```

### Step 2: ブランチを切って実装する

```bash
# main を最新にしてからブランチを切る
git checkout main
git pull origin main
git checkout -b feature/4-crud-api

# --- 実装 ---
# app/api/tasks.py      ← エンドポイント
# app/crud/task.py       ← DB操作（非同期）
# app/tests/test_api_tasks.py  ← テスト
```

**実際に作成・変更したファイル:**

| ファイル | 内容 |
|---------|------|
| `app/api/tasks.py` | 5 つの CRUD エンドポイント定義 |
| `app/crud/task.py` | SQLAlchemy の非同期 CRUD 関数 |
| `app/main.py` | ルーター登録（`app.include_router`） |
| `app/tests/test_api_tasks.py` | 各エンドポイントのテスト |

### Step 3: ADR を書く

`docs/decisions/2026-03-12-crud-api-implementation.md` を作成:

```markdown
---
title: タスク管理CRUD API実装・OpenAPI定義
tags: [ADR, FastAPI, CRUD, OpenAPI, テスト]
---

# タスク管理CRUD API実装・OpenAPI定義

## 背景
タスク管理の基本機能として CRUD API が必要だった。

## 決定内容
- FastAPI の APIRouter でエンドポイントを定義
- 非同期 SQLAlchemy で DB 操作
- テストは AsyncClient + モックで実施

## 代替案
| 案 | 却下理由 |
|---|---------|
| Django REST Framework | 非同期対応が限定的 |

## 結果
- 5エンドポイントが正常に動作
- テストカバレッジが確保された
```

**必ず `docs/INDEX.md` も更新します。**

### Step 4: コミット → PR → マージ

```bash
# ステージング（追加したファイルを個別に指定する）
git add app/api/tasks.py app/crud/task.py app/main.py \
        app/tests/test_api_tasks.py \
        docs/decisions/2026-03-12-crud-api-implementation.md \
        docs/INDEX.md

# コミット（Conventional Commits で）
git commit -m "feat: タスク管理CRUD API実装

5つのCRUDエンドポイントとpytestテストを追加。

Closes #4"

# プッシュ
git push -u origin feature/4-crud-api

# PR 作成
gh pr create --title "feat: タスク管理CRUD API実装 #4" --body "..."

# マージ
gh pr merge --merge --delete-branch

# main に戻る
git checkout main && git pull origin main
```

---

## 具体例 ②：インフラを変更する（Terraform）

> **実例: ECS タスク定義に OpenAI APIキーの注入を追加（Issue #40, PR #45）**
>
> Secrets Manager に保存した OpenAI API キーを、ECS コンテナの環境変数として渡せるようにした。

### Step 1: 変更箇所を特定する

「OpenAI API キーをコンテナに渡す」ために必要な変更を洗い出します。

```
考えること:
1. キーはどこに保存する？ → Secrets Manager（既存パターンに合わせる）
2. コンテナにどう渡す？  → ECS タスク定義の secrets ブロック
3. 権限は必要？         → IAM の secrets_arns リストに追加すれば自動付与
4. ローカル開発は？      → docker-compose.yml で .env から読み込み
```

### Step 2: Terraform ファイルを編集する

**変数の追加** — `infra/modules/compute/variables.tf`:
```hcl
variable "openai_secret_arn" {
  description = "OpenAI APIキーのSecrets Manager ARN"
  type        = string
  default     = ""    # ← デフォルト空文字で、既存環境に影響を与えない
}
```

**タスク定義の変更** — `infra/modules/compute/main.tf`:
```hcl
# secrets ブロックに条件付きで追加
secrets = concat(
  [
    {
      name      = "DATABASE_URL"
      valueFrom = "${var.db_secret_arn}:host::"
    }
  ],
  var.openai_secret_arn != "" ? [
    {
      name      = "OPENAI_API_KEY"
      valueFrom = var.openai_secret_arn
    }
  ] : []
)
```

**ポイント:**
- `default = ""` と `!= ""` の条件分岐で、既存環境（`openai_secret_arn` を指定していない環境）への影響をゼロにしている
- IAM モジュールは `secrets_arns` リストで権限管理しているため、呼び出し元で ARN を追加するだけで権限が自動付与される（IAM モジュール自体の変更は不要）

### Step 3: ローカル開発環境も合わせて更新

```yaml
# docker-compose.yml に追加
services:
  app:
    env_file:
      - .env          # ← .env から OPENAI_API_KEY を読み込み
```

```bash
# .env.example に追記
OPENAI_API_KEY=sk-your-api-key-here
OPENAI_MODEL=gpt-4o-mini
```

### Step 4: 動作確認 → ADR → PR

```bash
# Terraform の構文チェック（AWSアカウントがなくてもできる）
cd infra/environments/dev
terraform init      # 初回のみ
terraform validate  # 構文エラーがないか確認

# ADR を書く → INDEX.md を更新 → コミット → PR → マージ
```

---

## 具体例 ③：フロントエンドに画面を追加する

> **実例: タスク管理 UI の実装（Issue #33, PR #37）**
>
> タスクの一覧・作成・編集・削除の画面を Next.js App Router で作成した。

### Step 1: ページ構成を設計する

App Router はファイルベースルーティングなので、ディレクトリ構造 = URL 構造です。

```
frontend/src/app/tasks/
├── page.tsx          →  /tasks        （一覧）
├── new/page.tsx      →  /tasks/new    （新規作成）
├── [id]/page.tsx     →  /tasks/123    （詳細・編集）
├── actions.ts        →  Server Actions（フォーム送信処理）
├── loading.tsx       →  ローディング表示
└── error.tsx         →  エラー表示
```

### Step 2: Server Component と Client Component を使い分ける

```
Server Component（デフォルト）
  → データ取得、初回表示、SEO
  → 例: page.tsx（一覧・詳細ページ）

Client Component（"use client" を宣言）
  → ユーザー操作、状態管理、ブラウザ API
  → 例: DeleteButton（confirm ダイアログ）、ExplainButton（SSE受信）
```

**実際のコード例** — タスク一覧（Server Component）:
```tsx
// frontend/src/app/tasks/page.tsx
export default async function TaskListPage() {
  const tasks = await taskApi.list();  // サーバー側でデータ取得
  return (
    <ul>
      {tasks.map((task) => (
        <li key={task.id}>{task.title}</li>
      ))}
    </ul>
  );
}
```

**実際のコード例** — 削除ボタン（Client Component）:
```tsx
// frontend/src/components/delete-button.tsx
"use client";
export function DeleteButton({ action }) {
  const handleDelete = async () => {
    if (!confirm("このタスクを削除しますか？")) return;
    await action();
  };
  return <button onClick={handleDelete}>削除</button>;
}
```

### Step 3: 共通コンポーネントを作る

再利用可能な部品は `frontend/src/components/` に配置:

| コンポーネント | 用途 | 利用箇所 |
|-------------|------|---------|
| `TaskForm` | タスクのフォーム（作成/編集兼用） | new/page.tsx, [id]/page.tsx |
| `TaskStatusBadge` | ステータス表示バッジ | page.tsx |
| `DeleteButton` | 確認ダイアログ付き削除 | [id]/page.tsx |
| `ExplainButton` | AI 解説（SSE受信） | [id]/page.tsx |

### Step 4: テストを書く

```bash
cd frontend
npm run test    # Vitest + React Testing Library
```

テストは `*.test.tsx` ファイルで、コンポーネントと同じディレクトリに配置。

---

## 具体例 ④：複数レイヤーにまたがる大きな機能を作る

> **実例: OpenAI API を使ったタスク解説機能（Issue #39〜#43）**
>
> 「タスクの状況を AI が解説する」機能を、仕様定義からフロントエンドまで 5 つの Issue に分割して実装した。

### 大きな機能は Issue を分割する

一つの大きな Issue で全部やると、PR が巨大になり、レビューが困難になります。
**レイヤーごとに Issue を分けて、依存順に実装** するのがコツです。

```
#39 [Spec] ADR作成（仕様定義）
 │   └── 設計方針を決めて docs/decisions/ に記録
 │
 ├── #40 [Impl] Terraform（インフラ）
 │    └── Secrets Manager → ECS へのキー注入
 │
 ├── #41 [Impl] FastAPI（バックエンド）
 │    └── POST /tasks/{id}/explain エンドポイント
 │
 ├── #42 [Impl] pytest（テスト）
 │    └── モック化、CI 安定性確認
 │
 └── #43 [Impl] Next.js（フロントエンド）
      └── ExplainButton + SSE ストリーミング描画
```

### 分割の考え方

| 分割基準 | 理由 |
|---------|------|
| レイヤーごと（infra / backend / test / frontend） | 各 PR が小さくなりレビューしやすい |
| 仕様（Spec）を先に分離 | 設計を先に合意してから実装に入れる |
| テストを独立 Issue に | テスト方針（モック戦略等）を明確に議論できる |

### 実行順序が重要

依存関係を考慮して順番に進めます:

```
#39（仕様）→ #40（インフラ）→ #41（バックエンド）→ #42（テスト）→ #43（フロントエンド）

理由:
- バックエンドは環境変数（OPENAI_API_KEY）が必要 → インフラが先
- テストはバックエンドのコードが必要 → バックエンドが先
- フロントエンドはバックエンドの API が必要 → バックエンドが先
```

### 各 Issue の成果物

| Issue | ブランチ | 主な成果物 |
|-------|---------|----------|
| #39 | `spec/39-openai-api-integration-adr` | ADR 1件 |
| #40 | `feature/40-terraform-openai-secret` | Terraform変更 + docker-compose更新 + ADR |
| #41 | `feature/41-fastapi-openai-endpoint` | エンドポイント + サービス層 + DI + ADR |
| #42 | `feature/42-openai-tests-mock` | テスト 7件 + ADR |
| #43 | `feature/43-explain-ui` | コンポーネント + テスト 3件 + ADR |

**計 5 PR、各 PR がコンパクトで、それぞれに ADR が付いている。**

---

## ブランチ命名規則

| 接頭辞 | 用途 | 例 |
|-------|------|-----|
| `feature/` | 新機能・機能追加 | `feature/4-crud-api` |
| `fix/` | バグ修正 | `fix/15-null-pointer-error` |
| `spec/` | 仕様定義・ADR のみ | `spec/39-openai-api-integration-adr` |
| `docs/` | ドキュメント変更 | `docs/development-policy` |
| `chore/` | 設定・依存関係の更新 | `chore/update-dependencies` |

**パターン:** `{接頭辞}/{Issue番号}-{英語の短い説明}`

---

## コミットメッセージの書き方

[Conventional Commits](https://www.conventionalcommits.org/) に従います。

```
{type}: {日本語の簡潔な説明}

{詳細な説明（任意）}

Closes #{Issue番号}
```

**type の一覧:**

| type | 用途 | 例 |
|------|------|-----|
| `feat` | 新機能 | `feat: タスク管理CRUD API実装` |
| `fix` | バグ修正 | `fix: NULL許容カラムのバリデーション修正` |
| `docs` | ドキュメント | `docs: OpenAI API統合方針ADR作成` |
| `test` | テスト | `test: 削除エンドポイントのテスト追加` |
| `chore` | 雑務・設定 | `chore: Ruff設定をpyproject.tomlに追加` |
| `refactor` | リファクタリング | `refactor: DI構成をdependenciesに分離` |
| `ci` | CI/CD | `ci: Vitestをfrontend-lintジョブに追加` |

---

## ADR（設計判断記録）の書き方

**ADR = 「なぜそう作ったか」を未来の自分やチームメンバーに残す記録。**

### いつ書く？

- Issue を完了するとき（必須）
- アーキテクチャ上の重要な判断をしたとき

### どこに置く？

```
docs/decisions/2026-03-12-{英語kebab-case}.md
```

### テンプレート

```markdown
---
title: {日本語タイトル}
description: {1行の概要}
tags: [ADR, 関連技術1, 関連技術2]
---

# {日本語タイトル}

## 背景
なぜこの判断が必要だったか。「〜が必要だった」形式で書く。

## 決定内容
何を採用し、どう実装したか。箇条書きで具体的に。

## 代替案
| 案 | 却下理由 |
|---|---------|
| 代替案A | なぜ採用しなかったか |
| 代替案B | なぜ採用しなかったか |

## 結果
この決定による具体的な効果・トレードオフ。
```

### 良い ADR の例（実際の記録から抜粋）

`docs/decisions/2026-03-12-openai-api-integration.md` より:

> **背景:** タスク管理アプリケーションにおいて、個々のタスクの状況をLLMが解説する機能が求められた。セキュリティ・コスト・UX・テスト安定性の観点から設計方針を定める必要があった。
>
> **決定内容:**
> - OpenAI API の呼び出しは FastAPI バックエンドに集約する
> - フロントエンド（Next.js）に API キーを持たせない
> - SSE ストリーミングで体感待ち時間を最小化する
>
> **代替案:**
> | 案 | 却下理由 |
> |---|---------|
> | Next.js 側で OpenAI API を直接呼び出し | API キーがクライアントに露出するセキュリティリスク |
> | WebSocket | SSE で十分（サーバー→クライアントの片方向通信） |
>
> **結果:** セキュリティ・UX・テスト安定性・保守性のバランスが取れた設計となった。

### ADR を書いたら必ずやること

```bash
# docs/INDEX.md に1行追加
| `docs/decisions/2026-03-12-xxx.md` | タイトル | タグ |
```

---

## よくある質問

### Q: 小さなバグ修正でも Issue を作るべき？

軽微なバグ修正やタイポ修正は、仕様定義（Phase 1）を省略して直接実装から始めてOKです（POLICY.md 例外規定）。ただし、Issue は作った方がログとして残るのでおすすめです。

### Q: ADR は本当に毎回書く必要がある？

はい。ただし大げさに書く必要はありません。「背景1〜2行、決定内容箇条書き、代替案1〜2行、結果1〜2行」で十分です。未来の自分が「なんでこうしたんだっけ？」と迷わないことが目的です。

### Q: Terraform を触ったことがないけど、バックエンドやフロントエンドだけ開発していい？

もちろんOKです。`infra/` を触らなければ Terraform の知識は不要です。ローカル開発は `docker compose up -d` だけで動きます。

### Q: 依存する Issue が完了していない場合は？

待ちます。無理に並行して進めると、マージ時にコンフリクトが発生しやすくなります。依存順序を守って順番に進めるのが安全です。

### Q: PR のサイズの目安は？

**変更ファイル 10 以下、差分 300 行以下** が理想です。大きくなりそうなら Issue を分割してください（具体例④のパターン）。

### Q: テストはどこまで書けばいい？

- バックエンド: 各エンドポイントの正常系 + 主要な異常系（404、422）
- フロントエンド: 各コンポーネントの表示確認 + ユーザー操作（クリック等）
- 外部 API 連携: 必ずモック化（OpenAI の例を参考に）

---

## このリポジトリの成長の軌跡

参考として、本リポジトリがどのような順序で構築されたかを示します。

```
Phase 1: 基盤構築
  #1  リポジトリ基盤セットアップ（pyproject.toml, Dockerfile）
  #2  FastAPI アプリケーション基盤（main.py, DI, 非同期）
  #3  DB モデル + Pydantic スキーマ + Alembic
  #4  タスク管理 CRUD API

Phase 2: インフラ（Terraform）
  #5  Terraform 基盤（モジュール構成, tfstate 管理）
  #6  VPC・ネットワークモジュール
  #7  RDS・Secrets Manager
  #8  ECS Fargate・ALB
  #12 ECR・IAM・OIDC

Phase 3: CI/CD
  #9  CI パイプライン（Ruff, mypy, pytest）
  #10 CD パイプライン（Terraform plan, tflint, tfsec）
  #11 ローカル開発環境（docker-compose.yml）
  #13 デプロイワークフロー（ECR → ECS）

Phase 4: フロントエンド
  #28 Next.js 初期セットアップ
  #31 Tailwind CSS 導入
  #32 API クライアント構築
  #33 タスク管理 UI（一覧・作成・編集・削除）
  #34 テスト基盤（Vitest + Testing Library + MSW）

Phase 5: AI 機能
  #39 OpenAI API 統合方針 ADR
  #40 Terraform（Secrets Manager → ECS）
  #41 FastAPI エンドポイント（SSE ストリーミング）
  #42 テスト（モック化）
  #43 フロントエンド UI（SSE 描画）
```

**次に追加するなら？（例）**

- 認証・認可（NextAuth.js + JWT）
- タスクの優先度・期限フィールド追加
- ダッシュボード（統計・グラフ表示）
- E2E テスト（Playwright）
- CDN + カスタムドメイン（CloudFront + Route 53）
- 通知機能（Slack / メール連携）
