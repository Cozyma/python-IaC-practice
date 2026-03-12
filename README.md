# python-IaC-practice

クラウドネイティブなタスク管理APIと、そのインフラをIaC（Terraform）で定義するモノレポプロジェクト。

## アーキテクチャ

```
Client → Next.js (SSR) → ALB → ECS (Fargate) → RDS (PostgreSQL)
                                     │
                                     └── FastAPI (Python 3.12)
```

### 技術スタック

| レイヤー | 技術 |
|---------|------|
| フロントエンド | Next.js 15 (App Router), TypeScript |
| バックエンド | FastAPI, SQLAlchemy, Alembic, Pydantic |
| インフラ (AWS) | VPC, ECS (Fargate), RDS (PostgreSQL), ALB, ECR |
| IaC | Terraform (モジュール分割) |
| CI/CD | GitHub Actions |
| 品質管理 | Ruff, mypy, pytest, ESLint, Prettier |

## ディレクトリ構成

```
.
├── .github/workflows/        # CI/CD パイプライン
├── app/                       # FastAPI アプリケーション
│   ├── api/                   # ルーティング
│   ├── crud/                  # DB操作
│   ├── models/                # SQLAlchemy モデル
│   ├── schemas/               # Pydantic スキーマ
│   ├── tests/                 # pytest
│   └── alembic/               # マイグレーション
├── frontend/                  # Next.js (App Router)
│   └── src/app/               # App Router ページ
├── infra/                     # Terraform
│   ├── environments/          # 環境別設定 (dev/prod)
│   └── modules/               # 再利用可能モジュール
├── pyproject.toml
├── Dockerfile
└── docker-compose.yml
```

## セットアップ

### 必要なツール

- Python 3.12+
- Node.js 22+
- Docker / Docker Compose
- Terraform 1.5+

### ローカル起動

```bash
cp .env.example .env
docker compose up -d
```

### 開発用コマンド

```bash
# 依存インストール
pip install -e ".[dev]"

# Lint / Format
ruff check .
ruff format .

# 型チェック
mypy app/

# テスト
pytest

# --- フロントエンド ---
cd frontend
npm install
npm run dev       # http://localhost:3000
npm run lint
npm run format:check
```
