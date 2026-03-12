---
title: CIパイプライン構築（Ruff・mypy・pytest）
description: PR作成時に自動実行されるコード品質チェックパイプラインの設計判断
tags: [ADR, CI/CD, GitHub Actions, Ruff, mypy, pytest]
---

# CIパイプライン構築（Ruff・mypy・pytest）

## 背景

コード品質を継続的に担保するため、PR作成時に自動でlint・型チェック・テストを実行する仕組みが必要だった。Issue駆動開発でPRを細かく作成する運用のため、早期にCIを導入することでフィードバックループを短縮する。

## 決定内容

- GitHub Actionsで3つのジョブを並列実行: `lint`（Ruff）、`typecheck`（mypy）、`test`（pytest）
- トリガー: `app/`・`pyproject.toml`・CI設定ファイルの変更時のみ（pathsフィルター）
- CIが動作確認できるよう、最小限のヘルスチェックエンドポイントとテストを同時に追加

## 代替案

| 案 | 却下理由 |
|---|---------|
| pre-commit hookで品質チェック | ローカル環境依存になり、CI上での一貫性が保証できない |
| 単一ジョブで全チェック実行 | 並列実行の方がフィードバックが速い。失敗箇所も特定しやすい |
| Ruff以外のlinter（flake8+isort+black） | Ruffが全機能を統合しており、設定・実行速度ともに優れる |

## 結果

- PR作成・更新のたびにコード品質が自動検証される
- 3ジョブ並列により、失敗箇所が即座に特定できる
- `app/` 配下の変更時のみ実行されるため、Terraform変更では無駄に走らない
