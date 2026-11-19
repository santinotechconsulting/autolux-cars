import { ArrowRight, Camera, Car, Eye, Heart, MessageSquare, Scale, ShieldCheck } from 'lucide-react';
import { lazy, Suspense, useState } from 'react';
import { Link } from 'react-router-dom';
import { useMarketplace } from '../context/MarketplaceContext';
import { getDealRating } from '../data/inventory';
import type { Vehicle } from '../types/marketplace';

const AvailabilityModal = lazy(() =>
  import('./AvailabilityModal').then((m) => ({ default: m.AvailabilityModal })),
);
const QuickViewModal = lazy(() =>
  import('./QuickViewModal').then((m) => ({ default: m.QuickViewModal })),
);

interface VehicleCardProps {
  vehicle: Vehicle;
  layout?: 'grid' | 'list';
  onCheckAvailability?: (vehicle: Vehicle) => void;
}

export function VehicleCard({ vehicle, layout = 'grid', onCheckAvailability }: VehicleCardProps) {
  const { isSaved, toggleSaveVehicle, compareIds, toggleCompare } = useMarketplace();
  const [imgError, setImgError] = useState(false);
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const [localQuoteOpen, setLocalQuoteOpen] = useState(false);

  const saved = isSaved(vehicle.id);
  const comparing = compareIds.includes(vehicle.id);
  const monthlyEstimate = vehicle.monthlyPaymentEstimate ?? Math.round((vehicle.price * 0.9) / 60);
  const downEstimate = vehicle.downPaymentEstimate ?? Math.round(vehicle.price * 0.1);
  const { rating, savings } = getDealRating(vehicle);

  const triggerQuote = (target: Vehicle) => {
    if (onCheckAvailability) {
      onCheckAvailability(target);
    } else {
      setLocalQuoteOpen(true);
    }
  };

  if (layout === 'list') {
    return (
      <>
        <article className="group flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md sm:flex-row">
          <Link
            to={`/vehicle/${vehicle.slug}`}
            className="relative aspect-[4/3] w-full shrink-0 overflow-hidden bg-slate-100 sm:w-72"
          >
            {!imgError ? (
              <img
                src={vehicle.image}
                alt={`${vehicle.year} ${vehicle.make} ${vehicle.model} ${vehicle.trim} for sale in ${vehicle.dealerCity}, ${vehicle.dealerState}`}
                width={400}
                height={300}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                loading="lazy"
                decoding="async"
                referrerPolicy="no-referrer"
                onError={() => setImgError(true)}
              />
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center bg-slate-100 text-slate-400">
                <Car className="h-10 w-10" />
                <span className="mt-2 text-xs font-medium">
                  {vehicle.make} {vehicle.model}
                </span>
              </div>
            )}
            <div className="absolute bottom-2 left-2 flex items-center gap-1 rounded bg-slate-950/75 px-2 py-0.5 text-[11px] font-medium text-white tabular-nums backdrop-blur-xs">
              <Camera className="h-3 w-3" aria-hidden="true" />
              <span>{vehicle.gallery.length}</span>
            </div>
          </Link>

          <div className="flex flex-1 flex-col justify-between p-5">
            <div>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                    <span>{vehicle.condition}</span>
                    <span aria-hidden="true">&middot;</span>
                    <span>{vehicle.listingType === 'Rental' ? 'Sale & Rental' : 'For Sale'}</span>
                    {vehicle.freeHistoryReport && (
                      <>
                        <span aria-hidden="true">&middot;</span>
                        <span className="inline-flex items-center gap-1 font-medium text-emerald-700">
                          <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
                          Free History Report
                        </span>
                      </>
                    )}
                  </div>
                  <Link to={`/vehicle/${vehicle.slug}`} className="mt-1 block">
                    <h3 className="font-display text-lg font-bold text-slate-950 group-hover:text-red-600 transition-colors">
                      {vehicle.year} {vehicle.make} {vehicle.model} {vehicle.trim}
                    </h3>
                  </Link>
                </div>

                <div className="text-right shrink-0">
                  <div className="font-display text-xl font-bold tabular-nums text-slate-950">
                    ${vehicle.price.toLocaleString()}
                  </div>
                  <div className="text-xs tabular-nums text-slate-500">
                    Down ${downEstimate.toLocaleString()} &middot; ${monthlyEstimate.toLocaleString()}/mo
                  </div>
                  {savings > 0 && (
                    <div className="mt-0.5 text-xs font-semibold text-emerald-700 tabular-nums">
                      {rating} &middot; ${savings.toLocaleString()} off market
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-600 tabular-nums">
                <span>{vehicle.mileage.toLocaleString()} mi</span>
                <span aria-hidden="true">&middot;</span>
                <span>{vehicle.engine}</span>
                <span aria-hidden="true">&middot;</span>
                <span>{vehicle.drivetrain}</span>
                <span aria-hidden="true">&middot;</span>
                <span>{vehicle.exteriorColor}</span>
              </div>

              <p className="mt-2.5 line-clamp-2 text-sm text-slate-600">{vehicle.description}</p>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3">
              <div className="text-xs text-slate-500">
                <span className="font-medium text-slate-800">{vehicle.dealerName}</span>
                <span className="mx-1.5" aria-hidden="true">&middot;</span>
                <span>
                  {vehicle.dealerCity}, {vehicle.dealerState} ({vehicle.distanceMiles} mi)
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setQuickViewOpen(true)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Quick View</span>
                </button>

                <button
                  type="button"
                  onClick={() => toggleCompare(vehicle.id)}
                  className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                    comparing
                      ? 'border-slate-950 bg-slate-950 text-white'
                      : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Scale className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>{comparing ? 'Comparing' : 'Compare'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => toggleSaveVehicle(vehicle)}
                  aria-label={saved ? 'Remove from saved vehicles' : 'Save vehicle'}
                  className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                    saved
                      ? 'border-red-200 bg-red-50 text-red-600'
                      : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Heart className={`h-3.5 w-3.5 ${saved ? 'fill-red-600 text-red-600' : ''}`} />
                  <span>{saved ? 'Saved' : 'Save'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => triggerQuote(vehicle)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-800 hover:bg-slate-50 transition-colors"
                >
                  <MessageSquare className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Get Quote</span>
                </button>

                <Link
                  to={`/vehicle/${vehicle.slug}`}
                  className="inline-flex items-center gap-1 rounded-lg bg-red-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-red-700 transition-colors"
                >
                  <span>View Details</span>
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </Link>
              </div>
            </div>
          </div>
        </article>

        {quickViewOpen && (
          <Suspense fallback={null}>
            <QuickViewModal
              vehicle={vehicle}
              onClose={() => setQuickViewOpen(false)}
              onRequestQuote={triggerQuote}
            />
          </Suspense>
        )}
        {localQuoteOpen && (
          <Suspense fallback={null}>
            <AvailabilityModal vehicle={vehicle} onClose={() => setLocalQuoteOpen(false)} />
          </Suspense>
        )}
      </>
    );
  }

  return (
    <>
      <article className="group flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
          <Link to={`/vehicle/${vehicle.slug}`} className="block h-full w-full">
            {!imgError ? (
              <img
                src={vehicle.image}
                alt={`${vehicle.year} ${vehicle.make} ${vehicle.model} ${vehicle.trim} for sale in ${vehicle.dealerCity}, ${vehicle.dealerState}`}
                width={400}
                height={300}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                loading="lazy"
                decoding="async"
                referrerPolicy="no-referrer"
                onError={() => setImgError(true)}
              />
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center bg-slate-100 text-slate-400">
                <Car className="h-10 w-10" />
                <span className="mt-2 text-xs font-medium">
                  {vehicle.make} {vehicle.model}
                </span>
              </div>
            )}
          </Link>

          <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1 rounded bg-slate-950/75 px-2 py-0.5 text-[11px] font-medium text-white tabular-nums backdrop-blur-xs">
            <Camera className="h-3 w-3" aria-hidden="true" />
            <span>{vehicle.gallery.length}</span>
          </div>

          <div className="absolute right-3 top-3 flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setQuickViewOpen(true)}
              aria-label={`Quick view ${vehicle.year} ${vehicle.make} ${vehicle.model}`}
              title="Quick View"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/95 text-slate-700 shadow-sm backdrop-blur-sm transition-transform duration-150 hover:scale-105 hover:text-slate-950"
            >
              <Eye className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => toggleSaveVehicle(vehicle)}
              aria-label={saved ? 'Remove from saved vehicles' : 'Save vehicle'}
              title={saved ? 'Saved in Wishlist' : 'Add to Wishlist'}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/95 text-slate-700 shadow-sm backdrop-blur-sm transition-transform duration-150 hover:scale-105"
            >
              <Heart className={`h-4 w-4 ${saved ? 'fill-red-600 text-red-600' : 'text-slate-700'}`} />
            </button>
          </div>
        </div>

        <div className="flex flex-1 flex-col justify-between p-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span>{vehicle.condition}</span>
              <span aria-hidden="true">&middot;</span>
              <span className="tabular-nums">{vehicle.mileage.toLocaleString()} mi</span>
              {vehicle.rentalDailyRate && (
                <>
                  <span aria-hidden="true">&middot;</span>
                  <span className="font-medium text-slate-700 tabular-nums">
                    Rent ${vehicle.rentalDailyRate}/day
                  </span>
                </>
              )}
            </div>

            <Link to={`/vehicle/${vehicle.slug}`} className="mt-1.5 block">
              <h3 className="font-display text-base font-bold leading-snug text-slate-950 line-clamp-1 group-hover:text-red-600 transition-colors">
                {vehicle.year} {vehicle.make} {vehicle.model}
              </h3>
              <p className="text-xs text-slate-500 line-clamp-1">{vehicle.trim}</p>
            </Link>

            <div className="mt-3 flex items-baseline justify-between gap-2">
              <span className="font-display text-xl font-bold tabular-nums text-slate-950">
                ${vehicle.price.toLocaleString()}
              </span>
              <span className="text-xs tabular-nums text-slate-500">
                Down ${downEstimate.toLocaleString()} &middot; ${monthlyEstimate.toLocaleString()}/mo
              </span>
            </div>

            <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs tabular-nums">
              <span
                className={`font-semibold ${
                  rating === 'Great Deal'
                    ? 'text-emerald-700'
                    : rating === 'Good Deal'
                      ? 'text-emerald-600'
                      : 'text-slate-600'
                }`}
              >
                {rating}
              </span>
              {savings > 0 && (
                <>
                  <span className="text-slate-300" aria-hidden="true">&middot;</span>
                  <span className="text-slate-600">${savings.toLocaleString()} off market</span>
                </>
              )}
              {vehicle.deliveryAvailable && (
                <>
                  <span className="text-slate-300" aria-hidden="true">&middot;</span>
                  <span className="font-medium text-slate-600">Delivery Ready</span>
                </>
              )}
            </div>
          </div>

          <div className="mt-4 space-y-2.5 border-t border-slate-100 pt-3">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="truncate max-w-[175px]">
                {vehicle.dealerCity}, {vehicle.dealerState} &middot; {vehicle.distanceMiles} mi
              </span>
              <button
                type="button"
                onClick={() => toggleCompare(vehicle.id)}
                className={`inline-flex items-center gap-1 font-medium transition-colors ${
                  comparing ? 'text-red-600' : 'text-slate-600 hover:text-slate-950'
                }`}
              >
                <Scale className="h-3.5 w-3.5" aria-hidden="true" />
                <span>{comparing ? 'Added' : 'Compare'}</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => triggerQuote(vehicle)}
                className="rounded-lg border border-slate-200 bg-slate-50 py-2 text-xs font-semibold text-slate-800 hover:border-red-300 hover:bg-red-50 hover:text-red-700 transition-colors"
              >
                Get Quote
              </button>
              <Link
                to={`/vehicle/${vehicle.slug}`}
                className="inline-flex items-center justify-center rounded-lg bg-slate-950 py-2 text-xs font-semibold text-white hover:bg-red-600 transition-colors"
              >
                View Details
              </Link>
            </div>
          </div>
        </div>
      </article>

      {quickViewOpen && (
        <Suspense fallback={null}>
          <QuickViewModal
            vehicle={vehicle}
            onClose={() => setQuickViewOpen(false)}
            onRequestQuote={triggerQuote}
          />
        </Suspense>
      )}
      {localQuoteOpen && (
        <Suspense fallback={null}>
          <AvailabilityModal vehicle={vehicle} onClose={() => setLocalQuoteOpen(false)} />
        </Suspense>
      )}
    </>
  );
}
