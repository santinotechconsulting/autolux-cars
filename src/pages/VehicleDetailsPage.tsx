import {
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Expand,
  FileCheck2,
  Heart,
  MapPin,
  MessageSquare,
  Phone,
  Scale,
  ShieldCheck,
  Star,
  Tag,
  Truck,
  X,
} from 'lucide-react';
import { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { VehicleCard } from '../components/VehicleCard';
import { useMarketplace } from '../context/MarketplaceContext';
import { getDealRating } from '../data/inventory';
import { useSeo } from '../hooks/useSeo';

const MarketPriceTrendChart = lazy(() =>
  import('../components/MarketPriceTrendChart').then((m) => ({
    default: m.MarketPriceTrendChart,
  })),
);

export function VehicleDetailsPage() {
  const { slug } = useParams<{ slug: string }>();
  const {
    vehicles,
    isSaved,
    toggleSaveVehicle,
    compareIds,
    toggleCompare,
    sendDealerInquiry,
    trackVehicleView,
    userProfile,
    financingProfile,
    showToast,
  } = useMarketplace();

  const vehicle = useMemo(
    () => vehicles.find((v) => v.slug === slug || v.id === slug) || vehicles[0],
    [vehicles, slug],
  );

  useEffect(() => {
    trackVehicleView(vehicle.id);
    setActivePhotoIndex(0);
    setOfferAmount(Math.round(vehicle.price * 0.96));
    setDownPayment(vehicle.downPaymentEstimate ?? Math.round(vehicle.price * 0.1));
    setRequestDeliveryQuote(false);
    setBuyerMessage(
      `Hi, I am interested in this ${vehicle.year} ${vehicle.make} ${vehicle.model} (Stock #${vehicle.stockNumber}). Please confirm availability and out-the-door pricing.`,
    );
  }, [
    vehicle.id,
    vehicle.make,
    vehicle.model,
    vehicle.price,
    vehicle.downPaymentEstimate,
    vehicle.stockNumber,
    vehicle.year,
    trackVehicleView,
  ]);

  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [requestType, setRequestType] = useState<'Inquiry' | 'Test Drive' | 'Offer' | 'Rental' | 'Quote'>('Inquiry');
  const [requestDeliveryQuote, setRequestDeliveryQuote] = useState(false);
  const [buyerName, setBuyerName] = useState(`${userProfile.firstName} ${userProfile.lastName}`);
  const [buyerEmail, setBuyerEmail] = useState(userProfile.email);
  const [buyerPhone, setBuyerPhone] = useState(userProfile.phone);
  const [offerAmount, setOfferAmount] = useState(Math.round(vehicle.price * 0.96));
  const [rentalDays, setRentalDays] = useState(3);
  const [rentalStartDate, setRentalStartDate] = useState('2026-11-22');
  const [buyerMessage, setBuyerMessage] = useState(
    `Hi, I am interested in this ${vehicle.year} ${vehicle.make} ${vehicle.model} (Stock #${vehicle.stockNumber}). Please confirm availability and out-the-door pricing.`,
  );

  // Payment estimator state
  const [downPayment, setDownPayment] = useState(
    vehicle.downPaymentEstimate ?? Math.round(vehicle.price * 0.1),
  );
  const [termMonths, setTermMonths] = useState<36 | 48 | 60 | 72>(60);
  const [apr, setApr] = useState(5.75);

  const saved = isSaved(vehicle.id);
  const comparing = compareIds.includes(vehicle.id);
  const { rating, savings } = getDealRating(vehicle);

  const marketGaugePct = useMemo(() => {
    const low = vehicle.fairMarketPrice * 0.9;
    const high = vehicle.fairMarketPrice * 1.08;
    const pct = ((vehicle.price - low) / (high - low)) * 100;
    return Math.max(8, Math.min(92, Math.round(pct)));
  }, [vehicle.price, vehicle.fairMarketPrice]);

  const monthlyPayment = useMemo(() => {
    const principal = Math.max(0, vehicle.price - downPayment);
    const monthlyRate = apr / 100 / 12;
    if (monthlyRate === 0) return Math.round(principal / termMonths);
    const payment =
      (principal * (monthlyRate * Math.pow(1 + monthlyRate, termMonths))) /
      (Math.pow(1 + monthlyRate, termMonths) - 1);
    return Math.round(payment);
  }, [vehicle.price, downPayment, termMonths, apr]);

  const similarVehicles = useMemo(
    () =>
      vehicles
        .filter((v) => v.id !== vehicle.id && (v.bodyStyle === vehicle.bodyStyle || v.make === vehicle.make))
        .slice(0, 3),
    [vehicles, vehicle.id, vehicle.bodyStyle, vehicle.make],
  );

  useSeo({
    title: `${vehicle.year} ${vehicle.make} ${vehicle.model} ${vehicle.trim} – AutoLux USA`,
    description: `${vehicle.condition} ${vehicle.year} ${vehicle.make} ${vehicle.model} for $${vehicle.price.toLocaleString()} (${vehicle.mileage.toLocaleString()} mi) in ${vehicle.dealerCity}, ${vehicle.dealerState}. ${vehicle.warrantySummary || 'Warranty & free history report included.'}`,
    path: `/vehicle/${vehicle.slug}`,
    image: vehicle.image,
    imageAlt: `${vehicle.year} ${vehicle.make} ${vehicle.model} ${vehicle.trim} in ${vehicle.exteriorColor}`,
    ogType: 'product',
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'Vehicle',
        name: `${vehicle.year} ${vehicle.make} ${vehicle.model} ${vehicle.trim}`,
        brand: { '@type': 'Brand', name: vehicle.make },
        model: vehicle.model,
        vehicleModelDate: vehicle.year,
        vehicleIdentificationNumber: vehicle.vin,
        itemCondition:
          vehicle.condition === 'New'
            ? 'https://schema.org/NewCondition'
            : 'https://schema.org/UsedCondition',
        mileageFromOdometer: {
          '@type': 'QuantitativeValue',
          value: vehicle.mileage,
          unitCode: 'SMI',
        },
        fuelType: vehicle.fuelType,
        vehicleTransmission: vehicle.transmission,
        driveWheelConfiguration: vehicle.drivetrain,
        color: vehicle.exteriorColor,
        image: vehicle.image,
        description: vehicle.description,
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: vehicle.dealerRating,
          reviewCount: vehicle.dealerReviewCount,
        },
        offers: {
          '@type': 'Offer',
          price: vehicle.price,
          priceCurrency: 'USD',
          priceValidUntil: '2026-12-31',
          availability: 'https://schema.org/InStock',
          itemCondition:
            vehicle.condition === 'New'
              ? 'https://schema.org/NewCondition'
              : 'https://schema.org/UsedCondition',
          seller: {
            '@type': 'AutoDealer',
            name: vehicle.dealerName,
            telephone: vehicle.dealerPhone,
          },
        },
      },
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: '/' },
          { '@type': 'ListItem', position: 2, name: 'Cars for Sale', item: '/cars-for-sale' },
          { '@type': 'ListItem', position: 3, name: `${vehicle.year} ${vehicle.make} ${vehicle.model}` },
        ],
      },
    ],
  });

  const handleInquirySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let finalMsg = buyerMessage;
    let leadType: 'Inquiry' | 'Test Drive' | 'Offer' | 'Rental' = 'Inquiry';
    if (requestType === 'Offer') {
      leadType = 'Offer';
      finalMsg = `Offer Submitted: $${offerAmount.toLocaleString()} for ${vehicle.year} ${vehicle.make} ${vehicle.model} (Stock #${vehicle.stockNumber}). ${buyerMessage}`;
    } else if (requestType === 'Rental' && vehicle.rentalDailyRate) {
      leadType = 'Rental';
      const total = vehicle.rentalDailyRate * rentalDays;
      finalMsg = `Executive Rental Request: ${rentalDays} days starting ${rentalStartDate} (Est. $${total.toLocaleString()} total at $${vehicle.rentalDailyRate}/day). ${buyerMessage}`;
    } else if (requestType === 'Quote') {
      leadType = 'Inquiry';
      finalMsg = `Official Quote Request (Out-the-Door + Financing): ${vehicle.year} ${vehicle.make} ${vehicle.model} (Full Price $${vehicle.price.toLocaleString()}). ${buyerMessage}`;
    } else if (requestType === 'Test Drive') {
      leadType = 'Test Drive';
    }
    if (requestDeliveryQuote) {
      finalMsg += ' [Includes Nationwide Doorstep Delivery Quote Request]';
    }
    sendDealerInquiry(vehicle, finalMsg, leadType);
  };

  const nextPhoto = () => setActivePhotoIndex((i) => (i + 1) % vehicle.gallery.length);
  const prevPhoto = () =>
    setActivePhotoIndex((i) => (i - 1 + vehicle.gallery.length) % vehicle.gallery.length);

  useEffect(() => {
    if (!lightboxOpen && !historyOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setLightboxOpen(false);
        setHistoryOpen(false);
      } else if (lightboxOpen && vehicle.gallery.length > 1) {
        if (e.key === 'ArrowRight') setActivePhotoIndex((i) => (i + 1) % vehicle.gallery.length);
        if (e.key === 'ArrowLeft')
          setActivePhotoIndex((i) => (i - 1 + vehicle.gallery.length) % vehicle.gallery.length);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [lightboxOpen, historyOpen, vehicle.gallery.length]);

  const applyPreQualTerms = () => {
    const clampedDown = Math.min(Math.round(vehicle.price * 0.5), financingProfile.downPayment);
    setDownPayment(clampedDown);
    setTermMonths(financingProfile.preferredTermMonths);
    setApr(financingProfile.estimatedApr);
    showToast(
      `Applied your ${financingProfile.estimatedApr.toFixed(2)}% APR & ${financingProfile.preferredTermMonths}-mo Pre-Qual terms.`,
    );
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Breadcrumb Trail */}
      <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
        <Link to="/" className="hover:text-slate-900">
          Home
        </Link>
        <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
        <Link to="/cars-for-sale" className="hover:text-slate-900">
          Cars for Sale
        </Link>
        <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
        <Link to={`/cars-for-sale?make=${encodeURIComponent(vehicle.make)}`} className="hover:text-slate-900">
          {vehicle.make}
        </Link>
        <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
        <span className="font-medium text-slate-900">
          {vehicle.year} {vehicle.make} {vehicle.model}
        </span>
      </nav>

      <div className="mt-5 grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Left: Photo Gallery, Market Value Bar, Specs, History Report */}
        <div className="space-y-8 lg:col-span-8">
          {/* Gallery */}
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <div className="relative aspect-[4/3] w-full bg-slate-100">
              <img
                src={vehicle.gallery[activePhotoIndex] || vehicle.image}
                alt={`${vehicle.year} ${vehicle.make} ${vehicle.model} photo ${activePhotoIndex + 1}`}
                className="h-full w-full cursor-zoom-in object-cover"
                onClick={() => setLightboxOpen(true)}
                referrerPolicy="no-referrer"
              />
              {vehicle.gallery.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={prevPhoto}
                    aria-label="Previous photo"
                    className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-slate-950/70 p-2 text-white hover:bg-slate-950"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    onClick={nextPhoto}
                    aria-label="Next photo"
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-slate-950/70 p-2 text-white hover:bg-slate-950"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              )}
              <button
                type="button"
                onClick={() => setLightboxOpen(true)}
                className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-lg bg-slate-950/75 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-xs hover:bg-slate-950"
              >
                <Expand className="h-3.5 w-3.5" aria-hidden="true" />
                <span className="tabular-nums">
                  {activePhotoIndex + 1} / {vehicle.gallery.length}
                </span>
              </button>
            </div>

            {vehicle.gallery.length > 1 && (
              <div className="flex gap-3 border-t border-slate-200 p-3">
                {vehicle.gallery.map((photo, idx) => (
                  <button
                    key={photo + idx}
                    type="button"
                    onClick={() => setActivePhotoIndex(idx)}
                    className={`relative h-16 w-24 overflow-hidden rounded-lg border-2 transition-all ${
                      activePhotoIndex === idx ? 'border-red-600' : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={photo}
                      alt={`Thumbnail ${idx + 1}`}
                      className="h-full w-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Market Price Analysis Gauge */}
          <section className="rounded-xl border border-slate-200 bg-white p-6">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <div>
                <h2 className="font-display text-lg font-bold text-slate-950">
                  AutoLux Price Analysis: <span className="text-emerald-700">{rating}</span>
                </h2>
                <p className="text-xs text-slate-600 tabular-nums">
                  This vehicle is priced{' '}
                  <span className="font-semibold text-slate-950">
                    ${Math.abs(savings).toLocaleString()} {savings >= 0 ? 'below' : 'above'}
                  </span>{' '}
                  the regional Fair Market Value of ${vehicle.fairMarketPrice.toLocaleString()}.
                </p>
              </div>
              <span className="font-mono text-xs text-slate-500 tabular-nums">
                Market Avg: ${vehicle.fairMarketPrice.toLocaleString()}
              </span>
            </div>

            <div className="mt-5">
              <div className="relative h-2.5 w-full rounded-full bg-gradient-to-r from-emerald-500 via-amber-400 to-rose-500">
                <div
                  className="absolute top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-slate-950 shadow-md"
                  style={{ left: `${marketGaugePct}%` }}
                  aria-label={`Price position ${marketGaugePct}%`}
                />
              </div>
              <div className="mt-2 flex justify-between text-[11px] font-medium text-slate-500 tabular-nums">
                <span>Great Deal (${Math.round(vehicle.fairMarketPrice * 0.92).toLocaleString()})</span>
                <span>Market Avg (${vehicle.fairMarketPrice.toLocaleString()})</span>
                <span>Above Avg (${Math.round(vehicle.fairMarketPrice * 1.07).toLocaleString()})</span>
              </div>
            </div>

            <Suspense
              fallback={
                <div className="mt-6 h-72 animate-pulse rounded-xl border border-slate-200 bg-slate-50 p-4" />
              }
            >
              <MarketPriceTrendChart vehicle={vehicle} />
            </Suspense>
          </section>

          {/* Vehicle Overview & Key Specs */}
          <section className="rounded-xl border border-slate-200 bg-white p-6">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h2 className="font-display text-xl font-bold text-slate-950">Vehicle Specifications</h2>
                <p className="mt-0.5 text-xs text-slate-500 font-mono">
                  VIN: {vehicle.vin} &middot; Stock #{vehicle.stockNumber}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setHistoryOpen(true)}
                className="inline-flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3.5 py-2 text-xs font-semibold text-emerald-800 hover:bg-emerald-100 transition-colors"
              >
                <FileCheck2 className="h-4 w-4" aria-hidden="true" />
                <span>View Free AutoLux History Report</span>
              </button>
            </div>

            <dl className="mt-5 grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3">
              <div>
                <dt className="text-xs text-slate-500">Mileage</dt>
                <dd className="mt-0.5 text-sm font-semibold tabular-nums text-slate-950">
                  {vehicle.mileage.toLocaleString()} miles
                </dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">Engine</dt>
                <dd className="mt-0.5 text-sm font-semibold text-slate-950">{vehicle.engine}</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">Horsepower</dt>
                <dd className="mt-0.5 text-sm font-semibold tabular-nums text-slate-950">
                  {vehicle.horsepower} hp
                </dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">Transmission</dt>
                <dd className="mt-0.5 text-sm font-semibold text-slate-950">{vehicle.transmission}</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">Drivetrain</dt>
                <dd className="mt-0.5 text-sm font-semibold text-slate-950">{vehicle.drivetrain}</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">Fuel Economy</dt>
                <dd className="mt-0.5 text-sm font-semibold tabular-nums text-slate-950">
                  {vehicle.mpgCity} City / {vehicle.mpgHighway} Hwy {vehicle.fuelType === 'Electric' ? 'MPGe' : 'MPG'}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">Exterior Color</dt>
                <dd className="mt-0.5 text-sm font-semibold text-slate-950">{vehicle.exteriorColor}</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">Interior Color</dt>
                <dd className="mt-0.5 text-sm font-semibold text-slate-950">{vehicle.interiorColor}</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">Title &amp; History</dt>
                <dd className="mt-0.5 text-sm font-semibold text-emerald-700">
                  {vehicle.titleStatus} &middot; {vehicle.accidentsReported} Accidents
                </dd>
              </div>
            </dl>

            <div className="mt-6 border-t border-slate-100 pt-5">
              <h3 className="font-display text-base font-bold text-slate-950">Dealer Notes</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{vehicle.description}</p>
            </div>

            <div className="mt-6 border-t border-slate-100 pt-5">
              <h3 className="font-display text-base font-bold text-slate-950">Installed Features &amp; Options</h3>
              <ul className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                {vehicle.features.map((feat) => (
                  <li key={feat} className="flex items-center gap-2 text-sm text-slate-700">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" aria-hidden="true" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-3 border-t border-slate-100 pt-5 sm:grid-cols-3">
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3.5">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-950">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" aria-hidden="true" />
                  <span>Inspection Regime</span>
                </div>
                <p className="mt-1 text-xs text-slate-600">
                  {vehicle.inspectionLevel || 'Expert Visual & 165-Point Health Check Passed'}
                </p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3.5">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-950">
                  <CheckCircle2 className="h-4 w-4 text-red-600" aria-hidden="true" />
                  <span>Warranty Protection</span>
                </div>
                <p className="mt-1 text-xs text-slate-600">
                  {vehicle.warrantySummary || '90-Day / 3,000-Mile Limited Powertrain Coverage'}
                </p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3.5">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-950">
                  <Truck className="h-4 w-4 text-slate-900" aria-hidden="true" />
                  <span>Doorstep Delivery</span>
                </div>
                <p className="mt-1 text-xs text-slate-600">
                  {vehicle.deliveryAvailable !== false
                    ? 'Insured nationwide carrier delivery & 24/7 concierge pickup available.'
                    : 'Showroom pickup with verified title transfer.'}
                </p>
              </div>
            </div>
          </section>

          {/* Payment Calculator Widget */}
          <section className="rounded-xl border border-slate-200 bg-white p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="font-display text-xl font-bold text-slate-950">Monthly Payment Calculator</h2>
                <p className="mt-1 text-sm text-slate-600">
                  Adjust your down payment, term length, and APR to estimate monthly financing.
                </p>
              </div>
              {financingProfile.preQualified && (
                <button
                  type="button"
                  onClick={applyPreQualTerms}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800 hover:bg-emerald-100 transition-colors tabular-nums"
                >
                  <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>
                    Apply Pre-Qual ({financingProfile.estimatedApr.toFixed(2)}% / {financingProfile.preferredTermMonths} mo)
                  </span>
                </button>
              )}
            </div>

            <div className="mt-5 grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs font-semibold text-slate-700">
                    <label htmlFor="vdp-down">Down Payment</label>
                    <span className="font-mono tabular-nums">${downPayment.toLocaleString()}</span>
                  </div>
                  <input
                    id="vdp-down"
                    type="range"
                    min={0}
                    max={Math.round(vehicle.price * 0.5)}
                    step={100}
                    value={downPayment}
                    onChange={(e) => setDownPayment(Number(e.target.value))}
                    className="mt-2 w-full accent-red-600"
                  />
                </div>

                <div>
                  <span className="block text-xs font-semibold text-slate-700">Loan Term</span>
                  <div className="mt-2 grid grid-cols-4 gap-2">
                    {([36, 48, 60, 72] as const).map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setTermMonths(m)}
                        className={`rounded-lg border py-2 text-xs font-semibold tabular-nums transition-colors ${
                          termMonths === m
                            ? 'border-slate-950 bg-slate-950 text-white'
                            : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {m} mo
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold text-slate-700">
                    <label htmlFor="vdp-apr">Estimated APR</label>
                    <span className="font-mono tabular-nums">{apr.toFixed(2)}%</span>
                  </div>
                  <input
                    id="vdp-apr"
                    type="range"
                    min={2.9}
                    max={14.9}
                    step={0.25}
                    value={apr}
                    onChange={(e) => setApr(Number(e.target.value))}
                    className="mt-2 w-full accent-red-600"
                  />
                </div>
              </div>

              <div className="flex flex-col justify-between rounded-xl border border-slate-200 bg-slate-50 p-5">
                <div>
                  <div className="text-xs font-semibold text-slate-500">Estimated Monthly Payment</div>
                  <div className="mt-1 font-display text-4xl font-extrabold tabular-nums text-slate-950">
                    ${monthlyPayment.toLocaleString()}
                    <span className="text-base font-medium text-slate-500">/mo</span>
                  </div>
                  <p className="mt-2 text-xs text-slate-600 tabular-nums">
                    Financing ${Math.max(0, vehicle.price - downPayment).toLocaleString()} over {termMonths} months at{' '}
                    {apr.toFixed(2)}% APR (excludes taxes &amp; registration).
                  </p>
                </div>

                <Link
                  to="/financing"
                  className="mt-4 inline-flex items-center justify-center rounded-lg bg-slate-950 px-4 py-2.5 text-xs font-semibold text-white hover:bg-red-600 transition-colors"
                >
                  Pre-Qualify With Zero Credit Impact
                </Link>
              </div>
            </div>
          </section>
        </div>

        {/* Right: Sticky Purchase & Lead Module */}
        <aside className="lg:col-span-4">
          <div className="sticky top-20 space-y-5">
            <div className="rounded-xl border border-slate-200 bg-white p-6">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span>{vehicle.condition}</span>
                <span aria-hidden="true">&middot;</span>
                <span className="tabular-nums">{vehicle.mileage.toLocaleString()} mi</span>
              </div>

              <h1 className="mt-1.5 font-display text-2xl font-extrabold leading-tight text-slate-950">
                {vehicle.year} {vehicle.make} {vehicle.model}
              </h1>
              <p className="text-sm font-medium text-slate-600">{vehicle.trim}</p>

              <div className="mt-4 flex items-baseline justify-between border-y border-slate-100 py-4">
                <div>
                  <div className="font-display text-3xl font-extrabold tabular-nums text-slate-950">
                    ${vehicle.price.toLocaleString()}
                  </div>
                  {savings > 0 && (
                    <div className="mt-0.5 text-xs font-semibold text-emerald-700 tabular-nums">
                      {rating} &middot; ${savings.toLocaleString()} below market
                    </div>
                  )}
                </div>
                {vehicle.rentalDailyRate && (
                  <div className="text-right">
                    <div className="text-xs text-slate-500">Rental Option</div>
                    <div className="font-display text-base font-bold tabular-nums text-red-600">
                      ${vehicle.rentalDailyRate}/day
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs tabular-nums">
                <div>
                  <div className="text-slate-500">Est. Down Payment</div>
                  <div className="font-display font-bold text-slate-950">
                    ${(vehicle.downPaymentEstimate ?? Math.round(vehicle.price * 0.1)).toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-slate-500">Flexible Monthly</div>
                  <div className="font-display font-bold text-emerald-700">
                    From ${(vehicle.monthlyPaymentEstimate ?? monthlyPayment).toLocaleString()}/mo
                  </div>
                </div>
                <div className="col-span-2 flex items-center justify-between border-t border-slate-200 pt-2 text-[11px] font-semibold text-slate-700">
                  <span>Financing Available</span>
                  <span>{vehicle.noHagglePrice ? 'No-Haggle Direct Price' : 'Market Negotiable'}</span>
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  onClick={() => toggleSaveVehicle(vehicle)}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-lg border py-2.5 text-xs font-semibold transition-colors ${
                    saved
                      ? 'border-red-200 bg-red-50 text-red-600'
                      : 'border-slate-200 text-slate-800 hover:bg-slate-50'
                  }`}
                >
                  <Heart className={`h-4 w-4 ${saved ? 'fill-red-600 text-red-600' : ''}`} />
                  <span>{saved ? 'Saved in Dashboard' : 'Save Vehicle'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => toggleCompare(vehicle.id)}
                  className={`flex items-center justify-center gap-1.5 rounded-lg border px-4 py-2.5 text-xs font-semibold transition-colors ${
                    comparing
                      ? 'border-slate-950 bg-slate-950 text-white'
                      : 'border-slate-200 text-slate-800 hover:bg-slate-50'
                  }`}
                >
                  <Scale className="h-4 w-4" aria-hidden="true" />
                  <span>{comparing ? 'Comparing' : 'Compare'}</span>
                </button>
              </div>

              {/* Dealer Contact / Quote / Offer / Rental Form */}
              <form onSubmit={handleInquirySubmit} className="mt-6 space-y-3 border-t border-slate-100 pt-5">
                <div className="grid grid-cols-2 gap-1 rounded-lg bg-slate-100 p-1">
                  <button
                    type="button"
                    onClick={() => setRequestType('Inquiry')}
                    className={`rounded-md py-1.5 text-xs font-semibold transition-colors ${
                      requestType === 'Inquiry' ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-600'
                    }`}
                  >
                    Message
                  </button>
                  <button
                    type="button"
                    onClick={() => setRequestType('Quote')}
                    className={`rounded-md py-1.5 text-xs font-semibold transition-colors ${
                      requestType === 'Quote' ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-600'
                    }`}
                  >
                    Request Quote
                  </button>
                  <button
                    type="button"
                    onClick={() => setRequestType('Test Drive')}
                    className={`rounded-md py-1.5 text-xs font-semibold transition-colors ${
                      requestType === 'Test Drive' ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-600'
                    }`}
                  >
                    Test Drive
                  </button>
                  <button
                    type="button"
                    onClick={() => setRequestType('Offer')}
                    className={`rounded-md py-1.5 text-xs font-semibold transition-colors ${
                      requestType === 'Offer' ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-600'
                    }`}
                  >
                    Make Offer
                  </button>
                  {vehicle.rentalDailyRate && (
                    <button
                      type="button"
                      onClick={() => setRequestType('Rental')}
                      className={`col-span-2 rounded-md py-1.5 text-xs font-semibold transition-colors ${
                        requestType === 'Rental' ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-600'
                      }`}
                    >
                      Book Executive Rental (${vehicle.rentalDailyRate}/day)
                    </button>
                  )}
                </div>

                {requestType === 'Offer' && (
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                    <label htmlFor="vdp-offer" className="block text-xs font-semibold text-slate-700">
                      Your Offer Price (USD)
                    </label>
                    <input
                      id="vdp-offer"
                      type="number"
                      min={500}
                      step={100}
                      value={offerAmount}
                      onChange={(e) => setOfferAmount(Number(e.target.value))}
                      className="mt-1 h-9 w-full rounded-lg border border-slate-200 bg-white px-3 font-mono text-sm font-bold tabular-nums focus:border-red-600 focus:outline-none"
                    />
                  </div>
                )}

                {requestType === 'Rental' && vehicle.rentalDailyRate && (
                  <div className="grid grid-cols-2 gap-2.5 rounded-lg border border-slate-200 bg-slate-50 p-3">
                    <div>
                      <label htmlFor="rent-start" className="block text-xs font-semibold text-slate-700">
                        Pick-Up Date
                      </label>
                      <input
                        id="rent-start"
                        type="date"
                        value={rentalStartDate}
                        onChange={(e) => setRentalStartDate(e.target.value)}
                        className="mt-1 h-9 w-full rounded-lg border border-slate-200 bg-white px-2 text-xs focus:border-red-600 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label htmlFor="rent-days" className="block text-xs font-semibold text-slate-700">
                        Days (${(vehicle.rentalDailyRate * rentalDays).toLocaleString()})
                      </label>
                      <input
                        id="rent-days"
                        type="number"
                        min={1}
                        max={30}
                        value={rentalDays}
                        onChange={(e) => setRentalDays(Math.max(1, Number(e.target.value)))}
                        className="mt-1 h-9 w-full rounded-lg border border-slate-200 bg-white px-2 font-mono text-xs tabular-nums focus:border-red-600 focus:outline-none"
                      />
                    </div>
                  </div>
                )}

                <input
                  type="text"
                  required
                  value={buyerName}
                  onChange={(e) => setBuyerName(e.target.value)}
                  placeholder="Full Name"
                  className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm focus:border-red-600 focus:outline-none"
                />
                <input
                  type="email"
                  required
                  value={buyerEmail}
                  onChange={(e) => setBuyerEmail(e.target.value)}
                  placeholder="Email Address"
                  className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm focus:border-red-600 focus:outline-none"
                />
                <input
                  type="tel"
                  value={buyerPhone}
                  onChange={(e) => setBuyerPhone(e.target.value)}
                  placeholder="Phone Number"
                  className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm focus:border-red-600 focus:outline-none"
                />
                <textarea
                  rows={3}
                  required
                  value={buyerMessage}
                  onChange={(e) => setBuyerMessage(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 p-3 text-sm focus:border-red-600 focus:outline-none"
                />
                {vehicle.deliveryAvailable !== false && (
                  <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={requestDeliveryQuote}
                      onChange={(e) => setRequestDeliveryQuote(e.target.checked)}
                      className="h-4 w-4 rounded border-slate-300 text-red-600 focus:ring-red-600"
                    />
                    <span>Include Nationwide Doorstep Delivery Quote</span>
                  </label>
                )}
                <button
                  type="submit"
                  className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-red-600 px-4 text-sm font-bold text-white transition-colors hover:bg-red-700"
                >
                  {requestType === 'Test Drive' ? (
                    <Calendar className="h-4 w-4" aria-hidden="true" />
                  ) : requestType === 'Offer' ? (
                    <Tag className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <MessageSquare className="h-4 w-4" aria-hidden="true" />
                  )}
                  <span>
                    {requestType === 'Test Drive'
                      ? 'Request Test Drive'
                      : requestType === 'Offer'
                        ? 'Submit Cash Offer'
                        : requestType === 'Quote'
                          ? 'Request Instant Quote'
                          : requestType === 'Rental'
                            ? 'Reserve Executive Rental'
                            : 'Send Availability Inquiry'}
                  </span>
                </button>
              </form>
            </div>

            {/* Dealer Information Box */}
            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-display text-sm font-bold text-slate-950">{vehicle.dealerName}</h3>
                  <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-600">
                    <MapPin className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
                    <span>
                      {vehicle.dealerCity}, {vehicle.dealerState} {vehicle.dealerZip}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs font-semibold text-slate-900 tabular-nums">
                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" aria-hidden="true" />
                  <span>{vehicle.dealerRating}</span>
                  <span className="text-slate-400">({vehicle.dealerReviewCount})</span>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs">
                <a
                  href={`tel:${vehicle.dealerPhone.replace(/\D/g, '')}`}
                  className="inline-flex items-center gap-1.5 font-semibold text-slate-800 hover:text-red-600"
                >
                  <Phone className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>{vehicle.dealerPhone}</span>
                </a>
                <Link to="/dealers" className="font-semibold text-red-600 hover:text-red-700">
                  Dealer Profile
                </Link>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* Similar Vehicles Nearby */}
      {similarVehicles.length > 0 && (
        <section className="mt-14 border-t border-slate-200 pt-10">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="font-display text-2xl font-bold text-slate-950">Similar Vehicles Nearby</h2>
              <p className="mt-1 text-sm text-slate-600">
                Compare comparable {vehicle.bodyStyle} &amp; {vehicle.make} listings in your region.
              </p>
            </div>
            <Link
              to={`/cars-for-sale?bodyStyle=${encodeURIComponent(vehicle.bodyStyle)}`}
              className="text-sm font-semibold text-red-600 hover:text-red-700 whitespace-nowrap"
            >
              View All {vehicle.bodyStyle}s
            </Link>
          </div>
          <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
            {similarVehicles.map((sim) => (
              <VehicleCard key={sim.id} vehicle={sim} />
            ))}
          </div>
        </section>
      )}

      {/* Photo Gallery Lightbox Modal */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Vehicle photo gallery lightbox"
          onClick={() => setLightboxOpen(false)}
        >
          <button
            type="button"
            onClick={() => setLightboxOpen(false)}
            aria-label="Close photo gallery"
            className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
          >
            <X className="h-6 w-6" />
          </button>

          <div className="relative w-full max-w-4xl" onClick={(e) => e.stopPropagation()}>
            <img
              src={vehicle.gallery[activePhotoIndex] || vehicle.image}
              alt={`${vehicle.year} ${vehicle.make} ${vehicle.model} full view`}
              className="max-h-[80vh] w-full rounded-xl object-contain"
              referrerPolicy="no-referrer"
            />
            {vehicle.gallery.length > 1 && (
              <div className="mt-4 flex items-center justify-center gap-4 text-white">
                <button
                  type="button"
                  onClick={prevPhoto}
                  className="rounded-lg border border-white/20 px-4 py-2 text-xs font-semibold hover:bg-white/10"
                >
                  Previous
                </button>
                <span className="font-mono text-xs tabular-nums">
                  {activePhotoIndex + 1} / {vehicle.gallery.length}
                </span>
                <button
                  type="button"
                  onClick={nextPhoto}
                  className="rounded-lg border border-white/20 px-4 py-2 text-xs font-semibold hover:bg-white/10"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Free AutoLux Vehicle History Report Modal */}
      {historyOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="AutoLux Verified Vehicle History Report"
          onClick={() => setHistoryOpen(false)}
        >
          <div
            className="w-full max-w-2xl rounded-xl border border-slate-200 bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b border-slate-200 pb-4">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="h-6 w-6 text-emerald-600" aria-hidden="true" />
                <div>
                  <h2 className="font-display text-lg font-bold text-slate-950">
                    AutoLux Verified Vehicle History Report
                  </h2>
                  <p className="font-mono text-xs text-slate-500">
                    {vehicle.year} {vehicle.make} {vehicle.model} &middot; VIN {vehicle.vin}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setHistoryOpen(false)}
                className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100"
                aria-label="Close history report"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-3 rounded-lg bg-slate-50 p-4 text-center">
              <div>
                <div className="text-xs text-slate-500">Accidents Reported</div>
                <div className="mt-1 font-display text-lg font-bold text-emerald-700 tabular-nums">
                  {vehicle.accidentsReported}
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-500">Previous Owners</div>
                <div className="mt-1 font-display text-lg font-bold text-slate-950 tabular-nums">
                  {vehicle.previousOwners}
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-500">Title Status</div>
                <div className="mt-1 font-display text-lg font-bold text-emerald-700">
                  {vehicle.titleStatus}
                </div>
              </div>
            </div>

            <div className="mt-5">
              <h3 className="font-display text-sm font-bold text-slate-950">Verified Service &amp; Title Timeline</h3>
              <div className="mt-3 divide-y divide-slate-100 border-t border-slate-100">
                {vehicle.historyRecords.map((rec, idx) => (
                  <div key={idx} className="flex items-center justify-between gap-4 py-3 text-xs">
                    <div>
                      <div className="font-semibold text-slate-900">{rec.event}</div>
                      <div className="text-slate-500">{rec.location}</div>
                    </div>
                    <div className="text-right font-mono tabular-nums text-slate-600 shrink-0">
                      <div>{rec.date}</div>
                      <div>{rec.mileage.toLocaleString()} mi</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
