# VoiceForge

VoiceForgeは、Markdownファイルを行ごとに編集し、音声生成のためのメタデータを管理するVS Code拡張機能です。。

## 概要

この拡張機能は、Markdownファイルを特殊なWebviewインターフェースで開き、各行に対して音声生成用のパラメータ（Slide No、Contents No）を管理できます。音声生成システムとの連携を前提とした、効率的なコンテンツ制作ツールです。

## 機能

### 基本機能
- **行ごと編集**: Markdownファイルを行単位で編集
- **行番号表示**: 通常の文章行のみを対象とした連番表示
- **音声制御ボタン**: 各行に再生・停止ボタンを配置（将来の音声生成機能用）

### ヘッダ機能 (v0.0.2+)
- **APIキー管理**: Google Text-to-Speech APIキーの入力・管理
- **音声エクスポート**: 将来の音声生成機能用のプレースホルダーボタン
- **JSON生成**: 現在の編集データをJSON形式でダウンロード
  - 出力形式：`{ no, text, slideNo, contentsNo }`の配列
  - ファイル名：`voiceforge-data.json`

### スライド管理
- **Slide No**: スライド番号の管理
  - 数値を変更すると、それ以降の行がすべて同じ値に自動更新
  - 上下矢印UIは非表示（手動入力のみ）
  - Tabキーで次の行のSlide Noフィールドに移動可能

- **Contents No**: コンテンツ番号の自動計算
  - Slide Noに基づいて自動的に1から順番に番号付け
  - Slide Noが変わるとContents Noは1からリセット
  - 読み取り専用フィールド

### Markdown対応
- **見出し表示**: `#`, `##`, `###`などの見出しを特別表示
  - 見出しレベルに応じた色分けとフォントサイズ
  - 見出し行にはボタンや数値フィールドは表示されない
  - 行番号のカウントには含まれない

- **空行処理**: 
  - UIでは何も表示されず、適切な間隔として機能
  - 内部では空行として保持され、保存時に維持される
  - 行番号やContents No計算からは除外

## インストールと使用方法

### 開発環境でのテスト
1. VS Codeでプロジェクトフォルダを開く
2. `npm install`で依存関係をインストール
3. `npm run compile`でTypeScriptをコンパイル
4. F5キーを押してExtension Development Hostを起動
5. 新しいウィンドウでMarkdownファイルを右クリック
6. 「Open in VoiceForge」を選択

### 基本操作
- **保存**: Ctrl+S (Cmd+S) でファイルを保存
- **Slide No編集**: 数値を変更すると以降の行が自動更新
- **Tabナビゲーション**: Slide NoフィールドでTabキーを押すと次の行に移動

## ファイル構成

```
voiceforge/
├── package.json          # 拡張機能の設定とメタデータ
├── tsconfig.json         # TypeScript設定
├── src/
│   └── extension.ts      # メイン拡張機能コード
├── out/                  # コンパイル済みJavaScriptファイル
├── .vscode/
│   ├── launch.json       # デバッグ設定
│   └── tasks.json        # ビルドタスク設定
├── CLAUDE.md             # Claude Code向け開発ガイド
└── README.md             # このファイル
```

## 技術仕様

### アーキテクチャ
- **フレームワーク**: VS Code Extension API
- **言語**: TypeScript
- **UI**: Webview (HTML/CSS/JavaScript)
- **ファイルI/O**: Node.js fs モジュール

### 主要コンポーネント
1. **拡張機能本体**: VS Codeコマンド登録とWebview管理
2. **Webviewコンテンツ**: 行ごと編集インターフェース
3. **メッセージ通信**: Webview ↔ 拡張機能間のデータ交換
4. **ファイル処理**: Markdownファイルの読み書き

### データフロー
1. Markdownファイル読み込み
2. 行ごとに解析（通常行/見出し行/空行を判定）
3. Webview HTMLの動的生成
4. ユーザー操作に応じたリアルタイム計算
5. 保存時のファイル書き込み

## スタイリング

### 見出しの色分け
- **H1**: 赤色ボーダー (18px)
- **H2**: オレンジ色ボーダー (16px)
- **H3**: 黄色ボーダー (14px)
- **H4**: 緑色ボーダー (13px)
- **H5**: 青色ボーダー (12px)
- **H6**: 紫色ボーダー (11px)

### レイアウト
- **カラムヘッダー**: No, Text, Slide No, Contents No
- **数値フィールド**: 4桁分の幅（40px）
- **ボタン**: 24x24pxのコンパクトサイズ
- **空行**: 16pxの高さで適切な間隔を確保

## 今後の拡張予定

- **音声生成機能**: 再生・停止ボタンの実装
- **音声パラメータ**: 速度、音調などの詳細設定
- **プレビュー機能**: 生成予定音声の確認
- **エクスポート機能**: 他形式への変換サポート

## 開発

### 必要な環境
- Node.js 16.x以上
- VS Code 1.74.0以上
- TypeScript 4.9.4以上

### ビルドコマンド
```bash
# 依存関係のインストール
npm install

# TypeScriptコンパイル
npm run compile

# 監視モードでのコンパイル
npm run watch

# 拡張機能パッケージ作成用
npm run vscode:prepublish
```

### デバッグ方法
1. VS Codeでプロジェクトを開く
2. F5キーでExtension Development Hostを起動
3. 新しいウィンドウでMarkdownファイルをテスト
4. 開発者ツールでWebviewをデバッグ可能

## ライセンス

このプロジェクトは開発中のプロトタイプです。

## 更新履歴

### v0.0.2 (現在)
- **新機能**: ヘッダ部分にコントロール要素を追加
  - Google TTS APIキー入力欄
  - 音声エクスポートボタン（将来の拡張用）
  - JSON生成・ダウンロード機能
- **JSON エクスポート**: 現在の行データ（No, Text, Slide No, Contents No）をJSON形式で保存
- **UI改善**: ヘッダのレイアウトとスタイリングを強化

### v0.0.1
- 基本的な行ごと編集機能
- Slide No/Contents No管理
- Markdown見出し対応
- 空行の適切な処理
- Tabキーナビゲーション
- 自動保存機能