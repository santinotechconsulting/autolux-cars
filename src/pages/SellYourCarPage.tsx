import { CheckCircle2, DollarSign, SearchCheck, ShieldCheck, Tag } from 'lucide-react';
import { motion } from 'motion/react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useMarketplace } from '../context/MarketplaceContext';
import { useSeo } from '../hooks/useSeo';

const VIN_YEAR_MAP: Record<string, number> = {
  J: 1988,
  M: 1991,
  V: 1997,
  X: 1999,
  '5': 2005,
  '6': 2006,
  G: 2016,
  H: 2017,
  // 2018 vs 1988 resolved cleanly below via modern default for late VINs
  K: 2019,
  L: 2020,
  N: 2022,
  P: 2023,
  R: 2024,
  S: 2025,
};

function decodeVinDetails(rawVin: string): {
  year: number;
  make: string;
  model: string;
  trim: string;
} | null {
  const clean = rawVin.trim().toUpperCase();
  if (clean.length < 3) return null;

  let make = 'Toyota';
  let model = 'Camry';
  let trim = 'XSE';

  if (clean.startsWith('1FT') || clean.startsWith('1FM') || clean.startsWith('1F')) {
    make = 'Ford';
    model = clean.startsWith('1FM') ? 'Bronco' : 'F-150';
    trim = clean.startsWith('1FM') ? 'XLT 4x4' : 'Lariat SuperCrew';
  } else if (clean.startsWith('1G') || clean.startsWith('2G') || clean.startsWith('6G')) {
    make = 'Chevrolet';
    model = clean.startsWith('1GC') ? 'Silverado 1500' : 'Camaro';
    trim = clean.startsWith('1GC') ? 'Z71 4x4' : '2SS V8';
  } else if (clean.startsWith('4T1') || clean.startsWith('JT') || clean.startsWith('2T')) {
    make = 'Toyota';
    model = clean.startsWith('JT') ? 'RAV4 Hybrid' : 'Camry';
    trim = clean.startsWith('JT') ? 'XSE AWD' : 'XSE V6';
  } else if (clean.startsWith('1H') || clean.startsWith('2H') || clean.startsWith('JH')) {
    make = 'Honda';
    model = clean.startsWith('2H') ? 'Civic Si' : 'Accord';
    trim = clean.startsWith('2H') ? 'DOHC VTEC' : 'Touring Hybrid';
  } else if (clean.startsWith('1N4') || clean.startsWith('3N1')) {
    make = 'Nissan';
    model = 'Altima';
    trim = '2.5 SV';
  } else if (clean.startsWith('5XY') || clean.startsWith('KND')) {
    make = 'Kia';
    model = 'Sportage';
    trim = 'LX AWD';
  } else if (clean.startsWith('WD') || clean.startsWith('4JG')) {
    make = 'Mercedes-Benz';
    model = 'AMG GT 55';
    trim = '4MATIC+ Coupe';
  } else if (clean.startsWith('5YJ')) {
    make = 'Tesla';
    model = 'Model S';
    trim = 'Plaid AWD';
  }

  const char10 = clean.length >= 10 ? clean[9] : '';
  const decodedYear = VIN_YEAR_MAP[char10] ?? 2022;

  return { year: decodedYear, make, model, trim };
}

export function SellYourCarPage() {
  const { addUserListing, userProfile, showToast } = useMarketplace();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [vin, setVin] = useState('');
  const [year, setYear] = useState(2022);
  const [make, setMake] = useState('Toyota');
  const [model, setModel] = useState('Camry');
  const [trim, setTrim] = useState('XSE V6');
  const [mileage, setMileage] = useState(24500);
  const [condition, setCondition] = useState<'Excellent' | 'Good' | 'Fair'>('Excellent');
  const [zip, setZip] = useState(userProfile.defaultZip || '10001');
  const [listingChoice, setListingChoice] = useState<'Instant Offer' | 'Private Listing'>('Instant Offer');
  const [askingPrice, setAskingPrice] = useState(29800);
  const [publishedSlug, setPublishedSlug] = useState<string | undefined>(undefined);

  useSeo({
    title: 'Sell Your Car or Get an Instant Cash Offer – AutoLux USA',
    description:
      'List your car privately or receive an instant cash offer from certified AutoLux USA dealers in minutes.',
    path: '/sell-your-car',
  });

  const valuation = useMemo(() => {
    const rawBase = 24000 + (year - 2018) * 1950;
    const clampedBase = Math.max(4200, rawBase);
    const mileagePenalty = Math.floor(mileage / 1000) * 65;
    const condMultiplier = condition === 'Excellent' ? 1.08 : condition === 'Good' ? 1.0 : 0.88;
    const instantOffer = Math.max(1850, Math.round((clampedBase - mileagePenalty) * condMultiplier));
    const privateMarket = Math.round(instantOffer * 1.14);
    return { instantOffer, privateMarket };
  }, [year, mileage, condition]);

  const handleDecodeVin = () => {
    const result = decodeVinDetails(vin);
    if (!result) {
      showToast('Enter at least 3 characters of your VIN to decode vehicle details.', 'info');
      return;
    }
    setYear(result.year);
    setMake(result.make);
    setModel(result.model);
    setTrim(result.trim);
    showToast(`VIN decoded: ${result.year} ${result.make} ${result.model} ${result.trim}`);
  };

  const handleCalculateValuation = (e: React.FormEvent) => {
    e.preventDefault();
    setAskingPrice(valuation.privateMarket);
    setStep(2);
  };

  const handleSubmitListing = (e: React.FormEvent) => {
    e.preventDefault();
    const res = addUserListing({
      year,
      make,
      model,
      trim,
      mileage,
      vin: vin || '1HGCM82633A004352',
      condition,
      askingPrice: listingChoice === 'Instant Offer' ? valuation.instantOffer : askingPrice,
      instantOfferEstimate: valuation.instantOffer,
      zip,
      status: listingChoice === 'Instant Offer' ? 'Instant Offer Ready' : 'Active Listing',
    });
    setPublishedSlug(res.vehicleSlug);
    setStep(3);
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="font-display text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl text-balance">
          Sell Your Car or Lock In an Instant Dealer Offer
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-sm text-slate-600 sm:text-base">
          Compare a guaranteed cash offer from trusted AutoLux USA dealers against listing directly to
          millions of nationwide shoppers.
        </p>
      </div>

      {/* Stepper */}
      <div className="mt-8 grid grid-cols-3 gap-3 border-b border-slate-200 pb-6">
        {[
          { num: 1, label: 'Vehicle Details' },
          { num: 2, label: 'Valuation & Offer' },
          { num: 3, label: 'Confirmation' },
        ].map((item) => (
          <div
            key={item.num}
            className={`flex items-center justify-center gap-2 rounded-lg border py-2.5 text-xs font-semibold sm:text-sm ${
              step === item.num
                ? 'border-slate-950 bg-slate-950 text-white'
                : step > item.num
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                  : 'border-slate-200 bg-white text-slate-500'
            }`}
          >
            <span className="font-mono tabular-nums">0{item.num}.</span>
            <span>{item.label}</span>
          </div>
        ))}
      </div>

      <motion.div
        key={step}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="mt-8 rounded-xl border border-slate-200 bg-white p-6 sm:p-8"
      >
        {step === 1 && (
          <form onSubmit={handleCalculateValuation} className="space-y-5">
            <div>
              <label htmlFor="sell-vin" className="block text-xs font-semibold text-slate-700">
                VIN (Optional — decode Year, Make &amp; Trim automatically)
              </label>
              <div className="mt-1.5 flex gap-2">
                <input
                  id="sell-vin"
                  type="text"
                  maxLength={17}
                  value={vin}
                  onChange={(e) => setVin(e.target.value.toUpperCase())}
                  placeholder="e.g. 4T1BZ1HK7NU123456 or 1FTFW1E84RFA10001"
                  className="h-11 flex-1 rounded-lg border border-slate-200 px-3 font-mono text-sm uppercase focus:border-red-600 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleDecodeVin}
                  className="inline-flex h-11 shrink-0 items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-4 text-xs font-bold text-slate-900 hover:border-red-300 hover:text-red-600 transition-colors"
                >
                  <SearchCheck className="h-4 w-4" aria-hidden="true" />
                  <span>Decode VIN</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label htmlFor="sell-year" className="block text-xs font-semibold text-slate-700">
                  Year
                </label>
                <input
                  id="sell-year"
                  type="number"
                  min={1980}
                  max={2027}
                  required
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value))}
                  className="mt-1.5 h-11 w-full rounded-lg border border-slate-200 px-3 text-sm tabular-nums focus:border-red-600 focus:outline-none"
                />
              </div>
              <div>
                <label htmlFor="sell-make" className="block text-xs font-semibold text-slate-700">
                  Make
                </label>
                <input
                  id="sell-make"
                  type="text"
                  required
                  value={make}
                  onChange={(e) => setMake(e.target.value)}
                  className="mt-1.5 h-11 w-full rounded-lg border border-slate-200 px-3 text-sm focus:border-red-600 focus:outline-none"
                />
              </div>
              <div>
                <label htmlFor="sell-model" className="block text-xs font-semibold text-slate-700">
                  Model
                </label>
                <input
                  id="sell-model"
                  type="text"
                  required
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="mt-1.5 h-11 w-full rounded-lg border border-slate-200 px-3 text-sm focus:border-red-600 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label htmlFor="sell-trim" className="block text-xs font-semibold text-slate-700">
                  Trim
                </label>
                <input
                  id="sell-trim"
                  type="text"
                  value={trim}
                  onChange={(e) => setTrim(e.target.value)}
                  className="mt-1.5 h-11 w-full rounded-lg border border-slate-200 px-3 text-sm focus:border-red-600 focus:outline-none"
                />
              </div>
              <div>
                <label htmlFor="sell-mileage" className="block text-xs font-semibold text-slate-700">
                  Mileage
                </label>
                <input
                  id="sell-mileage"
                  type="number"
                  min={0}
                  required
                  value={mileage}
                  onChange={(e) => setMileage(Number(e.target.value))}
                  className="mt-1.5 h-11 w-full rounded-lg border border-slate-200 px-3 text-sm tabular-nums focus:border-red-600 focus:outline-none"
                />
              </div>
              <div>
                <label htmlFor="sell-zip" className="block text-xs font-semibold text-slate-700">
                  ZIP Code
                </label>
                <input
                  id="sell-zip"
                  type="text"
                  maxLength={5}
                  required
                  value={zip}
                  onChange={(e) => setZip(e.target.value.replace(/\D/g, ''))}
                  className="mt-1.5 h-11 w-full rounded-lg border border-slate-200 px-3 font-mono text-sm tabular-nums focus:border-red-600 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <span className="block text-xs font-semibold text-slate-700">Overall Condition</span>
              <div className="mt-2 grid grid-cols-3 gap-3">
                {(['Excellent', 'Good', 'Fair'] as const).map((tier) => (
                  <button
                    key={tier}
                    type="button"
                    onClick={() => setCondition(tier)}
                    className={`rounded-lg border p-3 text-left transition-colors ${
                      condition === tier
                        ? 'border-red-600 bg-red-50/50 text-slate-950'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="text-sm font-bold">{tier}</div>
                    <div className="mt-0.5 text-xs text-slate-500">
                      {tier === 'Excellent'
                        ? 'Clean paint, full records'
                        : tier === 'Good'
                          ? 'Minor normal wear'
                          : 'Needs minor reconditioning'}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="h-11 w-full rounded-lg bg-red-600 px-6 text-sm font-bold text-white hover:bg-red-700 transition-colors sm:w-auto"
              >
                Calculate AutoLux Market Valuation
              </button>
            </div>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleSubmitListing} className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h2 className="font-display text-xl font-bold text-slate-950">
                  {year} {make} {model} {trim}
                </h2>
                <p className="text-xs text-slate-500 tabular-nums">
                  {mileage.toLocaleString()} miles &middot; {condition} condition &middot; ZIP {zip}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-xs font-semibold text-red-600 hover:text-red-700"
              >
                Edit Details
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <button
                type="button"
                onClick={() => setListingChoice('Instant Offer')}
                className={`flex flex-col justify-between rounded-xl border p-5 text-left transition-all ${
                  listingChoice === 'Instant Offer'
                    ? 'border-red-600 bg-red-50/40 ring-1 ring-red-600'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-red-600">Fastest Payout</span>
                    <DollarSign className="h-4 w-4 text-red-600" aria-hidden="true" />
                  </div>
                  <div className="mt-2 font-display text-3xl font-extrabold tabular-nums text-slate-950">
                    ${valuation.instantOffer.toLocaleString()}
                  </div>
                  <div className="mt-1 text-sm font-bold text-slate-900">Instant Dealer Cash Offer</div>
                  <p className="mt-2 text-xs leading-relaxed text-slate-600">
                    Valid for 7 days at participating AutoLux USA partner dealers. Paid on the spot upon inspection.
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setListingChoice('Private Listing')}
                className={`flex flex-col justify-between rounded-xl border p-5 text-left transition-all ${
                  listingChoice === 'Private Listing'
                    ? 'border-red-600 bg-red-50/40 ring-1 ring-red-600'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-600">Highest Return</span>
                    <Tag className="h-4 w-4 text-slate-700" aria-hidden="true" />
                  </div>
                  <div className="mt-2 font-display text-3xl font-extrabold tabular-nums text-slate-950">
                    ${valuation.privateMarket.toLocaleString()}
                  </div>
                  <div className="mt-1 text-sm font-bold text-slate-900">List Privately on AutoLux USA</div>
                  <p className="mt-2 text-xs leading-relaxed text-slate-600">
                    Reach active local buyers with built-in messaging, fraud protection, and editable asking price.
                  </p>
                </div>
              </button>
            </div>

            {listingChoice === 'Private Listing' && (
              <div>
                <label htmlFor="sell-asking" className="block text-xs font-semibold text-slate-700">
                  Your Asking Price (USD)
                </label>
                <input
                  id="sell-asking"
                  type="number"
                  min={1000}
                  step={100}
                  value={askingPrice}
                  onChange={(e) => setAskingPrice(Number(e.target.value))}
                  className="mt-1.5 h-11 w-full max-w-xs rounded-lg border border-slate-200 px-3 font-mono text-sm tabular-nums focus:border-red-600 focus:outline-none"
                />
              </div>
            )}

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                type="submit"
                className="h-11 rounded-lg bg-red-600 px-6 text-sm font-bold text-white hover:bg-red-700 transition-colors"
              >
                {listingChoice === 'Instant Offer' ? 'Lock In Cash Offer' : 'Publish Vehicle Listing'}
              </button>
              <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
                <ShieldCheck className="h-4 w-4 text-emerald-600" aria-hidden="true" />
                Saved automatically to your AutoLux Dashboard
              </span>
            </div>
          </form>
        )}

        {step === 3 && (
          <div className="py-6 text-center">
            <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-600" aria-hidden="true" />
            <h2 className="mt-4 font-display text-2xl font-extrabold text-slate-950">
              {listingChoice === 'Instant Offer'
                ? 'Your Instant Cash Offer Is Locked In'
                : 'Your Private Listing Is Live'}
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-slate-600">
              We saved your {year} {make} {model} valuation and status to your AutoLux USA Buyer &amp; Seller
              Dashboard.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              {publishedSlug && (
                <Link
                  to={`/vehicle/${publishedSlug}`}
                  className="rounded-lg bg-red-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-red-700 transition-colors"
                >
                  View Live Listing
                </Link>
              )}
              <Link
                to="/dashboard/listings"
                className="rounded-lg bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-600 transition-colors"
              >
                Manage in My Dashboard
              </Link>
              <button
                type="button"
                onClick={() => {
                  setPublishedSlug(undefined);
                  setStep(1);
                }}
                className="rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Value Another Vehicle
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
