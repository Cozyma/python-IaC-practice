---
title: 認証機能設計方針（JWT認証）
description: ログイン機能の認証方式・セキュリティ設計の判断記録
date: 2026-03-12
status: accepted
tags: [ADR, 認証, JWT, bcrypt, セキュリティ, FastAPI, Next.js]
---

# 認証機能設計方針（JWT認証）

## ステータス

Accepted

## コンテキスト

タスク管理APIにユーザー認証を導入し、タスクの所有権管理とアクセス制御を実現する必要がある。
本プロジェクトはECS Fargate上で動作するステートレスなAPIであり、スケーラビリティとセキュリティの両立が求められる。

## 決定

### 認証方式: JWT (JSON Web Token)

| 項目 | 決定 |
|---|---|
| Access Token | 短寿命（15分）、`Authorization: Bearer` ヘッダーで送信 |
| Refresh Token | 長寿命（7日）、httpOnly Cookie で管理 |
| パスワードハッシュ | bcrypt（passlib[bcrypt]） |
| JWTライブラリ | python-jose[cryptography] |
| 署名アルゴリズム | HS256 |
| 秘密鍵管理 | ローカル: `.env`、本番: AWS Secrets Manager |

### 代替案の比較

| 方式 | メリット | デメリット | 判定 |
|---|---|---|---|
| **JWT（採用）** | ステートレス、ECSスケーリング対応、学習に最適 | トークン失効の即時反映が困難 | ✅ |
| セッションベース | シンプル、即時失効可能 | ステートフル、Redis等が必要、Fargate不向き | ❌ |
| AWS Cognito | マネージド、OAuth2/OIDC対応 | 無料枠超過でコスト発生、学習目的には過剰 | ❌ |
| NextAuth.js単体 | フロントエンド統合が容易 | バックエンドAPI保護が別途必要 | ❌ |

### セキュリティ設計

- **CORS**: 認証導入後も `localhost:3000`, `localhost:3100` のみ許可（本番は ALB ドメイン）
- **パスワードポリシー**: 最小8文字
- **Refresh Token**: httpOnly + Secure（本番）+ SameSite=Lax
- **Access Token**: メモリ保持（localStorage不使用 → XSS対策）

### エンドポイント設計

| Method | Path | 認証 | 説明 |
|--------|------|------|------|
| POST | `/auth/register` | 不要 | ユーザー登録 |
| POST | `/auth/login` | 不要 | ログイン |
| POST | `/auth/refresh` | Cookie | トークンリフレッシュ |
| GET | `/auth/me` | Bearer | 現在ユーザー取得 |
| POST | `/auth/logout` | 不要 | Cookie削除 |

### データモデル

```
users
├── id: int (PK)
├── email: str (unique, indexed)
├── username: str (unique, indexed)
├── hashed_password: str
├── is_active: bool (default: true)
├── created_at: datetime
└── updated_at: datetime

tasks (既存 + 拡張)
├── ... 既存カラム
└── user_id: int (FK → users.id, nullable)
```

### 影響範囲

- **DB**: Userモデル追加、Taskモデルにuser_id FK追加
- **API**: 認証エンドポイント追加、既存ルート保護
- **Frontend**: ログイン/登録UI、認証コンテキスト、ルート保護
- **Terraform**: JWT秘密鍵のSecrets Manager管理

## 結果

全レイヤーにまたがる変更となるが、既存のDIパターン（`Depends()`）を踏襲することで
一貫性を保ちつつ段階的に導入可能。
