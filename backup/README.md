# Backup フォルダについて

## 概要
このフォルダには開発過程で作成された試作版やバックアップファイルが含まれています。

## ファイル分類

### 重要なバックアップ（保持推奨）
- `shoshinge_prototype_backup_20250825.html` - 安定版バックアップ
- `shoshinge_prototypeのオリジナル.html` - 初期版
- `正信偈アプリの資料_backup_20250825.md` - ドキュメントバックアップ

### 開発実験版（参考用）
- `shoshinge_prototype_振り仮名付き*.html` - ルビ機能実装テスト
- `shoshinge_main2_*.html` - UI改善実験版
- `shoshinge_prototype_20250825*.html` - 機能テスト版

### 動作確認版
- `shoshinge_prototype_studioに移行して動作確認したもの、無変更.html`
- `shoshinge_prototype、*.html` - 各種テスト版

## 整理方針

### 即座に削除可能
以下は機能が統合済みまたは不要：
```
shoshinge_prototype、四行にならない*.html
shoshinge_prototype、gemini、正信偈はOK、和讃の音声が正信偈のまま.html
```

### 保持推奨
- 初期版オリジナル
- 安定版バックアップ（日付付き）
- 重要な機能実装の参考版

## 今後の運用
1. 新しいバックアップは日付を明記
2. 機能統合後は対応する実験版を削除検討
3. 四半期ごとに整理を実施
