# python-IaC-practice

クラウドネイティブなタスク管理APIと、そのインフラをIaC（Terraform）で定義するモノレポプロジェクト。

## アーキテクチャ

```
Client → ALB → ECS (Fargate) → RDS (PostgreSQL)
                  │
                  └── FastAPI (Python 3.12)
```

### 技術スタック

| レイヤー | 技術 |
|---------|------|
| バックエンド | FastAPI, SQLAlchemy, Alembic, Pydantic |
| インフラ (AWS) | VPC, ECS (Fargate), RDS (PostgreSQL), ALB, ECR |
| IaC | Terraform (モジュール分割) |
| CI/CD | GitHub Actions |
| 品質管理 | Ruff, mypy, pytest |

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
```
