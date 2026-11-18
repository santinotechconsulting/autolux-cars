import {
  ArrowRight,
  BadgeCheck,
  CarFront,
  CheckCircle2,
  Compass,
  DollarSign,
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
  POPULAR_MAKES,
  PRICE_TIERS,
  RESEARCH_ARTICLES,
} from '../data/inventory';
import { useSeo } from '../hooks/useSeo';

export function HomePage() {
  const navigate = useNavigate();
  const { vehicles, userProfile, recentlyViewedIds, clearRecentlyViewed } = useMarketplace();

  const [listingType, setListingType] = useState<'All' | 'Sale' | 'Rental'>('All');
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [zip, setZip] = useState(userProfile.defaultZip || '10001');
  const [radius, setRadius] = useState(userProfile.defaultRadius || '50');
  const [browseTab, setBrowseTab] = useState<'makes' | 'styles' | 'price'>('makes');

  useSeo({
    title: 'AutoLux USA – Cars for Sale, Rentals & Trusted Dealers',
    description:
      'Search thousands of inspected new and used cars for sale and rental nationwide on AutoLux USA. Free vehicle history reports and soft-pull auto financing.',
    path: '/',
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'AutoDealer',
      name: 'AutoLux USA',
      description:
        'Nationwide marketplace for cars for sale, luxury car rentals, verified dealer inventory, and instant auto financing pre-qualification.',
      image: '/assets/aistudio/Autolux_46ec3fca.png',
      areaServed: 'US',
    },
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

  const featuredVehicles = useMemo(() => vehicles.slice(0, 6), [vehicles]);

  const recentlyViewedVehicles = useMemo(
    () =>
      recentlyViewedIds
        .map((id) => vehicles.find((v) => v.id === id))
        .filter((v): v is NonNullable<typeof v> => Boolean(v))
        .slice(0, 3),
    [recentlyViewedIds, vehicles],
  );

  return (
    <div>
      {/* 1. Hero Search Showcase */}
      <section className="relative overflow-hidden bg-slate-950 text-white">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
          <div className="grid grid-cols-1 items-stretch gap-8 lg:grid-cols-12">
            {/* Left: Search Widget */}
            <div className="flex flex-col justify-between lg:col-span-7">
              <div>
                <h1 className="font-display text-3xl font-extrabold tracking-tight text-white sm:text-5xl text-balance leading-[1.1]">
                  Find Your Next Car, Truck, or Executive Rental
                </h1>
                <p className="mt-3 max-w-2xl text-base text-slate-300 leading-relaxed">
                  Shop verified inventory from trusted dealerships across America with free AutoLux
                  Vehicle History Reports and no-impact financing pre-qualification.
                </p>
              </div>

              <form
                onSubmit={handleSearchSubmit}
                className="mt-6 rounded-xl border border-slate-800 bg-white p-5 text-slate-900 shadow-xl"
              >
                {/* Segmented Listing Mode Selector */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
                  <div className="inline-flex rounded-lg bg-slate-100 p-1">
                    {(['All', 'Sale', 'Rental'] as const).map((mode) => (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => setListingType(mode)}
                        className={`rounded-md px-3.5 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap ${
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

                {/* Multi-Field Search Inputs */}
                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
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
                      className="mt-1 h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-900 focus:border-red-600 focus:bg-white focus:outline-none"
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
                      className="mt-1 h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-900 focus:border-red-600 focus:bg-white focus:outline-none"
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
                      className="mt-1 h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-900 focus:border-red-600 focus:bg-white focus:outline-none tabular-nums"
                    >
                      <option value="">No Max Price</option>
                      <option value="35000">$35,000</option>
                      <option value="50000">$50,000</option>
                      <option value="75000">$75,000</option>
                      <option value="100000">$100,000</option>
                      <option value="150000">$150,000</option>
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
                      className="mt-1 h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-900 focus:border-red-600 focus:bg-white focus:outline-none tabular-nums"
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
                      className="mt-1 h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 font-mono text-sm font-medium text-slate-900 focus:border-red-600 focus:bg-white focus:outline-none tabular-nums"
                    />
                  </div>

                  <div className="flex items-end">
                    <button
                      type="submit"
                      className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-red-600 px-5 text-sm font-bold text-white transition-colors duration-150 hover:bg-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2 whitespace-nowrap"
                    >
                      <Search className="h-4 w-4" aria-hidden="true" />
                      <span className="tabular-nums">Show {matchingCount} Matches</span>
                    </button>
                  </div>
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

      {/* 2. Pre-Qualification Value Banner */}
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-4 px-4 py-5 sm:flex-row sm:items-center sm:px-6 lg:px-8">
          <div className="flex items-start gap-4 sm:items-center">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-600">
              <DollarSign className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <h2 className="font-display text-base font-bold text-slate-950">
                Get Pre-Qualified in Minutes — Zero Credit Score Impact
              </h2>
              <p className="text-sm text-slate-600">
                Know your real monthly budget across participating AutoLux USA dealers before you visit a lot.
              </p>
            </div>
          </div>

          <Link
            to="/financing"
            className="inline-flex items-center gap-2 rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-600 whitespace-nowrap shrink-0"
          >
            <span>Check Buying Power</span>
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </section>

      {/* 3. Browse by Popular Makes / Body Styles / Price Tier */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="font-display text-2xl font-bold tracking-tight text-slate-950">
              Shop by Make, Body Style, or Price
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Jump directly to verified inventory matching your preferred brand or monthly budget.
            </p>
          </div>

          <div className="inline-flex rounded-lg border border-slate-200 bg-white p-1">
            {(
              [
                { id: 'makes', label: 'Popular Makes' },
                { id: 'styles', label: 'Body Styles' },
                { id: 'price', label: 'Shop by Price' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setBrowseTab(tab.id)}
                className={`rounded-md px-3.5 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap ${
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
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {POPULAR_MAKES.map((item) => (
              <Link
                key={item.name}
                to={`/cars-for-sale?make=${encodeURIComponent(item.name)}`}
                className="group flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-4 transition-all duration-150 hover:-translate-y-0.5 hover:border-red-300 hover:shadow-sm"
              >
                <span className="font-display text-sm font-bold text-slate-950 group-hover:text-red-600">
                  {item.name}
                </span>
                <span className="mt-1 text-xs tabular-nums text-slate-500">
                  {item.count.toLocaleString()} listings
                </span>
              </Link>
            ))}
          </div>
        )}

        {browseTab === 'styles' && (
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {BODY_STYLES.map((style) => (
              <Link
                key={style.name}
                to={`/cars-for-sale?bodyStyle=${encodeURIComponent(style.name)}`}
                className="group flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-4 transition-all duration-150 hover:-translate-y-0.5 hover:border-red-300 hover:shadow-sm"
              >
                <span className="font-display text-sm font-bold text-slate-950 group-hover:text-red-600">
                  {style.label}
                </span>
                <span className="mt-1 text-xs tabular-nums text-slate-500">
                  {style.count.toLocaleString()} vehicles
                </span>
              </Link>
            ))}
          </div>
        )}

        {browseTab === 'price' && (
          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {PRICE_TIERS.map((tier) => (
              <Link
                key={tier.label}
                to={`/cars-for-sale?${tier.query}`}
                className="group flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 transition-all duration-150 hover:-translate-y-0.5 hover:border-red-300 hover:shadow-sm"
              >
                <div>
                  <div className="font-display text-sm font-bold text-slate-950 group-hover:text-red-600">
                    {tier.label}
                  </div>
                  <div className="mt-0.5 text-xs text-slate-500">{tier.subtitle}</div>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-red-600" aria-hidden="true" />
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* 4. Newly Listed & Featured Vehicles */}
      <section className="border-t border-slate-200 bg-white py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <h2 className="font-display text-2xl font-bold tracking-tight text-slate-950">
                Newly Listed &amp; Featured Inventory
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                Fresh arrivals inspected by AutoLux USA partner dealerships with clean history reports.
              </p>
            </div>
            <Link
              to="/cars-for-sale"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-red-600 hover:text-red-700 whitespace-nowrap"
            >
              <span>Browse All {vehicles.length} Featured Vehicles</span>
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="mt-7 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
          >
            {featuredVehicles.map((vehicle) => (
              <VehicleCard key={vehicle.id} vehicle={vehicle} />
            ))}
          </motion.div>
        </div>
      </section>

      {/* 5. Recently Viewed Strip (Carsforsale.com Session Continuity) */}
      {recentlyViewedVehicles.length > 0 && (
        <section className="border-t border-slate-200 bg-slate-50 py-10">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="font-display text-xl font-bold tracking-tight text-slate-950">
                  Recently Viewed Vehicles
                </h2>
                <p className="text-xs text-slate-500">Pick up right where you left off.</p>
              </div>
              <button
                type="button"
                onClick={clearRecentlyViewed}
                className="text-xs font-semibold text-slate-500 hover:text-slate-900"
              >
                Clear History
              </button>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-6 md:grid-cols-3">
              {recentlyViewedVehicles.map((vehicle) => (
                <VehicleCard key={vehicle.id} vehicle={vehicle} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 6. Trust Indicators, Local Trusted Dealers & Trending Research */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 rounded-xl border border-slate-200 bg-white p-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-red-600" aria-hidden="true" />
            <div>
              <h3 className="font-display text-sm font-bold text-slate-950">Free History Reports</h3>
              <p className="mt-1 text-xs leading-relaxed text-slate-600">
                Verify accident records, ownership count, and title status on every eligible VIN.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <BadgeCheck className="mt-0.5 h-5 w-5 shrink-0 text-red-600" aria-hidden="true" />
            <div>
              <h3 className="font-display text-sm font-bold text-slate-950">Trusted Dealer Network</h3>
              <p className="mt-1 text-xs leading-relaxed text-slate-600">
                Shop directly from vetted franchise and premier independent dealers nationwide.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CarFront className="mt-0.5 h-5 w-5 shrink-0 text-red-600" aria-hidden="true" />
            <div>
              <h3 className="font-display text-sm font-bold text-slate-950">Buy or Executive Rent</h3>
              <p className="mt-1 text-xs leading-relaxed text-slate-600">
                Seamless access to both vehicle ownership and short-term luxury car rentals.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Compass className="mt-0.5 h-5 w-5 shrink-0 text-red-600" aria-hidden="true" />
            <div>
              <h3 className="font-display text-sm font-bold text-slate-950">Sell or Trade Fast</h3>
              <p className="mt-1 text-xs leading-relaxed text-slate-600">
                Get an instant market cash offer or list privately directly from your AutoLux dashboard.
              </p>
            </div>
          </div>
        </div>

        {/* Local Certified Dealers Preview */}
        <div className="mt-12 flex items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl font-bold tracking-tight text-slate-950">
              Featured Certified Dealerships
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Top-rated AutoLux USA partners near ZIP {zip || '10001'}.
            </p>
          </div>
          <Link
            to="/dealers"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-red-600 hover:text-red-700 whitespace-nowrap"
          >
            <span>All Dealers</span>
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          {DEALERS.slice(0, 3).map((dealer) => (
            <Link
              key={dealer.id}
              to={`/cars-for-sale?zip=${dealer.zip}`}
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
                    {dealer.city}, {dealer.state} &middot; {dealer.inventoryCount} vehicles
                  </span>
                </div>
              </div>
              <div className="mt-3 text-xs font-medium text-slate-600">
                {dealer.specialties.slice(0, 3).join(' · ')}
              </div>
            </Link>
          ))}
        </div>

        {/* Trending Car News & Expert Reviews */}
        <div className="mt-12 flex items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl font-bold tracking-tight text-slate-950">
              Trending Car News &amp; Expert Reviews
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Road tests, market pricing data, and side-by-side comparisons from AutoLux editors.
            </p>
          </div>
          <Link
            to="/research"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-red-600 hover:text-red-700 whitespace-nowrap"
          >
            <span>Research Hub</span>
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
          {RESEARCH_ARTICLES.map((article) => (
            <article
              key={article.id}
              className="group flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
            >
              <Link to={`/research?article=${article.slug}`} className="aspect-[4/3] overflow-hidden bg-slate-100">
                <img
                  src={article.image}
                  alt={article.title}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                  loading="lazy"
                  decoding="async"
                  referrerPolicy="no-referrer"
                />
              </Link>
              <div className="flex flex-1 flex-col justify-between p-5">
                <div>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span className="font-semibold text-red-600">{article.category}</span>
                    <span aria-hidden="true">&middot;</span>
                    <span>{article.readTime}</span>
                  </div>
                  <Link to={`/research?article=${article.slug}`} className="mt-2 block">
                    <h3 className="font-display text-base font-bold leading-snug text-slate-950 group-hover:text-red-600 transition-colors">
                      {article.title}
                    </h3>
                  </Link>
                  <p className="mt-2 line-clamp-2 text-sm text-slate-600">{article.excerpt}</p>
                </div>
                <div className="mt-4 flex items-center gap-1.5 text-xs text-slate-500">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" aria-hidden="true" />
                  <span>{article.author}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
