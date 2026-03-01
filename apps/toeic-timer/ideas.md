# TOEIC リーディングタイマー デザインアイデア

<response>
<idea>
**Design Movement**: ネオブルータリズム × スタディダッシュボード

**Core Principles**:
1. 太いボーダーと強いシャドウで「存在感」を演出
2. 高コントラストの配色でタイマーの視認性を最大化
3. 各パートを明確に区切る構造的レイアウト
4. 機能美を重視した無駄のないUI

**Color Philosophy**: 
- 背景: オフホワイト (#F5F0E8)
- プライマリ: ディープネイビー (#1A1A2E)
- アクセント: ビビッドイエロー (#FFD700)
- パート5: コーラルレッド (#E85D4A)
- パート6: フォレストグリーン (#2D6A4F)
- パート7: ロイヤルブルー (#2B4EAE)

**Layout Paradigm**: 
縦長のカード3枚を横並びに配置。現在アクティブなパートが拡大表示され、残り2つは縮小表示。

**Signature Elements**:
1. 太いボーダー (3-4px solid) + ハードシャドウ (offset shadow)
2. 大きなモノスペースフォントでタイマー表示

**Interaction Philosophy**: 
ボタンを押すと明確な「クリック感」のあるアニメーション。パート切り替え時にスライドアニメーション。

**Animation**: 
- タイマー: 秒ごとに数字が跳ねるような微細アニメーション
- 残り1分: 赤くパルスするアラート
- パート完了: カードが完了状態にフリップ

**Typography System**: 
- タイマー数字: JetBrains Mono (モノスペース、視認性最高)
- ヘッダー: Space Grotesk Bold
- ボディ: Space Grotesk Regular
</idea>
<probability>0.08</probability>
</response>

<response>
<idea>
**Design Movement**: モダンミニマリズム × 集中特化UI

**Core Principles**:
1. 余白を贅沢に使い、タイマーに視線を集中させる
2. ソフトなグラデーションで時間の流れを視覚化
3. 進捗バーで全体の75分を一目で把握できる
4. 終了時刻を常に大きく表示

**Color Philosophy**: 
- 背景: ダークスレート (#0F172A)
- カード背景: (#1E293B)
- アクセント: スカイブルー (#38BDF8)
- 警告: アンバー (#F59E0B)
- 完了: エメラルド (#10B981)
- 危険: ローズ (#F43F5E)

**Layout Paradigm**: 
中央に大きなタイマー。上部に3パートのステップインジケーター。下部に操作ボタン。シンプルな縦構造。

**Signature Elements**:
1. 円形プログレスリングでカウントダウンを視覚化
2. グロウエフェクト付きのタイマー数字

**Interaction Philosophy**: 
スムーズなトランジションで状態変化を表現。ユーザーに「今何をすべきか」を常に明示。

**Animation**: 
- 円形プログレス: スムーズな減少アニメーション
- 残り3分: アンバーに色変化
- 残り1分: ローズに色変化 + パルス
- パート完了: 緑のフラッシュ + 次パートへの自動移行

**Typography System**: 
- タイマー数字: Orbitron (未来的、読みやすい)
- ラベル: Noto Sans JP
- 終了時刻: Roboto Mono
</idea>
<probability>0.07</probability>
</response>

<response>
<idea>
**Design Movement**: フラットデザイン × アカデミックプランナー

**Core Principles**:
1. 試験勉強ノートのような親しみやすさ
2. 3パートを横並びのカードで一覧表示
3. 各パートの開始・終了時刻を明確に表示
4. シンプルな操作で集中を妨げない

**Color Philosophy**: 
- 背景: ウォームグレー (#F8F6F0)
- カード: 白 (#FFFFFF)
- パート5: インディゴ (#4F46E5)
- パート6: ティール (#0D9488)
- パート7: バイオレット (#7C3AED)
- テキスト: チャコール (#1F2937)

**Layout Paradigm**: 
上部に現在のパートを大きく表示。下部に3パートのサマリーカードを横並び。全体の進捗バーを上部に配置。

**Signature Elements**:
1. 各パートに色分けされたアクセントライン
2. 終了時刻の大きな表示

**Interaction Philosophy**: 
直感的な操作。スタート/一時停止/次のパートへのボタンを大きく配置。

**Animation**: 
- 数字カウントダウン: フェードイン/アウト
- パート切り替え: スライドアニメーション
- 残り時間少: 背景色がじわじわ変化

**Typography System**: 
- タイマー: Roboto Mono Bold
- ヘッダー: Noto Sans JP Bold
- ボディ: Noto Sans JP
</idea>
<probability>0.09</probability>
</response>

## 選択したデザイン: アイデア2（モダンミニマリズム × 集中特化UI）

ダークテーマで視覚的に洗練され、円形プログレスリングとグロウエフェクトで
タイマーの残り時間を直感的に把握できるデザインを採用。
