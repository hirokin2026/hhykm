/*
 * AdBanner.tsx - Google AdSense 広告ユニットコンポーネント
 *
 * 使い方:
 *   1. Google AdSense の審査が通ったら、下記の定数を更新してください。
 *      - ADSENSE_CLIENT: "ca-pub-XXXXXXXXXXXXXXXX" → 実際のパブリッシャーID
 *      - ADSENSE_SLOT:   "XXXXXXXXXX"             → 実際の広告ユニットID
 *   2. index.html の AdSense スクリプトタグのコメントアウトを外してください。
 *   3. IS_ADSENSE_READY を true に変更してください。
 *
 * 現在は IS_ADSENSE_READY = false のため、プレースホルダーを表示します。
 */

import { useEffect, useRef } from "react";

// ============================================================
// ★ AdSense ID が取得できたらここを編集してください ★
const IS_ADSENSE_READY = false; // true に変更
const ADSENSE_CLIENT = "ca-pub-XXXXXXXXXXXXXXXX"; // パブリッシャーID
const ADSENSE_SLOT_HORIZONTAL = "XXXXXXXXXX"; // 横長バナー用広告ユニットID
const ADSENSE_SLOT_SQUARE = "XXXXXXXXXX"; // 正方形用広告ユニットID
// ============================================================

type AdFormat = "horizontal" | "square";

interface AdBannerProps {
  format?: AdFormat;
  className?: string;
}

// 実際の AdSense 広告ユニット
function AdsenseUnit({ format }: { format: AdFormat }) {
  const adRef = useRef<HTMLModElement>(null);
  const pushed = useRef(false);

  useEffect(() => {
    if (!pushed.current && adRef.current) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
        pushed.current = true;
      } catch {
        // ignore
      }
    }
  }, []);

  return (
    <ins
      ref={adRef}
      className="adsbygoogle"
      style={{ display: "block" }}
      data-ad-client={ADSENSE_CLIENT}
      data-ad-slot={format === "horizontal" ? ADSENSE_SLOT_HORIZONTAL : ADSENSE_SLOT_SQUARE}
      data-ad-format={format === "horizontal" ? "horizontal" : "rectangle"}
      data-full-width-responsive="true"
    />
  );
}

// 審査前のプレースホルダー表示
function AdPlaceholder({ format }: { format: AdFormat }) {
  const isHorizontal = format === "horizontal";
  return (
    <div
      className="flex flex-col items-center justify-center rounded-xl select-none"
      style={{
        height: isHorizontal ? 90 : 250,
        background: "rgba(255,255,255,0.03)",
        border: "1.5px dashed rgba(255,255,255,0.10)",
        color: "rgba(255,255,255,0.2)",
        fontSize: 11,
        gap: 4,
      }}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.4 }}>
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <line x1="8" y1="21" x2="16" y2="21" />
        <line x1="12" y1="17" x2="12" y2="21" />
      </svg>
      <span style={{ opacity: 0.5 }}>広告スペース</span>
      <span style={{ opacity: 0.3, fontSize: 10 }}>AdSense ID 設定後に表示</span>
    </div>
  );
}

export default function AdBanner({ format = "horizontal", className = "" }: AdBannerProps) {
  return (
    <div className={className}>
      {IS_ADSENSE_READY ? (
        <AdsenseUnit format={format} />
      ) : (
        <AdPlaceholder format={format} />
      )}
    </div>
  );
}
