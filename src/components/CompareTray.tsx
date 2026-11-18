import { Scale, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { useMarketplace } from '../context/MarketplaceContext';

export function CompareTray() {
  const { compareIds, vehicles, toggleCompare, clearCompare } = useMarketplace();
  const selected = vehicles.filter((v) => compareIds.includes(v.id));

  return (
    <AnimatePresence>
      {selected.length > 0 && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="fixed bottom-4 left-1/2 z-40 w-[calc(100%-2rem)] max-w-4xl -translate-x-1/2 rounded-xl border border-slate-800 bg-slate-950/95 px-4 py-3 text-white shadow-xl backdrop-blur-md"
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-300">
                <Scale className="h-4 w-4 text-red-500" aria-hidden="true" />
                Compare ({selected.length}/3)
              </span>
              {selected.map((v) => (
                <div
                  key={v.id}
                  className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900 px-2.5 py-1 text-xs"
                >
                  <span className="max-w-[140px] truncate font-medium">
                    {v.year} {v.make} {v.model}
                  </span>
                  <button
                    type="button"
                    onClick={() => toggleCompare(v.id)}
                    aria-label={`Remove ${v.make} ${v.model} from comparison`}
                    className="text-slate-400 hover:text-white"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={clearCompare}
                className="text-xs font-medium text-slate-400 hover:text-white"
              >
                Clear
              </button>
              <Link
                to="/research?tab=compare"
                className="rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700 transition-colors whitespace-nowrap shrink-0"
              >
                Compare Side-by-Side
              </Link>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
