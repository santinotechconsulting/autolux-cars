import { MessageSquare, ShieldCheck, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useState } from 'react';
import { useMarketplace } from '../context/MarketplaceContext';
import type { Vehicle } from '../types/marketplace';

interface AvailabilityModalProps {
  vehicle: Vehicle | null;
  onClose: () => void;
}

export function AvailabilityModal({ vehicle, onClose }: AvailabilityModalProps) {
  const { userProfile, sendDealerInquiry } = useMarketplace();
  const [name, setName] = useState(`${userProfile.firstName} ${userProfile.lastName}`);
  const [email, setEmail] = useState(userProfile.email);
  const [phone, setPhone] = useState(userProfile.phone);
  const [message, setMessage] = useState(
    vehicle
      ? `Hi ${vehicle.dealerName}, is the ${vehicle.year} ${vehicle.make} ${vehicle.model} (Stock #${vehicle.stockNumber}) still available? Please share out-the-door pricing.`
      : '',
  );

  if (!vehicle) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendDealerInquiry(vehicle, message, 'Inquiry');
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-lg rounded-xl border border-slate-200 bg-white p-6 shadow-2xl"
        >
          <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <img
                src={vehicle.image}
                alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                className="h-14 w-20 rounded-lg object-cover bg-slate-100 shrink-0"
                referrerPolicy="no-referrer"
              />
              <div>
                <h2 className="font-display text-base font-bold text-slate-950">
                  Check Availability
                </h2>
                <p className="text-xs text-slate-600">
                  {vehicle.year} {vehicle.make} {vehicle.model} &middot;{' '}
                  <span className="font-semibold tabular-nums">
                    ${vehicle.price.toLocaleString()}
                  </span>
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close availability modal"
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="mt-4 space-y-3">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label htmlFor="avail-name" className="block text-xs font-semibold text-slate-700">
                  Your Name
                </label>
                <input
                  id="avail-name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm focus:border-red-600 focus:outline-none"
                />
              </div>
              <div>
                <label htmlFor="avail-phone" className="block text-xs font-semibold text-slate-700">
                  Phone Number
                </label>
                <input
                  id="avail-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="mt-1 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm focus:border-red-600 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label htmlFor="avail-email" className="block text-xs font-semibold text-slate-700">
                Email Address
              </label>
              <input
                id="avail-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm focus:border-red-600 focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="avail-msg" className="block text-xs font-semibold text-slate-700">
                Message to {vehicle.dealerName}
              </label>
              <textarea
                id="avail-msg"
                rows={3}
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 p-3 text-sm focus:border-red-600 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-500">
              <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" aria-hidden="true" />
              <span>Conversation is saved automatically in your AutoLux Dashboard Inbox.</span>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-5 py-2 text-xs font-bold text-white hover:bg-red-700"
              >
                <MessageSquare className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Send Availability Request</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
