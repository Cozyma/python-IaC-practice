# CLAUDE.md

## プロジェクト規約

- コミット前に必ず `docs/docs-and-testing-policy.md` を参照し、以下を確認すること:
  - ドキュメント命名規則・Frontmatter規約に準拠しているか
  - Issue完了時にADR（`docs/decisions/`）を作成したか
  - `docs/INDEX.md` を更新したか
- コミットメッセージは Conventional Commits（`feat:`, `fix:`, `chore:`, `docs:` 等）を使用する
- 自動コミット禁止（明示的に指示された場合のみ実行）

## 技術スタック

- バックエンド: FastAPI, SQLAlchemy (async), Alembic, Pydantic
- インフラ: Terraform (AWS: VPC, ECS Fargate, RDS, ALB)
- CI/CD: GitHub Actions
- 品質管理: Ruff, mypy, pytest
