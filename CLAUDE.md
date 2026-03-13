# CLAUDE.md

## プロジェクト規約

- コミット前に必ず以下のポリシーを参照すること:
  - `docs/POLICY.md` — 開発ワークフロー（Doc First → Implementation の2フェーズ）
  - `docs/docs-and-testing-policy.md` — ドキュメント管理規約・ADRフォーマット・テスト方針
- 確認事項:
  - ドキュメント命名規則・Frontmatter規約に準拠しているか
  - Issue完了時にADR（`docs/decisions/`）を作成したか
  - `docs/INDEX.md` を更新したか
  - 仕様ドキュメントと実装に乖離がないか（SSOT原則）
- コミットメッセージは Conventional Commits（`feat:`, `fix:`, `chore:`, `docs:` 等）を使用する
- 自動コミット禁止（明示的に指示された場合のみ実行）

## コミット前チェック（必須）

コミット前に以下のコマンドを実行し、全てパスすることを確認する。

**バックエンド（Python）:**
```bash
docker compose exec app ruff check .
docker compose exec app ruff format --check .
docker compose exec app mypy app/ --ignore-missing-imports
docker compose exec app pytest --tb=short -q
```

**フロントエンド（Next.js）:**
```bash
docker compose exec frontend npm run lint
docker compose exec frontend npm run format:check
```

エラーがある場合は修正してからコミットすること。自動修正コマンド:
```bash
docker compose exec app ruff check --fix .
docker compose exec app ruff format .
docker compose exec frontend npx prettier --write .
```

## 技術スタック

- フロントエンド: Next.js 15 (App Router), TypeScript
- バックエンド: FastAPI, SQLAlchemy (async), Alembic, Pydantic
- インフラ: Terraform (AWS: VPC, ECS Fargate, RDS, ALB)
- CI/CD: GitHub Actions
- 品質管理: Ruff, mypy, pytest, ESLint, Prettier
