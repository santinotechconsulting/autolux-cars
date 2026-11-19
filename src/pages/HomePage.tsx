import {
  ArrowDown,
  ArrowRight,
  BadgeCheck,
  CarFront,
  CheckCircle2,
  Compass,
  DollarSign,
  HelpCircle,
  MapPin,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Star,
} from 'lucide-react';
import { motion } from 'motion/react';
import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { VehicleCard } from '../components/VehicleCard';
import { useMarketplace } from '../context/MarketplaceContext';
import {
  AUTOLUX_LOGO,
  BODY_STYLES,
  DEALERS,
  IMG_CIVIC_SI,
  IMG_SILVERADO_Z71,
  IMG_TOYOTA_RAV4,
  POPULAR_MAKES,
  PRICE_TIERS,
  RESEARCH_ARTICLES,
} from '../data/inventory';
import { useSeo } from '../hooks/useSeo';

const INSPECTION_PROGRAMS = [
  {
    badge: 'Flexible Service Regime',
    title: 'Toyota & Hybrid Collection',
    subtitle: 'Verified maintenance logs, battery checks & budget-ready 4x4 pickups.',
    cta: 'Shop Toyota',
    to: '/cars-for-sale?make=Toyota&radius=nationwide',
    image: IMG_TOYOTA_RAV4,
  },
  {
    badge: 'Expert Visual Check',
    title: 'Honda Certified & Classic Coupes',
    subtitle: 'Multi-point compression, body & interior visual inspection passed.',
    cta: 'Shop Honda',
    to: '/cars-for-sale?make=Honda&radius=nationwide',
    image: IMG_CIVIC_SI,
  },
  {
    badge: 'Full Health & 4x4 Check',
    title: 'Chevrolet & Value Work Trucks',
    subtitle: 'Frame, driveline & cooling-system tested with $500 down financing.',
    cta: 'Shop Chevrolet',
    to: '/cars-for-sale?make=Chevrolet&radius=nationwide',
    image: IMG_SILVERADO_Z71,
  },
];

const CUSTOMER_TESTIMONIALS = [
  {
    quote:
      'Smooth buying experience from start to finish. The truck matched every photo and inspection note, financing terms were transparent, and doorstep delivery arrived right on schedule.',
    name: 'David M.',
    location: 'Dallas, TX · 1997 Silverado Z71',
    rating: 5,
  },
  {
    quote:
      'Requested a quote online and got full pricing with zero hidden dealer fees. The free history report and 90-day powertrain coverage made buying an affordable sedan stress-free.',
    name: 'Sarah C.',
    location: 'Los Angeles, CA · 2018 Nissan Altima',
    rating: 5,
  },
  {
    quote:
      'Compared two hybrids side by side with the 12-month price trend chart and locked in $500 down financing in five minutes without impacting my credit score.',
    name: 'Marcus T.',
    location: 'New York, NY · 2024 Toyota RAV4 Hybrid',
    rating: 5,
  },
];

const BUYING_FAQS = [
  {
    q: 'Are vehicles under $10,000 inspected and eligible for financing?',
    a: 'Yes. Every vehicle on AutoLux USA—from $1,850 value trucks to certified flagship models—undergoes an Expert Visual & Mechanical Health Check and supports flexible online financing starting around $500 down.',
  },
  {
    q: 'Do AutoLux used cars include a warranty and vehicle history report?',
    a: 'All verified listings include a free AutoLux Vehicle History Report detailing title status and accident records, plus 90-day / 3,000-mile to 12-month limited powertrain coverage options.',
  },
  {
    q: 'Can I have my vehicle delivered nationwide?',
    a: 'Yes. Most vehicles across our NY, NJ, CT, Texas, and California hubs qualify for insured nationwide doorstep carrier delivery. Check the Delivery Ready status on any listing or request a delivery quote.',
  },
  {
    q: 'How can I contact a specialist 24/7 for a quote or consultation?',
    a: 'Use the Get Quote button on any car card, open the floating WhatsApp 24/7 Consultation widget at the bottom right, or submit a Request Quote form on the vehicle details page.',
  },
];

export function HomePage() {
  const navigate = useNavigate();
  const { vehicles, userProfile, recentlyViewedIds, clearRecentlyViewed } = useMarketplace();

  const [listingType, setListingType] = useState<'All' | 'Sale' | 'Rental'>('All');
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [zip, setZip] = useState(userProfile.defaultZip || '10001');
  const [radius, setRadius] = useState(userProfile.defaultRadius || '50');
  const [browseTab, setBrowseTab] = useState<'makes' | 'styles' | 'price' | 'programs'>('makes');
  const [inventoryTab, setInventoryTab] = useState<'value' | 'featured' | 'recent'>('value');
  const [insightsTab, setInsightsTab] = useState<'testimonials' | 'reviews' | 'dealers' | 'faqs'>(
    'testimonials',
  );

  useSeo({
    title: 'AutoLux USA – Used & New Cars for Sale, Rentals & Financing',
    description:
      'Shop inspected used cars from $1,850, certified SUVs, trucks, and rentals on AutoLux USA. Free vehicle history reports, warranties, and zero-impact financing.',
    path: '/',
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'AutoDealer',
        name: 'AutoLux USA',
        description:
          'Nationwide marketplace for affordable used cars, certified vehicles, luxury rentals, free history reports, 90-day warranties, and doorstep delivery.',
        image: '/assets/aistudio/Autolux_46ec3fca.png',
        areaServed: 'US',
        priceRange: '$1,850 - $142,500',
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: '4.9',
          reviewCount: '1968',
        },
      },
      {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: BUYING_FAQS.map((item) => ({
          '@type': 'Question',
          name: item.q,
          acceptedAnswer: {
            '@type': 'Answer',
            text: item.a,
          },
        })),
      },
    ],
  });

  const availableModels = useMemo(() => {
    const filtered = make ? vehicles.filter((v) => v.make === make) : vehicles;
    return Array.from(new Set(filtered.map((v) => v.model))).sort();
  }, [make, vehicles]);

  const matchingCount = useMemo(() => {
    return vehicles.filter((v) => {
      if (listingType !== 'All' && v.listingType !== listingType) return false;
      if (make && v.make !== make) return false;
      if (model && v.model !== model) return false;
      if (maxPrice && v.price > Number(maxPrice)) return false;
      return true;
    }).length;
  }, [vehicles, listingType, make, model, maxPrice]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (listingType !== 'All') params.set('listingType', listingType);
    if (make) params.set('make', make);
    if (model) params.set('model', model);
    if (maxPrice) params.set('maxPrice', maxPrice);
    if (zip) params.set('zip', zip);
    if (radius) params.set('radius', radius);
    navigate(`/cars-for-sale?${params.toString()}`);
  };

  const valueVehicles = useMemo(
    () =>
      vehicles
        .filter((v) => v.price <= 15000)
        .sort((a, b) => a.price - b.price)
        .slice(0, 3),
    [vehicles],
  );

  const featuredVehicles = useMemo(() => vehicles.slice(0, 3), [vehicles]);

  const recentlyViewedVehicles = useMemo(
    () =>
      recentlyViewedIds
        .map((id) => vehicles.find((v) => v.id === id))
        .filter((v): v is NonNullable<typeof v> => Boolean(v))
        .slice(0, 3),
    [recentlyViewedIds, vehicles],
  );

  const displayedVehicles =
    inventoryTab === 'recent' && recentlyViewedVehicles.length > 0
      ? recentlyViewedVehicles
      : inventoryTab === 'value' && valueVehicles.length > 0
        ? valueVehicles
        : featuredVehicles;

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div>
      {/* 1. Compact Hero Search Showcase */}
      <section className="relative overflow-hidden bg-slate-950 text-white">
        <div className="mx-auto max-w-7xl px-4 py-7 sm:px-6 lg:px-8 lg:py-9">
          <div className="grid grid-cols-1 items-stretch gap-7 lg:grid-cols-12">
            {/* Left: Search Widget */}
            <div className="flex flex-col justify-between lg:col-span-7">
              <div>
                <h1 className="font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-[2.55rem] text-balance leading-[1.12]">
                  Quality Used Cars, Trucks &amp; Rentals You Can Trust
                </h1>
                <p className="mt-2 max-w-2xl text-sm text-slate-300 leading-relaxed sm:text-base">
                  Inspected vehicles from <span className="font-semibold text-white">$1,850</span> with
                  transparent down payments, free AutoLux History Reports, and nationwide delivery.
                </p>
              </div>

              <form
                onSubmit={handleSearchSubmit}
                className="mt-5 rounded-xl border border-slate-800 bg-white p-4 text-slate-900 shadow-xl"
              >
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  <div className="inline-flex rounded-lg bg-slate-100 p-1">
                    {(['All', 'Sale', 'Rental'] as const).map((mode) => (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => setListingType(mode)}
                        className={`rounded-md px-3 py-1 text-xs font-semibold transition-colors whitespace-nowrap ${
                          listingType === mode
                            ? 'bg-slate-950 text-white shadow-sm'
                            : 'text-slate-600 hover:text-slate-950'
                        }`}
                      >
                        {mode === 'All' ? 'All Vehicles' : mode === 'Sale' ? 'Cars for Sale' : 'Car Rental'}
                      </button>
                    ))}
                  </div>

                  <Link
                    to="/cars-for-sale"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-600 hover:text-red-700 whitespace-nowrap"
                  >
                    <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Advanced Search</span>
                  </Link>
                </div>

                <div className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                  <div>
                    <label htmlFor="hero-make" className="block text-xs font-semibold text-slate-600">
                      Make
                    </label>
                    <select
                      id="hero-make"
                      value={make}
                      onChange={(e) => {
                        setMake(e.target.value);
                        setModel('');
                      }}
                      className="mt-1 h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-900 focus:border-red-600 focus:bg-white focus:outline-none"
                    >
                      <option value="">All Makes</option>
                      {Array.from(new Set(vehicles.map((v) => v.make)))
                        .sort()
                        .map((m) => (
                          <option key={m} value={m}>
                            {m}
                          </option>
                        ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="hero-model" className="block text-xs font-semibold text-slate-600">
                      Model
                    </label>
                    <select
                      id="hero-model"
                      value={model}
                      onChange={(e) => setModel(e.target.value)}
                      className="mt-1 h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-900 focus:border-red-600 focus:bg-white focus:outline-none"
                    >
                      <option value="">All Models</option>
                      {availableModels.map((mod) => (
                        <option key={mod} value={mod}>
                          {mod}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="hero-price" className="block text-xs font-semibold text-slate-600">
                      Max Price
                    </label>
                    <select
                      id="hero-price"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      className="mt-1 h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-900 focus:border-red-600 focus:bg-white focus:outline-none tabular-nums"
                    >
                      <option value="">No Max Price</option>
                      <option value="5000">Under $5,000</option>
                      <option value="10000">Under $10,000</option>
                      <option value="15000">Under $15,000</option>
                      <option value="25000">Under $25,000</option>
                      <option value="35000">Under $35,000</option>
                      <option value="50000">Under $50,000</option>
                      <option value="75000">Under $75,000</option>
                      <option value="150000">Under $150,000</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="hero-radius" className="block text-xs font-semibold text-slate-600">
                      Distance
                    </label>
                    <select
                      id="hero-radius"
                      value={radius}
                      onChange={(e) => setRadius(e.target.value)}
                      className="mt-1 h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-900 focus:border-red-600 focus:bg-white focus:outline-none tabular-nums"
                    >
                      <option value="25">25 Miles</option>
                      <option value="50">50 Miles</option>
                      <option value="100">100 Miles</option>
                      <option value="250">250 Miles</option>
                      <option value="nationwide">Nationwide</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="hero-zip" className="block text-xs font-semibold text-slate-600">
                      ZIP Code
                    </label>
                    <input
                      id="hero-zip"
                      type="text"
                      inputMode="numeric"
                      maxLength={5}
                      value={zip}
                      onChange={(e) => setZip(e.target.value.replace(/\D/g, ''))}
                      placeholder="10001"
                      className="mt-1 h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 font-mono text-sm font-medium text-slate-900 focus:border-red-600 focus:bg-white focus:outline-none tabular-nums"
                    />
                  </div>

                  <div className="flex items-end">
                    <button
                      type="submit"
                      className="flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-red-600 px-4 text-sm font-bold text-white transition-colors duration-150 hover:bg-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2 whitespace-nowrap"
                    >
                      <Search className="h-4 w-4" aria-hidden="true" />
                      <span className="tabular-nums">Show {matchingCount} Matches</span>
                    </button>
                  </div>
                </div>

                {/* Popular Brand Searches strip replicated cleanly */}
                <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-slate-100 pt-2.5 text-xs text-slate-500">
                  <span className="font-semibold text-slate-600">Quick Search:</span>
                  {['Ford', 'Toyota', 'Honda', 'Chevrolet', 'Nissan'].map((brand) => (
                    <Link
                      key={brand}
                      to={`/cars-for-sale?make=${encodeURIComponent(brand)}&radius=nationwide`}
                      className="font-semibold text-slate-700 hover:text-red-600 transition-colors"
                    >
                      {brand}
                    </Link>
                  ))}
                  <span aria-hidden="true">&middot;</span>
                  <Link
                    to="/cars-for-sale?maxPrice=5000&radius=nationwide"
                    className="font-semibold text-red-600 hover:text-red-700 transition-colors"
                  >
                    Under $5,000
                  </Link>
                </div>
              </form>
            </div>

            {/* Right: Official AutoLux USA Brand Banner */}
            <div className="flex flex-col justify-center lg:col-span-5">
              <div className="relative overflow-hidden rounded-xl border border-slate-800 bg-slate-900 shadow-2xl lg:h-full">
                <img
                  src={AUTOLUX_LOGO}
                  alt="AutoLux USA — Drive Your Dream: Cars for Sale, Car Rental, Trusted Dealer, Premium Quality"
                  className="h-full w-full object-cover"
                  fetchPriority="high"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Compact Quick-Jump & Pre-Qualification Bar */}
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-3 px-4 py-3.5 sm:flex-row sm:items-center sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="font-semibold text-slate-500">Quick Jump:</span>
            <button
              type="button"
              onClick={() => scrollToSection('browse-inventory')}
              className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1.5 font-semibold text-slate-700 hover:border-red-300 hover:text-red-600 transition-colors"
            >
              <ArrowDown className="h-3 w-3" aria-hidden="true" />
              <span>Makes &amp; Inspections</span>
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('featured-inventory')}
              className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1.5 font-semibold text-slate-700 hover:border-red-300 hover:text-red-600 transition-colors"
            >
              <ArrowDown className="h-3 w-3" aria-hidden="true" />
              <span>Under $15k &amp; Featured</span>
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('insights-dealers')}
              className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1.5 font-semibold text-slate-700 hover:border-red-300 hover:text-red-600 transition-colors"
            >
              <ArrowDown className="h-3 w-3" aria-hidden="true" />
              <span>Reviews, Lots &amp; FAQs</span>
            </button>
          </div>

          <Link
            to="/financing"
            className="inline-flex items-center gap-2 rounded-lg bg-slate-950 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-red-600 whitespace-nowrap shrink-0"
          >
            <DollarSign className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Pre-Qualify (Zero Credit Impact)</span>
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </div>
      </section>

      {/* 2. Compact Browse by Make, Body Style, Price, or Inspection Regime */}
      <section id="browse-inventory" className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 scroll-mt-16">
        <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h2 className="font-display text-xl font-bold tracking-tight text-slate-950">
              Shop by Make, Body Style, Price, or Inspection Care
            </h2>
          </div>

          <div className="inline-flex flex-wrap rounded-lg border border-slate-200 bg-white p-1">
            {(
              [
                { id: 'makes', label: 'Popular Makes' },
                { id: 'styles', label: 'Body Styles' },
                { id: 'price', label: 'Shop by Price' },
                { id: 'programs', label: 'Inspection & Care' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setBrowseTab(tab.id)}
                className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap ${
                  browseTab === tab.id
                    ? 'bg-slate-950 text-white'
                    : 'text-slate-600 hover:text-slate-950'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {browseTab === 'makes' && (
          <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-4 lg:grid-cols-6">
            {POPULAR_MAKES.map((item) => (
              <Link
                key={item.name}
                to={`/cars-for-sale?make=${encodeURIComponent(item.name)}&radius=nationwide`}
                className="group flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 transition-all duration-150 hover:border-red-300 hover:shadow-xs"
              >
                <span className="font-display text-sm font-bold text-slate-950 group-hover:text-red-600">
                  {item.name}
                </span>
                <span className="text-xs tabular-nums text-slate-500">
                  {item.count.toLocaleString()}
                </span>
              </Link>
            ))}
          </div>
        )}

        {browseTab === 'styles' && (
          <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-6">
            {BODY_STYLES.map((style) => (
              <Link
                key={style.name}
                to={`/cars-for-sale?bodyStyle=${encodeURIComponent(style.name)}&radius=nationwide`}
                className="group flex flex-col justify-between rounded-lg border border-slate-200 bg-white p-3 transition-all duration-150 hover:border-red-300 hover:shadow-xs"
              >
                <span className="font-display text-sm font-bold text-slate-950 group-hover:text-red-600">
                  {style.label}
                </span>
                <span className="mt-0.5 text-xs tabular-nums text-slate-500">
                  {style.count.toLocaleString()} vehicles
                </span>
              </Link>
            ))}
          </div>
        )}

        {browseTab === 'price' && (
          <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
            {PRICE_TIERS.map((tier) => (
              <Link
                key={tier.label}
                to={`/cars-for-sale?${tier.query}`}
                className="group flex items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-3 transition-all duration-150 hover:border-red-300 hover:shadow-xs"
              >
                <div>
                  <div className="font-display text-sm font-bold text-slate-950 group-hover:text-red-600">
                    {tier.label}
                  </div>
                  <div className="text-xs text-slate-500">{tier.subtitle}</div>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-red-600" aria-hidden="true" />
              </Link>
            ))}
          </div>
        )}

        {browseTab === 'programs' && (
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
            {INSPECTION_PROGRAMS.map((prog) => (
              <Link
                key={prog.badge}
                to={prog.to}
                className="group flex items-center gap-4 overflow-hidden rounded-xl border border-slate-200 bg-white p-3.5 transition-all duration-150 hover:border-red-300 hover:shadow-sm"
              >
                <img
                  src={prog.image}
                  alt={prog.title}
                  className="h-20 w-24 shrink-0 rounded-lg object-cover"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                />
                <div className="min-w-0">
                  <div className="text-[11px] font-bold text-red-600">{prog.badge}</div>
                  <h3 className="font-display text-sm font-bold text-slate-950 group-hover:text-red-600 line-clamp-1">
                    {prog.title}
                  </h3>
                  <p className="mt-0.5 text-xs text-slate-600 line-clamp-2">{prog.subtitle}</p>
                  <span className="mt-1.5 inline-flex items-center gap-1 text-xs font-bold text-slate-950 group-hover:text-red-600">
                    <span>{prog.cta}</span>
                    <ArrowRight className="h-3 w-3" aria-hidden="true" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* 3. Unified Featured Inventory & Budget Picks (Single 3-Card Row) */}
      <section
        id="featured-inventory"
        className="border-t border-slate-200 bg-white py-8 scroll-mt-16"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-1">
                <button
                  type="button"
                  onClick={() => setInventoryTab('value')}
                  className={`rounded-md px-3.5 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap ${
                    inventoryTab === 'value'
                      ? 'bg-slate-950 text-white'
                      : 'text-slate-600 hover:text-slate-950'
                  }`}
                >
                  Budget Picks (&lt;$15k)
                </button>
                <button
                  type="button"
                  onClick={() => setInventoryTab('featured')}
                  className={`rounded-md px-3.5 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap ${
                    inventoryTab === 'featured'
                      ? 'bg-slate-950 text-white'
                      : 'text-slate-600 hover:text-slate-950'
                  }`}
                >
                  Featured Flagships
                </button>
                {recentlyViewedVehicles.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setInventoryTab('recent')}
                    className={`rounded-md px-3.5 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap tabular-nums ${
                      inventoryTab === 'recent'
                        ? 'bg-slate-950 text-white'
                        : 'text-slate-600 hover:text-slate-950'
                    }`}
                  >
                    Recently Viewed ({recentlyViewedVehicles.length})
                  </button>
                )}
              </div>

              {inventoryTab === 'recent' && recentlyViewedVehicles.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    clearRecentlyViewed();
                    setInventoryTab('value');
                  }}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-900"
                >
                  Clear History
                </button>
              )}
            </div>

            <Link
              to="/cars-for-sale"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-red-600 hover:text-red-700 whitespace-nowrap"
            >
              <span>Browse All {vehicles.length} Vehicles</span>
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>

          <motion.div
            key={inventoryTab}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="mt-5 grid grid-cols-1 gap-6 md:grid-cols-3"
          >
            {displayedVehicles.map((vehicle) => (
              <VehicleCard key={vehicle.id} vehicle={vehicle} />
            ))}
          </motion.div>
        </div>
      </section>

      {/* 4. Compact Trust Strip + Tabbed Testimonials, Guides, Regional Lots & Buying FAQs */}
      <section id="insights-dealers" className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 scroll-mt-16">
        <div className="grid grid-cols-2 gap-4 rounded-xl border border-slate-200 bg-white p-4 lg:grid-cols-4">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="h-5 w-5 shrink-0 text-red-600" aria-hidden="true" />
            <div>
              <div className="font-display text-xs font-bold text-slate-950">Expert Visual &amp; Health Check</div>
              <div className="text-[11px] text-slate-500">Inspected &amp; free history report</div>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <BadgeCheck className="h-5 w-5 shrink-0 text-red-600" aria-hidden="true" />
            <div>
              <div className="font-display text-xs font-bold text-slate-950">Down Payments From $500</div>
              <div className="text-[11px] text-slate-500">Flexible monthly financing plans</div>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <CarFront className="h-5 w-5 shrink-0 text-red-600" aria-hidden="true" />
            <div>
              <div className="font-display text-xs font-bold text-slate-950">Warranty &amp; Doorstep Delivery</div>
              <div className="text-[11px] text-slate-500">Nationwide shipping &amp; coverage</div>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <Compass className="h-5 w-5 shrink-0 text-red-600" aria-hidden="true" />
            <div>
              <div className="font-display text-xs font-bold text-slate-950">24/7 Advisor Consultation</div>
              <div className="text-[11px] text-slate-500">TX, CA &amp; NY certified hubs</div>
            </div>
          </div>
        </div>

        <div className="mt-7 flex flex-wrap items-center justify-between gap-4">
          <div className="inline-flex flex-wrap rounded-lg border border-slate-200 bg-white p-1">
            {(
              [
                { id: 'testimonials', label: 'Customer Reviews' },
                { id: 'dealers', label: 'TX, CA & NY Lots' },
                { id: 'reviews', label: 'Guides & Tutorials' },
                { id: 'faqs', label: 'Buying FAQs' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setInsightsTab(tab.id)}
                className={`rounded-md px-3.5 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap ${
                  insightsTab === tab.id
                    ? 'bg-slate-950 text-white'
                    : 'text-slate-600 hover:text-slate-950'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <Link
            to={insightsTab === 'reviews' ? '/research' : insightsTab === 'dealers' ? '/dealers' : '/cars-for-sale'}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-red-600 hover:text-red-700 whitespace-nowrap"
          >
            <span>
              {insightsTab === 'reviews'
                ? 'Research Hub'
                : insightsTab === 'dealers'
                  ? 'All 7 Regional Lots'
                  : 'Request a Quote'}
            </span>
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>

        {insightsTab === 'testimonials' && (
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
            {CUSTOMER_TESTIMONIALS.map((item) => (
              <article
                key={item.name}
                className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5"
              >
                <div>
                  <div className="flex items-center gap-0.5 text-amber-400" aria-label="5 out of 5 stars">
                    {Array.from({ length: item.rating }).map((_, idx) => (
                      <Star key={idx} className="h-4 w-4 fill-amber-400" aria-hidden="true" />
                    ))}
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-slate-700">“{item.quote}”</p>
                </div>
                <div className="mt-4 border-t border-slate-100 pt-3">
                  <div className="font-display text-sm font-bold text-slate-950">{item.name}</div>
                  <div className="text-xs text-slate-500">{item.location}</div>
                </div>
              </article>
            ))}
          </div>
        )}

        {insightsTab === 'reviews' && (
          <div className="mt-4 grid grid-cols-1 gap-5 md:grid-cols-3">
            {RESEARCH_ARTICLES.map((article) => (
              <article
                key={article.id}
                className="group flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
              >
                <Link to={`/research?article=${article.slug}`} className="aspect-[16/10] overflow-hidden bg-slate-100">
                  <img
                    src={article.image}
                    alt={article.title}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                    loading="lazy"
                    decoding="async"
                    referrerPolicy="no-referrer"
                  />
                </Link>
                <div className="flex flex-1 flex-col justify-between p-4">
                  <div>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span className="font-semibold text-red-600">{article.category}</span>
                      <span aria-hidden="true">&middot;</span>
                      <span>{article.readTime}</span>
                    </div>
                    <Link to={`/research?article=${article.slug}`} className="mt-1.5 block">
                      <h3 className="font-display text-sm font-bold leading-snug text-slate-950 line-clamp-2 group-hover:text-red-600 transition-colors">
                        {article.title}
                      </h3>
                    </Link>
                  </div>
                  <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-500">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" aria-hidden="true" />
                    <span>{article.author}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {insightsTab === 'dealers' && (
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
            {[DEALERS[5], DEALERS[6], DEALERS[0]].map((dealer) => (
              <Link
                key={dealer.id}
                to={`/cars-for-sale?zip=${dealer.zip}&radius=nationwide`}
                className="group flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 transition-all duration-150 hover:border-red-300 hover:shadow-sm"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-display text-base font-bold text-slate-950 group-hover:text-red-600">
                      {dealer.name}
                    </h3>
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-900 tabular-nums shrink-0">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" aria-hidden="true" />
                      {dealer.rating}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                    <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>
                      {dealer.city}, {dealer.state} &middot; {dealer.hours}
                    </span>
                  </div>
                </div>
                <div className="mt-3 text-xs font-medium text-slate-600">
                  {dealer.specialties.slice(0, 3).join(' · ')}
                </div>
              </Link>
            ))}
          </div>
        )}

        {insightsTab === 'faqs' && (
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            {BUYING_FAQS.map((item) => (
              <article key={item.q} className="rounded-xl border border-slate-200 bg-white p-5">
                <h3 className="flex items-start gap-2 font-display text-sm font-bold text-slate-950">
                  <HelpCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" aria-hidden="true" />
                  <span>{item.q}</span>
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-600">{item.a}</p>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
