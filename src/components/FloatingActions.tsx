import { ArrowDown, ArrowUp, MessageCircle, Send, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useMarketplace } from '../context/MarketplaceContext';

const WHATSAPP_NUMBER = '12125550194';

const TOPIC_PRESETS = [
  {
    label: 'Buy a Vehicle',
    message: 'Hi AutoLux USA, I would like assistance finding and buying a vehicle.',
  },
  {
    label: 'Car Rental',
    message: 'Hi AutoLux USA, I am interested in booking an executive car rental.',
  },
  {
    label: 'Financing',
    message: 'Hi AutoLux USA, I have a question about auto financing pre-qualification.',
  },
  {
    label: 'Sell / Trade',
    message: 'Hi AutoLux USA, I would like an instant offer to sell or trade my vehicle.',
  },
];

export function FloatingActions() {
  const { pathname } = useLocation();
  const { compareIds, vehicles } = useMarketplace();
  const [scrolled, setScrolled] = useState(false);
  const [waOpen, setWaOpen] = useState(false);

  const activeVehicle = useMemo(() => {
    if (!pathname.startsWith('/vehicle/')) return null;
    const slug = pathname.replace('/vehicle/', '').split('/')[0];
    return vehicles.find((v) => v.slug === slug || v.id === slug) || null;
  }, [pathname, vehicles]);

  const [waMessage, setWaMessage] = useState(TOPIC_PRESETS[0].message);

  useEffect(() => {
    if (activeVehicle) {
      setWaMessage(
        `Hi AutoLux USA, I would like availability & delivery pricing on the ${activeVehicle.year} ${activeVehicle.make} ${activeVehicle.model} ($${activeVehicle.price.toLocaleString()}, Stock #${activeVehicle.stockNumber}).`,
      );
    } else {
      setWaMessage(TOPIC_PRESETS[0].message);
    }
  }, [activeVehicle]);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 240);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!waOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setWaOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [waOpen]);

  const handleScrollAid = () => {
    if (scrolled) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (pathname === '/') {
      const target = document.getElementById('featured-inventory');
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }
    }

    window.scrollBy({ top: Math.round(window.innerHeight * 0.78), behavior: 'smooth' });
  };

  const whatsappHref = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(waMessage)}`;
  const bottomOffsetClass = compareIds.length > 0 ? 'bottom-20' : 'bottom-5';

  return (
    <div
      className={`fixed right-4 z-40 flex flex-col items-end gap-2.5 transition-all duration-200 sm:right-6 ${bottomOffsetClass}`}
    >
      {/* WhatsApp Concierge Quick-Chat Popover */}
      <AnimatePresence>
        {waOpen && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.96 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="w-80 max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between bg-emerald-600 px-4 py-3 text-white">
              <div className="flex items-center gap-2.5">
                <MessageCircle className="h-5 w-5" aria-hidden="true" />
                <div>
                  <div className="font-display text-sm font-bold">AutoLux USA WhatsApp</div>
                  <div className="text-[11px] text-emerald-100">Concierge Sales &amp; Rentals</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setWaOpen(false)}
                aria-label="Close WhatsApp concierge"
                className="rounded-lg p-1 text-emerald-100 hover:bg-emerald-700 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-4 space-y-3">
              <div>
                <div className="text-xs font-semibold text-slate-600">Select a topic</div>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {TOPIC_PRESETS.map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => setWaMessage(preset.message)}
                      className={`rounded-md border px-2.5 py-1 text-xs font-medium transition-colors ${
                        waMessage === preset.message
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                          : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label htmlFor="wa-msg-input" className="block text-xs font-semibold text-slate-600">
                  Your Message
                </label>
                <textarea
                  id="wa-msg-input"
                  rows={3}
                  value={waMessage}
                  onChange={(e) => setWaMessage(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 p-2.5 text-xs text-slate-800 focus:border-emerald-600 focus:outline-none"
                />
              </div>

              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 text-xs font-bold text-white transition-colors hover:bg-emerald-700"
              >
                <Send className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Open WhatsApp Chat</span>
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action Buttons Row */}
      <div className="flex items-center gap-2">
        {/* Scroll-Aid Button (Jump Down / Back to Top) */}
        <button
          type="button"
          onClick={handleScrollAid}
          aria-label={scrolled ? 'Scroll back to top' : 'Scroll to featured vehicles'}
          className="inline-flex h-11 items-center gap-2 rounded-full border border-slate-200 bg-white/95 px-4 text-xs font-semibold text-slate-800 shadow-lg backdrop-blur-md transition-all duration-150 hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 whitespace-nowrap"
        >
          {scrolled ? (
            <>
              <ArrowUp className="h-4 w-4 text-red-600" aria-hidden="true" />
              <span>Back to Top</span>
            </>
          ) : (
            <>
              <ArrowDown className="h-4 w-4 text-red-600" aria-hidden="true" />
              <span>{pathname === '/' ? 'View Inventory' : 'Scroll Down'}</span>
            </>
          )}
        </button>

        {/* WhatsApp Contact Button */}
        <button
          type="button"
          onClick={() => setWaOpen((prev) => !prev)}
          aria-label="Contact AutoLux USA on WhatsApp"
          aria-expanded={waOpen}
          className="inline-flex h-11 items-center gap-2 rounded-full bg-emerald-600 px-4 text-xs font-bold text-white shadow-lg transition-all duration-150 hover:-translate-y-0.5 hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 whitespace-nowrap"
        >
          <MessageCircle className="h-4 w-4 fill-white/15" aria-hidden="true" />
          <span>WhatsApp</span>
        </button>
      </div>
    </div>
  );
}
