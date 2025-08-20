
import React, { useEffect, useRef, useState } from 'react';

// This allows us to access the adsbygoogle property on the window object without TypeScript errors.
declare global {
  interface Window {
    adsbygoogle?: { [key:string]: unknown }[];
  }
}

// Constant for the ad slot ID to make it easy to find and update.
const AD_SLOT_ID: string = "9700892828";

/**
 * A component to display a Google AdSense ad unit.
 * It gracefully handles the placeholder Ad Slot ID to prevent errors.
 */
const AdComponent: React.FC = () => {
  const isConfigured = AD_SLOT_ID !== "YYYYYYYYYY";
  const adContainerRef = useRef<HTMLDivElement>(null);
  // Using a unique key for the <ins> tag ensures that React treats it as a new
  // element when the component re-mounts (e.g., navigating between screens).
  // This is crucial for AdSense in SPAs to request a new ad for the new slot.
  const [adKey] = useState(() => Date.now());

  useEffect(() => {
    if (!isConfigured || !adContainerRef.current) {
      return;
    }
    
    // The previous implementation used a timeout, which is prone to race conditions.
    // An IntersectionObserver is a more robust way to ensure the ad container
    // is visible and has a layout size before we request an ad, fixing the
    // "availableWidth=0" error.
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          try {
            (window.adsbygoogle = window.adsbygoogle || []).push({});
          } catch (e) {
            console.error("AdSense error: ", e);
          }
          // The ad has been requested, so we can stop observing.
          observer.disconnect();
        }
      },
      { threshold: 0.01 } // Trigger as soon as a tiny part is visible
    );

    observer.observe(adContainerRef.current);

    return () => {
      observer.disconnect();
    };
  }, [isConfigured, adKey]); // Re-run effect when component mounts with a new key

  return (
    <div ref={adContainerRef} className="w-full max-w-lg mt-6 text-center" style={{ minHeight: '100px' }}>
      {isConfigured ? (
        <>
          <p className="mb-2 text-slate-400 text-sm">Advertisement</p>
          {/* 
            This is the ad unit.
            - The key attribute is vital for SPAs. It ensures a new ad is fetched when this component re-appears.
          */}
          <ins
            key={adKey}
            className="adsbygoogle"
            style={{ display: 'block' }}
            data-ad-client="ca-pub-6230562819068631"
            data-ad-slot={AD_SLOT_ID}
            data-ad-format="auto"
            data-full-width-responsive="true"
          ></ins>
        </>
      ) : (
        <div className="bg-slate-700/50 p-4 rounded-lg h-full flex flex-col justify-center items-center">
          <p className="font-bold text-slate-300">Advertisement Area</p>
          <p className="text-xs text-yellow-400/80 mt-1">
            Note: Please replace the placeholder Ad Slot ID in `components/AdComponent.tsx` to display live ads.
          </p>
        </div>
      )}
    </div>
  );
};

export default AdComponent;
