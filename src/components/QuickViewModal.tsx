import {
  ArrowRight,
  CheckCircle2,
  Heart,
  MapPin,
  MessageSquare,
  Scale,
  ShieldCheck,
  Truck,
  X,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useMarketplace } from '../context/MarketplaceContext';
import { getDealRating } from '../data/inventory';
import type { Vehicle } from '../types/marketplace';

interface QuickViewModalProps {
  vehicle: Vehicle;
  onClose: () => void;
  onRequestQuote: (vehicle: Vehicle) => void;
}

export function QuickViewModal({ vehicle, onClose, onRequestQuote }: QuickViewModalProps) {
  const { isSaved, toggleSaveVehicle, compareIds, toggleCompare } = useMarketplace();
  const saved = isSaved(vehicle.id);
  const comparing = compareIds.includes(vehicle.id);
  const downPayment = vehicle.downPaymentEstimate ?? Math.round(vehicle.price * 0.1);
  const monthlyEstimate = vehicle.monthlyPaymentEstimate ?? Math.round((vehicle.price * 0.9) / 60);
  const { rating, savings } = getDealRating(vehicle);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/65 p-4 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-label={`Quick view ${vehicle.year} ${vehicle.make} ${vehicle.model}`}
    >
      <div className="relative w-full max-w-3xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close quick view"
          className="absolute right-3 top-3 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/95 text-slate-700 shadow-sm hover:bg-slate-100"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-12">
          {/* Left: Photo & Key Guarantees */}
          <div className="flex flex-col justify-between bg-slate-50 p-5 md:col-span-6">
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
              <img
                src={vehicle.image}
                alt={`${vehicle.year} ${vehicle.make} ${vehicle.model} ${vehicle.trim}`}
                className="aspect-[4/3] w-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>

            <div className="mt-4 space-y-2 text-xs text-slate-700">
              <div className="flex items-center gap-2 font-medium">
                <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-600" aria-hidden="true" />
                <span>{vehicle.inspectionLevel || 'Expert Visual & 165-Point Health Check Passed'}</span>
              </div>
              <div className="flex items-center gap-2 font-medium">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-red-600" aria-hidden="true" />
                <span>{vehicle.warrantySummary || '90-Day / 3,000-Mi Limited Warranty Included'}</span>
              </div>
              {vehicle.deliveryAvailable !== false && (
                <div className="flex items-center gap-2 font-medium">
                  <Truck className="h-4 w-4 shrink-0 text-slate-800" aria-hidden="true" />
                  <span>Nationwide Doorstep Delivery Eligible</span>
                </div>
              )}
            </div>
          </div>

          {/* Right: Specs, Payment Breakdown & Actions */}
          <div className="flex flex-col justify-between p-6 md:col-span-6">
            <div>
              <div className="text-xs text-slate-500">
                {vehicle.condition} &middot; {vehicle.mileage.toLocaleString()} mi &middot;{' '}
                {vehicle.titleStatus}
              </div>
              <h2 className="mt-1 font-display text-xl font-extrabold text-slate-950">
                {vehicle.year} {vehicle.make} {vehicle.model}
              </h2>
              <p className="text-xs font-medium text-slate-600">{vehicle.trim}</p>

              <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3.5 tabular-nums">
                <div className="flex items-baseline justify-between">
                  <span className="text-xs font-semibold text-slate-600">Full Cash Price</span>
                  <span className="font-display text-2xl font-extrabold text-slate-950">
                    ${vehicle.price.toLocaleString()}
                  </span>
                </div>
                {savings > 0 && (
                  <div className="mt-0.5 text-right text-[11px] font-semibold text-emerald-700">
                    {rating} &middot; ${savings.toLocaleString()} below market
                  </div>
                )}
                <div className="mt-2.5 grid grid-cols-2 gap-2 border-t border-slate-200 pt-2.5 text-xs">
                  <div>
                    <span className="text-slate-500">Down Payment: </span>
                    <span className="font-bold text-slate-950">${downPayment.toLocaleString()}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-500">Monthly: </span>
                    <span className="font-bold text-emerald-700">${monthlyEstimate.toLocaleString()}/mo</span>
                  </div>
                </div>
              </div>

              <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                <div>
                  <dt className="text-slate-500">Engine</dt>
                  <dd className="font-semibold text-slate-900 line-clamp-1">{vehicle.engine}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Drivetrain</dt>
                  <dd className="font-semibold text-slate-900">
                    {vehicle.drivetrain} &middot; {vehicle.transmission}
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-500">VIN</dt>
                  <dd className="font-mono font-semibold text-slate-900">{vehicle.vin}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Dealer Hub</dt>
                  <dd className="inline-flex items-center gap-1 font-semibold text-slate-900">
                    <MapPin className="h-3 w-3 text-slate-400" aria-hidden="true" />
                    {vehicle.dealerCity}, {vehicle.dealerState}
                  </dd>
                </div>
              </dl>
            </div>

            <div className="mt-5 space-y-2.5 border-t border-slate-100 pt-4">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => toggleSaveVehicle(vehicle)}
                  className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg border py-2 text-xs font-semibold transition-colors ${
                    saved
                      ? 'border-red-200 bg-red-50 text-red-600'
                      : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Heart className={`h-3.5 w-3.5 ${saved ? 'fill-red-600 text-red-600' : ''}`} />
                  <span>{saved ? 'Saved' : 'Wishlist'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => toggleCompare(vehicle.id)}
                  className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg border py-2 text-xs font-semibold transition-colors ${
                    comparing
                      ? 'border-slate-950 bg-slate-950 text-white'
                      : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Scale className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>{comparing ? 'Comparing' : 'Compare'}</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onRequestQuote(vehicle);
                  }}
                  className="inline-flex h-10 items-center justify-center gap-1.5 rounded-lg bg-slate-950 px-3 text-xs font-bold text-white hover:bg-slate-800 transition-colors"
                >
                  <MessageSquare className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Get Quote</span>
                </button>
                <Link
                  to={`/vehicle/${vehicle.slug}`}
                  onClick={onClose}
                  className="inline-flex h-10 items-center justify-center gap-1.5 rounded-lg bg-red-600 px-3 text-xs font-bold text-white hover:bg-red-700 transition-colors"
                >
                  <span>Full Details</span>
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
