import { BadgeCheck, Building2, Globe, MapPin, Phone, ScanBarcode, Star } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { DEALERS } from '../data/inventory';
import { useSeo } from '../hooks/useSeo';

export function DealersPage() {
  const [stateFilter, setStateFilter] = useState('');
  const [dealerInquirySubmitted, setDealerInquirySubmitted] = useState(false);

  useSeo({
    title: 'Trusted Dealer Directory & Dealer Solutions – AutoLux USA',
    description:
      'Find certified AutoLux USA dealerships near you or explore our $99/month dealer inventory, VIN scanner, and website platform.',
    path: '/dealers',
  });

  const filteredDealers = useMemo(() => {
    if (!stateFilter) return DEALERS;
    return DEALERS.filter((d) => d.state === stateFilter);
  }, [stateFilter]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-col items-start justify-between gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-end">
        <div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-slate-950">
            Trusted AutoLux USA Dealer Network
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Browse verified franchise and independent dealerships or enroll your dealership in AutoLux
            Dealer Solutions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="dealer-state" className="text-xs font-semibold text-slate-600">
            State:
          </label>
          <select
            id="dealer-state"
            value={stateFilter}
            onChange={(e) => setStateFilter(e.target.value)}
            className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium focus:border-red-600 focus:outline-none"
          >
            <option value="">All States</option>
            <option value="NY">New York (NY)</option>
            <option value="NJ">New Jersey (NJ)</option>
            <option value="CT">Connecticut (CT)</option>
          </select>
        </div>
      </div>

      {/* Accredited Dealer Directory */}
      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredDealers.map((dealer) => (
          <article
            key={dealer.id}
            className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-6 transition-all duration-150 hover:shadow-md"
          >
            <div>
              <div className="flex items-start justify-between gap-3">
                <h2 className="font-display text-lg font-bold text-slate-950">{dealer.name}</h2>
                <div className="flex items-center gap-1 text-xs font-bold text-slate-900 tabular-nums shrink-0">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" aria-hidden="true" />
                  <span>{dealer.rating}</span>
                  <span className="font-normal text-slate-400">({dealer.reviewCount})</span>
                </div>
              </div>

              <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-700 font-semibold">
                <BadgeCheck className="h-4 w-4" aria-hidden="true" />
                <span>AutoLux Certified Partner</span>
              </div>

              <div className="mt-4 space-y-2 text-xs text-slate-600">
                <div className="flex items-start gap-2">
                  <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden="true" />
                  <span>{dealer.address}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden="true" />
                  <span>{dealer.phone}</span>
                </div>
                <div className="text-slate-500">{dealer.hours}</div>
              </div>

              <div className="mt-4 border-t border-slate-100 pt-3 text-xs text-slate-600">
                Specialties: <span className="font-medium text-slate-900">{dealer.specialties.join(' · ')}</span>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
              <span className="text-xs font-semibold tabular-nums text-slate-700">
                {dealer.inventoryCount} vehicles listed
              </span>
              <Link
                to={`/cars-for-sale?zip=${dealer.zip}`}
                className="rounded-lg bg-slate-950 px-3.5 py-2 text-xs font-semibold text-white hover:bg-red-600 transition-colors"
              >
                View Inventory
              </Link>
            </div>
          </article>
        ))}
      </div>

      {/* Dealer Solutions Platform Section (Carsforsale.com $99/mo parity) */}
      <section className="mt-14 rounded-xl border border-slate-800 bg-slate-950 p-8 text-white">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <div className="text-xs font-semibold text-red-400">For Dealerships</div>
            <h2 className="mt-2 font-display text-2xl font-extrabold sm:text-3xl">
              AutoLux Dealer Suite — All-In-One Inventory, CRM &amp; Website Platform
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-300">
              Built for independent and franchise dealerships nationwide. Decode VINs on your lot,
              syndicate listings across major marketplaces, manage buyer leads, and launch a responsive
              dealership site with transparent flat monthly pricing.
            </p>

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-lg border border-slate-800 bg-slate-900 p-4">
                <ScanBarcode className="h-5 w-5 text-red-500" aria-hidden="true" />
                <div className="mt-2 font-display text-sm font-bold">Mobile VIN Scanner</div>
                <p className="mt-1 text-xs text-slate-400">
                  Decode trim, MSRP, and equipment options directly on the lot.
                </p>
              </div>
              <div className="rounded-lg border border-slate-800 bg-slate-900 p-4">
                <Globe className="h-5 w-5 text-red-500" aria-hidden="true" />
                <div className="mt-2 font-display text-sm font-bold">SiteFLEX Dealer Web</div>
                <p className="mt-1 text-xs text-slate-400">
                  SEO-ready dealership storefronts synced with live DMS inventory.
                </p>
              </div>
              <div className="rounded-lg border border-slate-800 bg-slate-900 p-4">
                <Building2 className="h-5 w-5 text-red-500" aria-hidden="true" />
                <div className="mt-2 font-display text-sm font-bold">Syndication &amp; CRM</div>
                <p className="mt-1 text-xs text-slate-400">
                  Unlimited leads, RouteOne &amp; Dealertrack integrations included.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-800 bg-white p-6 text-slate-900 lg:col-span-5">
            <div className="flex items-baseline justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-display text-base font-bold text-slate-950">
                  Request Dealer Onboarding
                </h3>
                <p className="text-xs text-slate-500">Full suite starting at $99/month</p>
              </div>
            </div>

            {dealerInquirySubmitted ? (
              <div className="py-8 text-center">
                <BadgeCheck className="mx-auto h-10 w-10 text-emerald-600" aria-hidden="true" />
                <h4 className="mt-3 font-display text-base font-bold text-slate-950">
                  Onboarding Request Received
                </h4>
                <p className="mt-1 text-xs text-slate-600">
                  An AutoLux USA dealer account representative will contact you within 1 business day.
                </p>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setDealerInquirySubmitted(true);
                }}
                className="mt-4 space-y-3"
              >
                <input
                  type="text"
                  required
                  placeholder="Dealership Name"
                  className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm focus:border-red-600 focus:outline-none"
                />
                <input
                  type="email"
                  required
                  placeholder="Work Email"
                  className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm focus:border-red-600 focus:outline-none"
                />
                <input
                  type="tel"
                  required
                  placeholder="Direct Phone"
                  className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm focus:border-red-600 focus:outline-none"
                />
                <button
                  type="submit"
                  className="h-11 w-full rounded-lg bg-red-600 text-sm font-bold text-white hover:bg-red-700 transition-colors"
                >
                  Schedule Free Demo
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
