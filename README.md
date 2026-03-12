# python-IaC-practice

クラウドネイティブなタスク管理アプリケーションと、そのインフラをコード（Terraform）で定義・管理するモノレポプロジェクト。
フロントエンド（Next.js）・バックエンド（FastAPI）・インフラ（AWS）・CI/CD（GitHub Actions）を一つのリポジトリで完結させ、実務に近いフルスタック開発フローを体験できる。

---

## 全体アーキテクチャ

```
ユーザー
  │
  ▼
┌──────────────────┐
│  Next.js (SSR)   │  ← フロントエンド（React / App Router）
│  localhost:3000   │
└────────┬─────────┘
         │ HTTP (fetch / SSE)
         ▼
┌──────────────────┐
│  ALB             │  ← ロードバランサー（HTTPS→HTTP振り分け）
│  (公開サブネット)  │
└────────┬─────────┘
         │ port 8000
         ▼
┌──────────────────┐     ┌──────────────────┐
│  ECS Fargate     │────▶│  RDS PostgreSQL  │
│  (FastAPI)       │     │  (プライベート)    │
│  (プライベート)    │     └──────────────────┘
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  OpenAI API      │  ← タスク解説機能（SSEストリーミング）
└──────────────────┘
```

### 技術スタック

| レイヤー | 技術 | 役割 |
|---------|------|------|
| フロントエンド | Next.js 15 (App Router), TypeScript, Tailwind CSS | タスク管理UI、SSEストリーミング表示 |
| バックエンド | FastAPI, SQLAlchemy (async), Alembic, Pydantic | REST API、DBマイグレーション、OpenAI連携 |
| データベース | PostgreSQL 16 | タスクデータの永続化 |
| コンテナ | Docker, ECR | アプリケーションのコンテナ化・イメージ管理 |
| インフラ (AWS) | VPC, ECS Fargate, RDS, ALB, Secrets Manager | クラウド実行環境 |
| IaC | Terraform | インフラのコード管理（後述で詳しく解説） |
| CI/CD | GitHub Actions (OIDC認証) | 自動テスト・デプロイ |
| 品質管理 | Ruff, mypy, pytest, ESLint, Prettier, Vitest | コード品質・テスト |

---

## ディレクトリ構成

```
.
├── .github/
│   ├── workflows/
│   │   ├── ci.yml              # CI: Ruff, mypy, pytest, ESLint, Prettier, Vitest
│   │   ├── cd.yml              # CD: Terraform plan, tflint, tfsec
│   │   └── deploy.yml          # デプロイ: ECR push → Alembic migrate → ECS更新
│   ├── ISSUE_TEMPLATE/         # Issue テンプレート（仕様/実装/バグ）
│   └── pull_request_template.md
│
├── app/                        # FastAPI バックエンド
│   ├── api/tasks.py            # エンドポイント（CRUD + AI解説）
│   ├── crud/task.py            # DB操作（非同期）
│   ├── models/task.py          # SQLAlchemy モデル
│   ├── schemas/task.py         # Pydantic スキーマ + TaskStatus
│   ├── services/               # ビジネスロジック
│   │   └── task_explainer.py   # OpenAI SSEストリーミング
│   ├── dependencies/           # DI（依存性注入）
│   │   └── openai.py           # OpenAIクライアント
│   ├── alembic/                # DBマイグレーション
│   ├── tests/                  # pytest テスト
│   ├── config.py               # 環境変数設定
│   ├── database.py             # AsyncSession
│   └── main.py                 # FastAPIアプリ
│
├── frontend/                   # Next.js フロントエンド
│   └── src/
│       ├── app/
│       │   ├── tasks/          # タスク管理ページ群
│       │   │   ├── page.tsx    # 一覧（Server Component）
│       │   │   ├── new/        # 新規作成
│       │   │   ├── [id]/       # 詳細・編集 + AI解説
│       │   │   ├── actions.ts  # Server Actions
│       │   │   ├── loading.tsx # ローディング状態
│       │   │   └── error.tsx   # エラーバウンダリ
│       │   └── globals.css     # Tailwind CSS テーマ
│       ├── components/         # UIコンポーネント
│       ├── lib/api.ts          # APIクライアント + SSE
│       ├── types/task.ts       # TypeScript 型定義
│       └── test/               # Vitest テストユーティリティ
│
├── infra/                      # Terraform（★ 後述で詳しく解説）
│   ├── modules/                # 再利用可能なインフラ部品
│   │   ├── network/            # VPC・サブネット・セキュリティグループ
│   │   ├── database/           # RDS PostgreSQL・Secrets Manager
│   │   ├── compute/            # ECS Fargate・ALB・CloudWatch
│   │   ├── ecr/                # コンテナイメージ保管庫
│   │   └── iam/                # 権限管理・GitHub OIDC
│   └── environments/           # 環境ごとの設定
│       ├── dev/                # 開発環境
│       └── prod/               # 本番環境
│
├── docs/                       # ドキュメント
│   ├── POLICY.md               # 開発ポリシー（仕様駆動ワークフロー）
│   ├── decisions/              # ADR（設計判断記録）
│   └── INDEX.md                # ドキュメント索引
│
├── docker-compose.yml          # ローカル開発環境
├── Dockerfile
├── pyproject.toml              # Python依存関係・ツール設定
└── .env.example                # 環境変数テンプレート
```

---

## セットアップ

### 必要なツール

| ツール | バージョン | 用途 |
|--------|----------|------|
| Python | 3.12+ | バックエンド |
| Node.js | 22+ | フロントエンド |
| Docker / Docker Compose | 最新 | ローカル開発環境 |
| Terraform | 1.5+ | インフラ管理（AWS操作時のみ） |

### ローカル起動（Docker Compose）

```bash
# 1. 環境変数ファイルを作成
cp .env.example .env
# .env を編集して OPENAI_API_KEY を設定（AI解説機能を使う場合）

# 2. 全サービスを起動（FastAPI + Next.js + PostgreSQL）
docker compose up -d

# 3. アクセス
# バックエンド API:    http://localhost:8000
# フロントエンド:       http://localhost:3000
# API ドキュメント:     http://localhost:8000/docs（Swagger UI）
```

### 開発用コマンド

```bash
# === バックエンド ===
pip install -e ".[dev]"       # 依存インストール
ruff check .                  # Lint
ruff format .                 # フォーマット
mypy app/                     # 型チェック
pytest                        # テスト実行

# === フロントエンド ===
cd frontend
npm install                   # 依存インストール
npm run dev                   # 開発サーバー (http://localhost:3000)
npm run lint                  # ESLint
npm run format:check          # Prettier チェック
npm run test                  # Vitest テスト実行
```

---

## API エンドポイント

| メソッド | パス | 説明 |
|---------|------|------|
| `GET` | `/tasks` | タスク一覧取得 |
| `GET` | `/tasks/{id}` | タスク詳細取得 |
| `POST` | `/tasks` | タスク作成 |
| `PUT` | `/tasks/{id}` | タスク更新 |
| `DELETE` | `/tasks/{id}` | タスク削除 |
| `POST` | `/tasks/{id}/explain` | AI によるタスク状況の解説（SSE） |
| `GET` | `/health` | ヘルスチェック |

### AI 解説機能

`POST /tasks/{id}/explain` は Server-Sent Events（SSE）でストリーミング応答を返します。
OpenAI API（デフォルト: `gpt-4o-mini`）がタスクの状況を解説し、次のアクション提案を行います。

```bash
# curl でストリーミングを確認
curl -N -X POST http://localhost:8000/tasks/1/explain
```

---

## Terraform（IaC）詳細解説

> **IaC（Infrastructure as Code）とは？**
> サーバーやネットワークなどのインフラを、手動でAWSコンソールをポチポチ操作するのではなく、**コード（`.tf` ファイル）で定義して管理する手法**です。
> Terraform はその代表的なツールで、コードを書くだけでAWSリソースの作成・変更・削除を自動化できます。

### なぜ Terraform を使うのか

| 課題 | Terraform で解決 |
|------|----------------|
| 「この設定、誰がいつ変えた？」 | コードなので Git で履歴管理できる |
| 「本番と開発で設定が違う…」 | 同じコードから環境別に生成できる |
| 「手順書通りにやったのに動かない」 | `terraform apply` で毎回同じ結果になる |
| 「インフラの全体像がわからない」 | コードを読めば構成が分かる |

### 基本的な使い方（3つのコマンド）

```bash
cd infra/environments/dev    # 操作したい環境に移動

terraform init               # 初回のみ: プラグインのダウンロード
terraform plan               # 変更内容のプレビュー（実際には何も変わらない）
terraform apply              # 実際にAWSリソースを作成・変更する
```

- `plan` は「こう変わりますよ」と表示するだけで安全
- `apply` で初めてAWSに反映される
- 怖い場合はまず `plan` だけ実行して確認すればOK

### モジュール構成（infra/modules/）

Terraform の「モジュール」は **インフラの部品** です。レゴブロックのように組み合わせて使います。

```
infra/modules/
├── network/    🌐 ネットワーク基盤
├── database/   🗄️ データベース
├── compute/    🖥️ アプリ実行環境
├── ecr/        📦 コンテナ保管庫
└── iam/        🔑 権限管理
```

#### 🌐 network（ネットワーク基盤）

**「アプリが住む街」を作るモジュール。** 道路（通信経路）と区画（サブネット）を設計します。

```
┌─── VPC（10.0.0.0/16）─────────────────────────────────────────┐
│                                                                │
│  ┌── AZ-a ──────────────────┐  ┌── AZ-c ──────────────────┐  │
│  │                          │  │                          │  │
│  │  パブリックサブネット       │  │  パブリックサブネット       │  │
│  │  10.0.1.0/24             │  │  10.0.2.0/24             │  │
│  │  [ALB] ← インターネット   │  │  [ALB]                   │  │
│  │                          │  │                          │  │
│  │  プライベートサブネット     │  │  プライベートサブネット     │  │
│  │  10.0.11.0/24            │  │  10.0.12.0/24            │  │
│  │  [ECS] [RDS]             │  │  [ECS] [RDS]             │  │
│  │                          │  │                          │  │
│  └──────────────────────────┘  └──────────────────────────┘  │
│                                                                │
│  インターネットゲートウェイ ← パブリックサブネットの出入口          │
│  NATゲートウェイ ← プライベートから外部への片道出口                │
└────────────────────────────────────────────────────────────────┘
```

**ポイント:**
- **パブリックサブネット**: インターネットから直接アクセスできる区画。ALB（ロードバランサー）を配置
- **プライベートサブネット**: インターネットから直接アクセスできない安全な区画。アプリ（ECS）とDB（RDS）を配置
- **2つの AZ（アベイラビリティゾーン）**: 片方のデータセンターが障害を起こしても、もう片方で動き続ける

**セキュリティグループ（通信のファイアウォール）:**

```
インターネット → [ALB SG: 80,443番ポートのみ許可]
                    → [ECS SG: ALBからの8000番ポートのみ許可]
                        → [RDS SG: ECSからの5432番ポートのみ許可]
```

必要な通信だけを許可するチェーン構造で、外部から直接DBにアクセスされることはありません。

#### 🗄️ database（データベース）

**タスクデータを保存する PostgreSQL データベース。**

| 設定 | dev（開発） | prod（本番） |
|------|-----------|------------|
| インスタンス | db.t3.micro | db.t3.micro |
| Multi-AZ（冗長化） | なし | あり |
| バックアップ保持期間 | 1日 | 7日 |
| ストレージ | 20GB〜100GB（自動拡張） | 20GB〜100GB（自動拡張） |
| 暗号化 | あり | あり |
| 削除時スナップショット | スキップ | 作成 |

**認証情報の管理:**
DB のユーザー名・パスワードは **AWS Secrets Manager** に保存されます。
コードやファイルにパスワードを直書きせず、ECS のコンテナ起動時に自動で環境変数として注入されます。

#### 🖥️ compute（アプリ実行環境）

**FastAPI アプリをコンテナで動かす ECS Fargate と、その手前のロードバランサー。**

```
ユーザー → ALB (port 80) → ECS Fargate (port 8000) → FastAPI アプリ
                                │
                                ├── 環境変数: APP_ENV, DEBUG
                                ├── シークレット: DATABASE_URL（Secrets Manager）
                                ├── シークレット: OPENAI_API_KEY（Secrets Manager、任意）
                                └── ログ → CloudWatch Logs
```

- **ECS Fargate**: サーバーの管理が不要なコンテナ実行環境。「コンテナを何個動かすか」だけ指定すれば、あとはAWSが面倒を見てくれる
- **ALB**: ユーザーからのリクエストを受け付けて、ECS コンテナに振り分ける。ヘルスチェック（`/health`）で異常なコンテナを自動除外
- **CloudWatch Logs**: アプリのログを保存（devは7日、prodは30日保持）

#### 📦 ecr（コンテナ保管庫）

**Docker イメージを保存する AWS のプライベートレジストリ。**

- Docker Hub の代わりに AWS 上にイメージを保管
- プッシュ時に自動で脆弱性スキャン
- 古いイメージは自動削除（最新10個を保持）

#### 🔑 iam（権限管理）

**「誰が何をできるか」を定義するモジュール。**

3つのロール（役割）を管理します:

| ロール | 誰が使う | できること |
|-------|---------|----------|
| ECS タスク実行ロール | ECS サービス | Secrets Manager 読み取り、CloudWatch ログ書き込み |
| ECS タスクロール | アプリケーション | アプリ固有の権限（現在は未設定） |
| GitHub Actions ロール | CI/CD パイプライン | ECR へのイメージプッシュ、ECS サービスの更新 |

**OIDC 認証:**
GitHub Actions から AWS を操作する際、従来はアクセスキー（パスワードのようなもの）を発行していましたが、このプロジェクトでは **OIDC（OpenID Connect）** を使用します。
GitHub が「自分は GitHub です」と証明し、AWS が「じゃあこの権限で使っていいよ」と一時的な認証を返す仕組みで、長期的なパスワード管理が不要になります。

### 環境管理（infra/environments/）

同じモジュール（部品）を使いながら、設定値だけを変えて dev と prod を管理します。

```
infra/environments/
├── dev/
│   ├── main.tf           # どのモジュールを使うか
│   ├── variables.tf      # 変数定義
│   ├── terraform.tfvars  # 実際の設定値（CIDR: 10.0.0.0/16）
│   └── outputs.tf        # 出力値
└── prod/
    ├── main.tf           # dev と同じモジュールを使用
    ├── variables.tf
    ├── terraform.tfvars  # 本番の設定値（CIDR: 10.1.0.0/16）
    └── outputs.tf
```

### tfstate（状態管理）

Terraform は「今 AWS にどんなリソースがあるか」を **tfstate ファイル** に記録します。

```
tfstate ファイル = 「設計図と実物の対応表」

例: "このコードの aws_vpc.main は、AWS上の vpc-abc123 のこと"
```

このファイルを S3 に保存し、DynamoDB で排他ロック（同時に2人が操作しない仕組み）をかけています。

```
S3 バケット: python-iac-practice-tfstate
├── dev/terraform.tfstate    ← 開発環境の状態
└── prod/terraform.tfstate   ← 本番環境の状態
```

### モジュール間の依存関係

モジュールは以下の順序で構築する必要があります（上の出力が下の入力になる）。

```
① network   ─── VPC, サブネット, セキュリティグループを作成
     │
     ├──────────────────┐
     ▼                  ▼
② iam              ③ ecr
   権限ロール作成       コンテナレジストリ作成
     │                  │
     ├──────────────────┤
     ▼                  ▼
④ database         ⑤ compute
   RDS + Secrets       ECS + ALB + CloudWatch
   Manager             （④の出力も使用）
```

---

## CI/CD パイプライン

### CI（継続的インテグレーション）— `ci.yml`

Pull Request や main push 時に自動実行:

| ジョブ | 内容 |
|-------|------|
| `lint` | Ruff（Python Lint + Format チェック） |
| `typecheck` | mypy（Python 型チェック） |
| `test` | pytest（バックエンドテスト） |
| `frontend-lint` | ESLint + Prettier + Vitest（フロントエンドテスト） |

### CD（継続的デリバリー）— `cd.yml`

`infra/**` の変更時に自動実行:

| ジョブ | 内容 |
|-------|------|
| `terraform-check` | `terraform fmt` / `validate` / `tflint` / `tfsec` / `plan` |

### デプロイ — `deploy.yml`

main ブランチへのマージ時に自動実行（3ステージ）:

```
① build-and-push   Docker イメージをビルドして ECR にプッシュ
        ↓
② migrate           Alembic マイグレーションを ECS Run Task で実行
        ↓
③ deploy            ECS サービスを新しいイメージで更新
```

---

## 開発ワークフロー

このプロジェクトは **仕様駆動 + Issue 駆動** のワークフローを採用しています。

```
1. Issue 作成（仕様定義 or 実装タスク）
2. ブランチ作成（feature/XX-description）
3. 実装 + テスト
4. ADR 作成（docs/decisions/ に設計判断を記録）
5. PR 作成 → レビュー → マージ
```

詳細は [docs/POLICY.md](docs/POLICY.md) を参照してください。
実際のコマンド例やコード例を含む具体的なガイドは [docs/guidelines/development-guide.md](docs/guidelines/development-guide.md) にあります。

---

## ドキュメント

| ファイル | 内容 |
|---------|------|
| [docs/POLICY.md](docs/POLICY.md) | 開発ポリシー（仕様駆動ワークフロー） |
| [docs/docs-and-testing-policy.md](docs/docs-and-testing-policy.md) | ドキュメント管理・テスト方針 |
| [docs/INDEX.md](docs/INDEX.md) | 全ドキュメント索引 |
| [docs/decisions/](docs/decisions/) | ADR（設計判断記録）— 22件 |
| [docs/guidelines/development-guide.md](docs/guidelines/development-guide.md) | 開発ガイド — 具体例付きの実践ガイド |
