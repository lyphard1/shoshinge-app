# GitHub への Push/Pull ガイド（実務向けの要点）

このドキュメントは、GitHub に push/pull する際の注意点と、日常フロー・トラブル時の対処を簡潔にまとめたものです。

## 前提と用語
- origin/main: GitHub 上の main ブランチ（既定のリモート・既定ブランチ）
- fetch: リモートの最新コミットやブランチ情報のみを取得（作業ツリーは変えない）
- pull: fetch + ローカルへの取り込み（merge か rebase）
- rebase: ローカルの変更を最新の履歴の先頭に積み直す（履歴が直線的になる）

## 推奨: 日常の基本フロー（rebase 前提）
1) 作業前にリモート同期
- git fetch --prune
- git pull --rebase
- git status -sb（差分と追跡状況を確認）

2) 変更 → コミット
- git add -p（変更の意味単位でステージング）
- git commit -m "短く要点を、英日どちらでもOK"

3) プッシュ前に再同期（競合予防）
- git fetch --prune
- git pull --rebase（behind があればこの時点で解消）

4) プッシュ
- git push

ヒント: 先に「behind」を解消してから push すれば、"non-fast-forward" による push 拒否を避けやすいです。

## よくあるエラーと対処
- non-fast-forward で push 拒否
  - 原因: リモートに自分の手元にない新しいコミットがある（behind）
  - 対処: git fetch → git pull --rebase → コンフリクトがあれば解消 → git push

- rebase/merge でコンフリクト発生
  - git status で衝突ファイルを確認
  - ファイルを編集して解消 → git add <file>
  - rebase 続行: git rebase --continue（merge の場合は git commit）
  - 中断したい: git rebase --abort

- 大きすぎるファイルで push 失敗
  - 100MB 超の単一ファイルは GitHub が拒否
  - Git LFS の利用を検討（音声・画像など大容量は注意）

- 認証エラー（2FA/トークン）
  - HTTPS の場合、Personal Access Token をパスワードとして使用
  - 期限切れ/権限不足に注意（必要スコープ: repo）

## 競合解消の最小手順（rebase 中）
1) git status で衝突ファイルを確認
2) エディタでマーカー <<<<<<<, =======, >>>>>>> を解消
3) git add <file>（全ファイル解消まで繰り返し）
4) git rebase --continue

## rebase と merge の使い分け（要点）
- rebase: 履歴が直線で読みやすい。個人開発や小規模の並行作業に向く
- merge: マージコミットで統合点を残す。大規模/明示的な統合作業に向く

チーム運用の一般則: フィーチャーブランチは rebase で main を取り込みつつ、最終統合は PR で squash merge（または rebase merge）

## push/pull を安全にする設定例
- pull を既定で rebase にする
  - git config --global pull.rebase true
- 不要なリモート追跡ブランチを自動掃除
  - git config --global fetch.prune true
- 新規 push 時に追跡設定を自動作成
  - git config --global push.autoSetupRemote true
- 既定ブランチ名を main に
  - git config --global init.defaultBranch main

## ブランチ運用の基本
- 作業は topic ブランチで（例: feature/wasan-layout）
- main は常にデプロイ可能な状態に保つ
- 統合は Pull Request（レビュー→CI→マージ）

## コミットメッセージ簡易ルール
- 50文字程度で要点（変更の目的 + 影響範囲）
- 例: "和讃: お経領域を中央寄せ＋高さ固定（最長句基準）"

## .gitignore と秘匿情報
- .env, 秘密鍵、個人トークンなどはコミットしない
- 大容量生成物（ビルド成果物、キャッシュ）は除外

## タグ/リリース（任意）
- バージョンタグ: git tag v1.0.0
- リモートへ: git push --tags

## チートシート
- 状態確認: git status -sb / git diff
- 直前コミット修正: git commit --amend（共有済み履歴には非推奨）
- 履歴の俯瞰: git log --oneline --graph --decorate --all
- 一時退避: git stash / git stash pop
- 個別適用: git cherry-pick <commit>

## トラブル時の最後の手段（注意）
- ローカルをリモートに強制合わせ
  - git fetch origin
  - git reset --hard origin/main（ローカルの未保存変更は失われます）
- 1ファイルだけ元に戻す
  - git restore --source=origin/main -- path/to/file

## 参考: 乖離の例と解決
- 状態: "ahead 1, behind 3"（自分のコミットが1つ進んでいるが、リモートには3つ新しいコミットがある）
- 解決: git fetch → git pull --rebase → コンフリクト解消 → git push

---
このガイドは `docs/git_push_pull_guide.md` にあります。運用方針に合わせて随時更新してください。

## Pull Request（PR）運用の要点（推奨）
- ブランチ命名: `feature/<概要>`, `fix/<概要>`, `chore/<概要>`
- 小さく頻繁にPR（レビューしやすく、コンフリクトを減らす）
- マージ戦略: Squash merge（履歴を1コミットに集約） or Rebase merge（直線化）
- PR説明テンプレ（例）
  - 目的/背景
  - 変更点（UI/仕様差分、影響範囲）
  - 動作確認手順（スクショ/動画/URL）
  - リスク・懸念点（必要なら）

## Pre-push チェックリスト（手動）
1) `git status -sb`（未コミット/未追跡ファイルの確認）
2) `git fetch --prune` → `git pull --rebase`（behind 解消）
3) ドキュメント更新（README/CHANGELOG/スクショ）
4) バイナリや一時ファイルが混ざっていないか再確認（.gitignore 対応）
5) ローカルで動作確認（最低限のスモークテスト）

（任意）Git hooks で自動化: pre-commit でフォーマット/Spellチェック、pre-push で簡易テストを実行

## 大容量ファイル対策: Git LFS（任意）
音声・画像などが増える場合は LFS を検討。

```bash
# 初期設定（マシン1回）
brew install git-lfs  # macOS（Homebrew）
git lfs install

# このリポジトリで LFS 対象を登録
git lfs track "audio/*.mp3"
git lfs track "audio/*.m4a"
git lfs track "image/*.png"

# ルートに .gitattributes が作成/更新されるのでコミット
git add .gitattributes
git commit -m "chore: enable Git LFS for audio and images"
```

注意:
- 既にGitにフルで履歴追加された大きいファイルは、履歴から除去しない限り容量は減らない（`git filter-repo` 等が必要）。
- LFS はGitHub側でも有料クォータ考慮が必要な場合あり。

## .gitignore と .gitattributes の例
`.gitignore`（提案）:
```
# macOS
.DS_Store

# エディタ/一時
.vscode/
*.log
*.tmp
*.bak
~$*

# ビルド/出力（該当する場合）
dist/
build/

# 生成されるバックアップHTMLがあればパターン化
*backup*.html
```

`.gitattributes`（行末/EOL・LFS）:
```
# テキストはLFに正規化
* text=auto eol=lf

# 画像・音声をLFSで管理（導入時のみ有効）
image/*.png filter=lfs diff=lfs merge=lfs -text
audio/*.mp3 filter=lfs diff=lfs merge=lfs -text
audio/*.m4a filter=lfs diff=lfs merge=lfs -text
```

## 誤操作からの復旧テクニック
- 直近の状態に戻る（履歴全体）
  - `git reflog` で「戻りたいHEAD」を探す
  - `git reset --hard <reflogで選んだハッシュ>`

- 1ファイルだけ戻す
  - `git restore --source=<コミットやブランチ> -- path/to/file`

- 進行中の操作をやめる
  - rebase をやめる: `git rebase --abort`
  - merge をやめる: `git merge --abort`

## 強制 push の注意
- 極力避ける。必要な場合は `--force-with-lease` を使用
  - `git push --force-with-lease`
  - 自分が想定していない他者の更新を上書きしにくい
- 強制push前に、必ず `git fetch` と `git log --oneline --graph --decorate --all` で状況確認

## 改行・文字コードの安定化
- macOS/Unix では LF を既定に（上記 `.gitattributes` 参照）
- エディタ設定でも改行=LF/UTF-8 を推奨
- これにより「行末の違い」だけのノイズ差分を回避

## 便利エイリアス例（任意設定）
```bash
git config --global alias.st "status -sb"
git config --global alias.lg "log --oneline --graph --decorate --all"
git config --global alias.co "checkout"
git config --global alias.br "branch -vv"
git config --global alias.cm "commit -m"
```

## 追加の安全策（任意）
- コミット署名（GPG/SSH）: 改変検出に有効
- `git pull --rebase --autostash`: 未コミットの変更があっても自動退避/復元
- CI（GitHub Actions）で基本チェック（HTMLバリデーション/リンク切れ/簡易テスト）
