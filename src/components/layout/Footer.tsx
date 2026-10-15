import React from 'react';
import { ArrowUp, ShieldCheck, Database, Compass } from 'lucide-react';
import { ClimateCategory } from '../../types/news';
import { CATEGORIES } from '../../data/mockArticles';

interface FooterProps {
  onSelectCategory: (category: ClimateCategory) => void;
}

export const Footer: React.FC<FooterProps> = ({ onSelectCategory }) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-forest-950 text-paper-200 border-t-4 border-forest-800 mt-20 pt-14 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Masthead & Statement */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-10 border-b border-forest-800">
          <div className="md:col-span-5 space-y-4">
            <h2 className="text-3xl font-serif font-black tracking-tight uppercase text-paper-100">
              Klimavani
            </h2>
            <p className="text-xs font-serif italic text-forest-300">
              Climate, Environment & The Changing World
            </p>
            <p className="text-xs text-paper-300/80 leading-relaxed font-sans max-w-md">
              Klimavani is an independent personal digital climate newspaper designed to bring structure, scientific rigor, and visual clarity to planetary environmental developments. We emphasize verified meteorological datasets, peer-reviewed research, and institutional policy dispatches.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-forest-400 font-mono">
              <ShieldCheck className="w-4 h-4 text-forest-300" />
              <span>Phase 1: Foundation & Editorial Dashboard Prototype</span>
            </div>
          </div>

          {/* Quick Categories Navigation */}
          <div className="md:col-span-4 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-widest text-forest-300 flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5" />
              Editorial Desks
            </h3>
            <ul className="grid grid-cols-2 gap-2 text-xs">
              {CATEGORIES.map((cat) => (
                <li key={cat}>
                  <button
                    onClick={() => {
                      onSelectCategory(cat);
                      scrollToTop();
                    }}
                    className="text-paper-300/80 hover:text-white transition-colors text-left"
                  >
                    {cat}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Sourcing & Phase 2 Pipeline Readiness */}
          <div className="md:col-span-3 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-widest text-forest-300 flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5" />
              Institutional Sources
            </h3>
            <p className="text-xs text-paper-300/80 leading-relaxed font-sans">
              Configured for direct telemetry and feed ingestion from:
            </p>
            <div className="flex flex-wrap gap-1.5 text-[10px] font-mono text-paper-200">
              <span className="bg-forest-900 border border-forest-800 px-2 py-0.5">Copernicus C3S</span>
              <span className="bg-forest-900 border border-forest-800 px-2 py-0.5">WMO / UN</span>
              <span className="bg-forest-900 border border-forest-800 px-2 py-0.5">NASA Earth</span>
              <span className="bg-forest-900 border border-forest-800 px-2 py-0.5">ESA Earth Observation</span>
              <span className="bg-forest-900 border border-forest-800 px-2 py-0.5">Nature & Science</span>
              <span className="bg-forest-900 border border-forest-800 px-2 py-0.5">NOAA Climate</span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-paper-300/60 font-sans">
          <p>© {new Date().getFullYear()} Klimavani. Digital Climate Newspaper. All source records retain original author attribution.</p>
          
          <button
            onClick={scrollToTop}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-forest-900 hover:bg-forest-800 text-paper-200 hover:text-white border border-forest-800 transition-colors uppercase tracking-wider text-[11px] font-semibold"
          >
            <ArrowUp className="w-3.5 h-3.5" />
            <span>Back to Masthead</span>
          </button>
        </div>
      </div>
    </footer>
  );
};
