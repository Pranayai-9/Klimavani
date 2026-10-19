import React, { useState } from 'react';
import { Pause, Play } from 'lucide-react';

export interface TickerItem {
  id: string;
  category: string;
  text: string;
  articleUrl?: string;
}

interface BreakingTickerProps {
  items?: TickerItem[];
  onSelectBreaking?: (itemText: string) => void;
}

export const BreakingTicker: React.FC<BreakingTickerProps> = ({
  items = [],
  onSelectBreaking,
}) => {
  const [isPaused, setIsPaused] = useState(false);
  if (items.length === 0) return null;

  return (
    <div
      className="bg-forest-950 text-paper-100 border-y border-forest-800"
      aria-label="Breaking Climate Wire"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center h-10 overflow-hidden">
        {/* Label Badge */}
        <div className="flex items-center gap-2 bg-crimson-700 text-white px-2.5 py-1 text-[11px] font-bold tracking-widest uppercase shrink-0 z-10 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-white animate-ping" />
          <span>Wire Update</span>
        </div>

        {/* Ticker Content */}
        <div
          className="flex-1 overflow-hidden relative mx-3"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div
            className={`animate-ticker flex items-center gap-12 text-xs tracking-wide text-forest-100 ${
              isPaused ? 'ticker-paused' : ''
            }`}
          >
            {/* Render items duplicated to create seamless infinite loop */}
            {[...items, ...items].map((item, index) => (
              <div
                key={`${item.id}-${index}`}
                className="inline-flex items-center gap-2 shrink-0"
              >
                <span className="font-semibold text-paper-300 text-[10px] tracking-wider uppercase bg-forest-900/90 px-1.5 py-0.5 border border-forest-700/60">
                  {item.category}
                </span>
                {item.articleUrl ? (
                  <a
                    href={item.articleUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white hover:underline underline-offset-2 transition-colors"
                    aria-label={`Read: ${item.text}`}
                  >
                    {item.text}
                  </a>
                ) : (
                  <button
                    onClick={() => onSelectBreaking?.(item.text)}
                    className="hover:text-white hover:underline underline-offset-2 transition-colors text-left"
                  >
                    {item.text}
                  </button>
                )}
                <span className="text-forest-400 font-bold mx-2">/</span>
              </div>
            ))}
          </div>
        </div>

        {/* Accessible Controls: Pause/Play Button */}
        <div className="shrink-0 flex items-center pl-2 border-l border-forest-800/80 z-10">
          <button
            type="button"
            onClick={() => setIsPaused(!isPaused)}
            aria-label={isPaused ? 'Resume ticker movement' : 'Pause ticker movement'}
            className="p-1 text-forest-300 hover:text-white hover:bg-forest-900 transition-colors focus:outline-none focus:ring-1 focus:ring-forest-400"
            title={isPaused ? 'Play Ticker' : 'Pause Ticker'}
          >
            {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>
    </div>
  );
};
