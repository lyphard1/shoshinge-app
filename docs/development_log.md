# 正信偈・念仏和讃アプリ 開発ログ (2025年8月27日)

このドキュメントは、2025年8月27日の開発セッションで行われた改善作業とコード評価の記録です。

## 📋 セッション概要

**実施日**: 2025年8月27日  
**主な作業**: UI改善、コード修復、GitHub運用ガイド作成、コード品質評価  
**対象ファイル**: `shoshinge_prototype.html`

---

## 🎯 実施した改善項目

### 1. UI/UXの改善
#### 問題
- 句の長さによってお経表示領域の縦サイズが変化
- 句が右寄りで左側に大きな空白
- 上下余白が大きすぎる

#### 解決策
- **高さ固定機能**: `computeFixedPageHeight()` を実装
  - 全ページを計測して最長ページの高さに統一
  - CSS変数 `--page-fixed-height` で動的制御
- **中央寄せ**: `.pageInner` ラッパーを追加
  - `display: flex; align-items: center; margin: 0 auto;`
  - 句数に関係なく中央配置を実現
- **余白削減**: 
  - `.page { justify-content: flex-start; padding: 2px 10px; }`
  - `.verse { padding: 2px 0; line-height: 1.6; }`

#### 実装コード
```css
.page {
  height: var(--page-fixed-height, 420px); /* 最長ページ高さで固定 */
  justify-content: flex-start; /* 上寄せで余白削減 */
}

.pageInner {
  display: flex;
  flex-direction: column;
  align-items: center; /* 句（縦書き）を束として中央に */
  width: max-content;
  margin-left: auto;
  margin-right: auto; /* ページ内で中央配置 */
}
```

```javascript
function computeFixedPageHeight() {
  const pagesOfMode = pages.filter(p => p.dataset.section === currentMode);
  let maxH = 0;
  // 全ページを一時表示して高さ計測
  pagesOfMode.forEach(p => {
    p.style.height = 'auto'; // 自然高さで計測
    const h = p.offsetHeight;
    if (h > maxH) maxH = h;
  });
  // CSS変数に最大高さを設定
  document.documentElement.style.setProperty('--page-fixed-height', `${maxH}px`);
}
```

### 2. コード修復作業
#### 発生した問題
- JS配列内にCSS断片が混入（パッチ適用ミス）
- `imageFiles.wasan` 配列の破損
- 構文エラーの発生

#### 修復内容
```javascript
// 修復前（破損状態）
imageFiles: {
  wasan: [
    "南無阿弥陀仏1.png",
    justify-content: flex-start; /* CSS混入 */
    height: var(--page-fixed-height, 420px);
    "解脱の光輪きはもなし.png",
    // ...
  ]
}

// 修復後（クリーン版）
imageFiles: {
  wasan: [
    "南無阿弥陀仏1.png",  // Page 1
    "南無阿弥陀仏2.png",  // Page 2
    "彌陀成佛のこのかたは.png",  // Page 3
    // ... 正しい配列構造
  ]
}
```

### 3. GitHub運用ガイドの作成
#### 作成ファイル
- `docs/git_push_pull_guide.md` - 包括的なGit/GitHub運用ガイド

#### 内容
- **基本フロー**: fetch → pull --rebase → push
- **エラー対処**: non-fast-forward、コンフリクト解消
- **PR運用**: ブランチ命名、テンプレート、マージ戦略
- **大容量ファイル対策**: Git LFS導入手順
- **設定例**: `.gitignore`, `.gitattributes`
- **復旧テクニック**: reflog、restore、abort
- **セキュリティ**: 強制push注意、PAT使用

---

## 🔧 技術的改善点

### リサイズ対応
```javascript
// デバウンス処理でパフォーマンス向上
let _resizeTimer = null;
window.addEventListener('resize', () => {
  if (_resizeTimer) clearTimeout(_resizeTimer);
  _resizeTimer = setTimeout(() => {
    computeFixedPageHeight();
  }, 150);
});
```

### モード切り替え時の再計測
```javascript
function switchMode(mode, isInitialLoad = false) {
  // モード切替処理...
  
  // モード切替後に高さを再計測
  setTimeout(computeFixedPageHeight, 0);
}
```

---

## 🐛 発生した問題と解決

### 1. CSS/JS混在エラー
**症状**: 構文エラー、パース失敗
```
',' expected.
Expression expected.
Declaration or statement expected.
```

**原因**: パッチ適用時にCSS行がJS配列内に混入
**解決**: 手動でクリーンな配列構造に復元

### 2. GitHub Push エラー
**症状**: `non-fast-forward` でpush拒否
**原因**: ローカルがリモートに対して `ahead 1, behind 3`
**解決**: 
```bash
git fetch --prune
git pull --rebase
git push
```

---

## 📊 コード品質評価結果

### 総合評価: B+ (優良、実用的な品質)

| 分野 | 評価 | コメント |
|------|------|----------|
| 機能性・実用性 | A | 音声同期、デュアルモード、ルビ表示が優秀 |
| アーキテクチャ・設計 | B+ | 単一ファイル構成、データ分離が適切 |
| 保守性・可読性 | B | 関数分離は良好、1行関数の整理が必要 |
| パフォーマンス | B+ | デバウンス、DOM再利用が効果的 |
| セキュリティ | A- | 静的コンテンツ、XSS対策済み |
| UI/UX | A- | 視覚的フィードバック、直感的操作 |

### 主な強み
1. **音声同期の精度**: タイムスタンプベースの正確なハイライト
2. **縦書きレイアウト**: 日本語コンテンツに最適化
3. **レスポンシブ対応**: 高さ自動調整とリサイズ処理
4. **エラーハンドリング**: 音声エラーの詳細メッセージ

### 改善提案
1. **短期**: 圧縮関数の整理、定数集約、JSDoc追加
2. **中期**: モジュール分割、テスト導入、PWA化
3. **長期**: TypeScript移行、Web Worker、Web Components

---

## 📁 ファイル変更履歴

### 変更されたファイル
1. `shoshinge_prototype.html`
   - UI改善（高さ固定、中央寄せ、余白削減）
   - コード修復（JS/CSS混在エラー解消）
   - パフォーマンス向上（リサイズ対応）

2. `docs/git_push_pull_guide.md` (新規作成)
   - GitHub運用の包括的ガイド
   - PR運用、LFS、復旧テクニックを網羅

### Git操作履歴
```bash
# コミット履歴
c14e317 - デザイン修正（UI改善）
353100b - docs: GitHub push/pull ガイドを追加
72dc092 - docs: push/pullガイドを追記（PR運用・LFS・ignore例・復旧テクなど）
```

---

## 🎯 次回セッションでの検討事項

### 優先度: 高
1. **関数リファクタリング**: 1行関数の可読性向上
2. **定数管理**: マジックナンバーの設定オブジェクト化
3. **エラー境界**: withErrorBoundary パターンの導入

### 優先度: 中
1. **テスト導入**: ユニットテスト環境の構築
2. **キーボード操作**: スペースキーでの再生/停止
3. **プログレスバー**: ドラッグ操作の実装

### 優先度: 低
1. **PWA化**: オフライン対応とホーム画面追加
2. **TypeScript移行**: 型安全性の向上
3. **モジュール分割**: CSS/JS/データの分離

---

## 📝 学んだ教訓

1. **パッチ適用の慎重さ**: 大きな変更は段階的に、検証を挟んで実施
2. **Git運用の重要性**: rebase前提のワークフローで履歴を整理
3. **UI調整の複雑さ**: 縦書き+flexboxの組み合わせには独特の考慮が必要
4. **コード品質**: 機能追加時も保守性を意識した設計を維持

---

## 🔗 関連リソース

- **リポジトリ**: https://github.com/lyphard1/shoshinge-app
- **開発ガイド**: `docs/git_push_pull_guide.md`
- **メインファイル**: `shoshinge_prototype.html`

---

**記録者**: GitHub Copilot  
**記録日時**: 2025年8月27日  
**セッション時間**: 約2時間  
**次回レビュー予定**: 要相談

---

# 正信偈・念仏和讃アプリ 開発ログ (2025年8月28日)

このドキュメントは、2025年8月28日の開発セッションで行われた改善作業の記録です。

## 📋 セッション概要

**実施日**: 2025年8月28日  
**主な作業**: デザイン洗練、コード構造改善、エラーハンドリング強化、MP3ファイルダウンロード  
**対象ファイル**: `shoshinge_prototype.html`, `script.js`

---

## 🎯 実施した改善項目

### 1. デザインの洗練
#### 問題
- 基本的なデザインだが、よりモダンで洗練された見た目に改善したい
- フォント、配色、ボタンのスタイルが古い印象

#### 解決策
- **Google Fonts導入**: Noto Sans JPを導入し、日本語フォントを統一
- **配色改善**: グラデーション背景、落ち着いたカラーパレット（青系グレー）
- **ボタン/コントロールのスタイルアップ**:
  - シャドウ効果、ホバーアニメーション
  - 角丸、グラデーション
- **全体のレイアウト調整**: 余白、フォントサイズ、行間を最適化
- **アニメーション追加**: ページ切り替え時のフェードイン効果

#### 実装コード例
```css
body {
  font-family: 'Noto Sans JP', 'Hiragino Mincho ProN', 'MS Mincho', serif;
  background: linear-gradient(135deg, #f7fafc 0%, #e3e6ec 100%);
}

#controlsContainer {
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  background: #fff;
  box-shadow: 0 2px 12px 0 #0001;
}

#modeSelector button {
  background: linear-gradient(180deg, #f8fafc 60%, #e2e8f0 100%);
  border-radius: 6px;
  box-shadow: 0 1px 4px #0001;
  transition: background 0.2s, border-color 0.2s, box-shadow 0.2s;
}

.page.active {
  animation: fadeIn 0.5s;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: none; }
}
```

### 2. JavaScriptコードの分離と構造改善
#### 問題
- JSコードがHTMLファイル内に長く記述されており、可読性が低い
- メンテナンスが困難

#### 解決策
- **JS分離**: HTMLからJS部分を抜き出し、`script.js`ファイルを作成
- **コメント追加**: 各関数、変数に日本語コメントを追加
- **コード整理**: 関数をグループ化し、役割ごとに整理

#### 実装例
```html
<!-- HTMLファイル末尾 -->
<script src="script.js"></script>
```

```javascript
// 正信偈アプリのJavaScriptファイル
// 音声再生、テキストハイライト、画像表示を管理

// DOM要素の取得
const audio = document.getElementById('audio');
// ... コメント付きのコード
```

### 3. エラーハンドリングの強化
#### 問題
- 音声ファイルや画像ファイルが存在しない場合の処理が不十分
- ユーザーにエラーがわかりにくい

#### 解決策
- **音声エラーハンドリング**: 詳細なエラーコード表示とメッセージ
- **画像エラーハンドリング**: `onerror`イベントで代替処理
- **ファイル存在確認**: ロード時にエラーをチェック

#### 実装コード例
```javascript
// 画像表示関数（エラーハンドリング強化）
function showImage(index) {
  // ... 既存コード
  scriptureImage.onerror = () => {
    console.warn(`Image not found: ${imagePath}`);
    scriptureImage.src = "";
    scriptureImage.alt = "画像が見つかりません";
  };
}

// 音声エラーハンドラー
function handleAudioError(e) {
  const err = audio.error;
  let message = `音声ファイルの読み込み/再生に失敗しました。\nファイル: ${audio.currentSrc.split('/').pop()}`;
  if (err) {
    message += `\nエラーコード: ${err.code}`;
    switch (err.code) {
      case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
        message += ' (ファイル形式非対応/ファイルが見つからない)';
        break;
      // ... 他のケース
    }
  }
  alert(message);
  playBtn.disabled = true;
  pauseBtn.disabled = true;
}
```

### 4. MP3ファイルのダウンロード
#### 問題
- GitHubリポジトリに音声ファイルが存在せず、アプリが動作しない

#### 解決策
- **GitHubプル実行**: `git pull origin main` で最新状態を反映
- **ファイル確認**: `audio/shoshinge.mp3` と `audio/nenbutuwasan.mp3` の存在を確認

#### 結果
- 正信偈用MP3: `audio/shoshinge.mp3` (約17MB)
- 念仏和讃用MP3: `audio/nenbutuwasan.mp3` (約16MB)
- アプリが正常に音声再生可能に

---

## 📊 改善結果

### デザイン面
- ✅ モダンで洗練されたUI
- ✅ レスポンシブ対応維持
- ✅ アクセシビリティ向上（フォント統一）

### コード品質
- ✅ 可読性大幅向上（JS分離、コメント追加）
- ✅ メンテナンス性向上
- ✅ エラーハンドリング強化

### 機能面
- ✅ 音声ファイル利用可能
- ✅ 安定した動作

---

## 🔧 使用技術・ツール
- **言語**: HTML, CSS, JavaScript
- **フォント**: Google Fonts (Noto Sans JP)
- **バージョン管理**: Git / GitHub
- **開発環境**: VS Code

---

## 📁 変更ファイル一覧
- `shoshinge_prototype.html`: デザイン洗練、JS参照変更
- `script.js`: 新規作成（JSコード分離）
- `audio/shoshinge.mp3`: GitHubからダウンロード
- `audio/nenbutuwasan.mp3`: GitHubからダウンロード

---

**記録者**: GitHub Copilot  
**記録日時**: 2025年8月28日  
**セッション時間**: 約1.5時間  
**次回レビュー予定**: 要相談
