import { BellPlus, LayoutGrid, List, RotateCcw, SlidersHorizontal, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AvailabilityModal } from '../components/AvailabilityModal';
import { VehicleCard } from '../components/VehicleCard';
import { useMarketplace } from '../context/MarketplaceContext';
import { getDealRating } from '../data/inventory';
import { useSeo } from '../hooks/useSeo';
import type { SearchFilters, Vehicle } from '../types/marketplace';

export function SearchResultsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { vehicles, saveSearchAlert, userProfile } = useMarketplace();

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [availabilityVehicle, setAvailabilityVehicle] = useState<Vehicle | null>(null);
  const [visibleCount, setVisibleCount] = useState(12);

  const [filters, setFilters] = useState<SearchFilters>({
    query: searchParams.get('q') || '',
    make: searchParams.get('make') || '',
    model: searchParams.get('model') || '',
    condition: searchParams.get('condition') || '',
    bodyStyle: searchParams.get('bodyStyle') || '',
    listingType: searchParams.get('listingType') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    minYear: searchParams.get('minYear') || '',
    maxYear: searchParams.get('maxYear') || '',
    maxMileage: searchParams.get('maxMileage') || '',
    fuelType: searchParams.get('fuelType') || '',
    drivetrain: searchParams.get('drivetrain') || '',
    transmission: searchParams.get('transmission') || '',
    zip: searchParams.get('zip') || userProfile.defaultZip || '10001',
    radius: searchParams.get('radius') || userProfile.defaultRadius || '50',
    freeHistoryOnly: searchParams.get('freeHistoryOnly') === 'true',
    greatDealsOnly: searchParams.get('greatDealsOnly') === 'true',
    warrantyOnly: searchParams.get('warrantyOnly') === 'true',
    deliveryOnly: searchParams.get('deliveryOnly') === 'true',
    sortBy: (searchParams.get('sortBy') as SearchFilters['sortBy']) || 'best',
  });

  useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      query: searchParams.get('q') || '',
      make: searchParams.get('make') || '',
      model: searchParams.get('model') || '',
      condition: searchParams.get('condition') || '',
      bodyStyle: searchParams.get('bodyStyle') || '',
      listingType: searchParams.get('listingType') || '',
      minPrice: searchParams.get('minPrice') || '',
      maxPrice: searchParams.get('maxPrice') || '',
      minYear: searchParams.get('minYear') || '',
      maxYear: searchParams.get('maxYear') || '',
      maxMileage: searchParams.get('maxMileage') || '',
      fuelType: searchParams.get('fuelType') || '',
      drivetrain: searchParams.get('drivetrain') || '',
      transmission: searchParams.get('transmission') || '',
      freeHistoryOnly: searchParams.get('freeHistoryOnly') === 'true',
      greatDealsOnly: searchParams.get('greatDealsOnly') === 'true',
      warrantyOnly: searchParams.get('warrantyOnly') === 'true',
      deliveryOnly: searchParams.get('deliveryOnly') === 'true',
      sortBy: (searchParams.get('sortBy') as SearchFilters['sortBy']) || 'best',
      zip: searchParams.get('zip') || prev.zip,
      radius: searchParams.get('radius') || prev.radius,
    }));
    setVisibleCount(12);
  }, [searchParams]);

  useEffect(() => {
    if (!mobileFiltersOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileFiltersOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [mobileFiltersOpen]);

  const titlePrefix = filters.make
    ? `${filters.make} ${filters.model || ''} Cars for Sale`.trim()
    : filters.listingType === 'Rental'
      ? 'Executive Car Rentals'
      : 'Cars for Sale Nationwide';

  const updateFilter = <K extends keyof SearchFilters>(key: K, value: SearchFilters[K]) => {
    const next = { ...filters, [key]: value };
    if (key === 'make') {
      next.model = '';
    }
    setFilters(next);
    setVisibleCount(12);

    const params = new URLSearchParams();
    if (next.query) params.set('q', next.query);
    if (next.make) params.set('make', next.make);
    if (next.model) params.set('model', next.model);
    if (next.condition) params.set('condition', next.condition);
    if (next.bodyStyle) params.set('bodyStyle', next.bodyStyle);
    if (next.listingType) params.set('listingType', next.listingType);
    if (next.minPrice) params.set('minPrice', next.minPrice);
    if (next.maxPrice) params.set('maxPrice', next.maxPrice);
    if (next.minYear) params.set('minYear', next.minYear);
    if (next.maxYear) params.set('maxYear', next.maxYear);
    if (next.maxMileage) params.set('maxMileage', next.maxMileage);
    if (next.fuelType) params.set('fuelType', next.fuelType);
    if (next.drivetrain) params.set('drivetrain', next.drivetrain);
    if (next.transmission) params.set('transmission', next.transmission);
    if (next.freeHistoryOnly) params.set('freeHistoryOnly', 'true');
    if (next.greatDealsOnly) params.set('greatDealsOnly', 'true');
    if (next.warrantyOnly) params.set('warrantyOnly', 'true');
    if (next.deliveryOnly) params.set('deliveryOnly', 'true');
    if (next.sortBy && next.sortBy !== 'best') params.set('sortBy', next.sortBy);
    if (next.zip) params.set('zip', next.zip);
    if (next.radius) params.set('radius', next.radius);
    setSearchParams(params, { replace: true });
  };

  const resetFilters = () => {
    setVisibleCount(12);
    setFilters({
      query: '',
      make: '',
      model: '',
      condition: '',
      bodyStyle: '',
      listingType: '',
      minPrice: '',
      maxPrice: '',
      minYear: '',
      maxYear: '',
      maxMileage: '',
      fuelType: '',
      drivetrain: '',
      transmission: '',
      zip: userProfile.defaultZip || '10001',
      radius: userProfile.defaultRadius || '50',
      freeHistoryOnly: false,
      greatDealsOnly: false,
      warrantyOnly: false,
      deliveryOnly: false,
      sortBy: 'best',
    });
    setSearchParams({}, { replace: true });
  };

  const availableMakes = useMemo(
    () => Array.from(new Set(vehicles.map((v) => v.make))).sort(),
    [vehicles],
  );

  const availableModels = useMemo(() => {
    const subset = filters.make ? vehicles.filter((v) => v.make === filters.make) : vehicles;
    return Array.from(new Set(subset.map((v) => v.model))).sort();
  }, [vehicles, filters.make]);

  const filteredVehicles = useMemo(() => {
    const results = vehicles.filter((v) => {
      if (filters.query) {
        const q = filters.query.toLowerCase();
        const hay = `${v.year} ${v.make} ${v.model} ${v.trim} ${v.dealerCity} ${v.bodyStyle}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (filters.make && v.make !== filters.make) return false;
      if (filters.model && v.model !== filters.model) return false;
      if (filters.condition && v.condition !== filters.condition) return false;
      if (filters.bodyStyle && v.bodyStyle !== filters.bodyStyle) return false;
      if (filters.listingType && v.listingType !== filters.listingType) return false;
      if (filters.minPrice && v.price < Number(filters.minPrice)) return false;
      if (filters.maxPrice && v.price > Number(filters.maxPrice)) return false;
      if (filters.minYear && v.year < Number(filters.minYear)) return false;
      if (filters.maxYear && v.year > Number(filters.maxYear)) return false;
      if (filters.maxMileage && v.mileage > Number(filters.maxMileage)) return false;
      if (filters.fuelType && v.fuelType !== filters.fuelType) return false;
      if (filters.drivetrain && v.drivetrain !== filters.drivetrain) return false;
      if (filters.transmission && v.transmission !== filters.transmission) return false;
      if (filters.freeHistoryOnly && !v.freeHistoryReport) return false;
      if (filters.greatDealsOnly && getDealRating(v).rating !== 'Great Deal') return false;
      if (filters.warrantyOnly && !v.warrantySummary && v.condition !== 'Certified Pre-Owned') return false;
      if (filters.deliveryOnly && !v.deliveryAvailable) return false;
      if (filters.radius && filters.radius !== 'nationwide') {
        if (v.distanceMiles > Number(filters.radius)) return false;
      }
      return true;
    });

    return [...results].sort((a, b) => {
      switch (filters.sortBy) {
        case 'price_asc':
          return a.price - b.price;
        case 'price_desc':
          return b.price - a.price;
        case 'mileage_asc':
          return a.mileage - b.mileage;
        case 'year_desc':
          return b.year - a.year;
        default:
          return Number(b.isFeatured) - Number(a.isFeatured) || a.distanceMiles - b.distanceMiles;
      }
    });
  }, [vehicles, filters]);

  useSeo({
    title: `${titlePrefix}${filters.maxPrice ? ` Under $${Number(filters.maxPrice).toLocaleString()}` : ''} – AutoLux USA`,
    description: `Compare ${filteredVehicles.length} verified cars for sale and rental on AutoLux USA. Filter by make, price, mileage, warranty, doorstep delivery, and free vehicle history reports.`,
    path: '/cars-for-sale',
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: titlePrefix,
      mainEntity: {
        '@type': 'ItemList',
        numberOfItems: filteredVehicles.length,
        itemListElement: filteredVehicles.slice(0, 10).map((v, idx) => ({
          '@type': 'ListItem',
          position: idx + 1,
          item: {
            '@type': 'Vehicle',
            name: `${v.year} ${v.make} ${v.model} ${v.trim}`,
            url: `/vehicle/${v.slug}`,
            image: v.image,
            vehicleModelDate: v.year,
            offers: {
              '@type': 'Offer',
              price: v.price,
              priceCurrency: 'USD',
              availability: 'https://schema.org/InStock',
            },
          },
        })),
      },
    },
  });

  const activeFilters: { label: string; clear: () => void }[] = [
    ...(filters.query ? [{ label: `"${filters.query}"`, clear: () => updateFilter('query', '') }] : []),
    ...(filters.make ? [{ label: `Make: ${filters.make}`, clear: () => updateFilter('make', '') }] : []),
    ...(filters.model ? [{ label: `Model: ${filters.model}`, clear: () => updateFilter('model', '') }] : []),
    ...(filters.condition ? [{ label: filters.condition, clear: () => updateFilter('condition', '') }] : []),
    ...(filters.bodyStyle ? [{ label: `Style: ${filters.bodyStyle}`, clear: () => updateFilter('bodyStyle', '') }] : []),
    ...(filters.listingType ? [{ label: `Type: ${filters.listingType}`, clear: () => updateFilter('listingType', '') }] : []),
    ...(filters.minPrice
      ? [{ label: `Min $${Number(filters.minPrice).toLocaleString()}`, clear: () => updateFilter('minPrice', '') }]
      : []),
    ...(filters.maxPrice
      ? [{ label: `Max $${Number(filters.maxPrice).toLocaleString()}`, clear: () => updateFilter('maxPrice', '') }]
      : []),
    ...(filters.minYear ? [{ label: `${filters.minYear}+`, clear: () => updateFilter('minYear', '') }] : []),
    ...(filters.maxMileage
      ? [{ label: `Max ${Number(filters.maxMileage).toLocaleString()} mi`, clear: () => updateFilter('maxMileage', '') }]
      : []),
    ...(filters.fuelType ? [{ label: filters.fuelType, clear: () => updateFilter('fuelType', '') }] : []),
    ...(filters.drivetrain ? [{ label: filters.drivetrain, clear: () => updateFilter('drivetrain', '') }] : []),
    ...(filters.freeHistoryOnly
      ? [{ label: 'Free History Report', clear: () => updateFilter('freeHistoryOnly', false) }]
      : []),
    ...(filters.greatDealsOnly
      ? [{ label: 'Great Deals Only', clear: () => updateFilter('greatDealsOnly', false) }]
      : []),
    ...(filters.warrantyOnly
      ? [{ label: 'Warranty Included', clear: () => updateFilter('warrantyOnly', false) }]
      : []),
    ...(filters.deliveryOnly
      ? [{ label: 'Home Delivery Ready', clear: () => updateFilter('deliveryOnly', false) }]
      : []),
  ];

  const handleSaveCurrentSearch = () => {
    const parts = [
      filters.condition,
      filters.make || 'All Makes',
      filters.model,
      filters.bodyStyle,
      filters.maxPrice ? `Under $${Number(filters.maxPrice).toLocaleString()}` : '',
    ].filter(Boolean);
    const label = parts.join(' ') || 'Custom Vehicle Alert';
    saveSearchAlert(label, filters, filteredVehicles.length);
  };

  const filterPanel = (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <h2 className="font-display text-sm font-bold text-slate-950">Filter Inventory</h2>
        <button
          type="button"
          onClick={resetFilters}
          className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 hover:text-red-700"
        >
          <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Reset</span>
        </button>
      </div>

      <div>
        <label htmlFor="srp-query" className="block text-xs font-semibold text-slate-700">
          Keyword Search
        </label>
        <input
          id="srp-query"
          type="text"
          value={filters.query}
          onChange={(e) => updateFilter('query', e.target.value)}
          placeholder="e.g. AMG, Hybrid, Lariat..."
          className="mt-1.5 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:border-red-600 focus:outline-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        <div>
          <label htmlFor="srp-zip" className="block text-xs font-semibold text-slate-700">
            ZIP Code
          </label>
          <input
            id="srp-zip"
            type="text"
            maxLength={5}
            value={filters.zip}
            onChange={(e) => updateFilter('zip', e.target.value.replace(/\D/g, ''))}
            className="mt-1.5 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 font-mono text-sm tabular-nums focus:border-red-600 focus:outline-none"
          />
        </div>
        <div>
          <label htmlFor="srp-radius" className="block text-xs font-semibold text-slate-700">
            Radius
          </label>
          <select
            id="srp-radius"
            value={filters.radius}
            onChange={(e) => updateFilter('radius', e.target.value)}
            className="mt-1.5 h-10 w-full rounded-lg border border-slate-200 bg-white px-2.5 text-sm focus:border-red-600 focus:outline-none"
          >
            <option value="25">25 mi</option>
            <option value="50">50 mi</option>
            <option value="100">100 mi</option>
            <option value="250">250 mi</option>
            <option value="nationwide">Nationwide</option>
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="srp-listing-type" className="block text-xs font-semibold text-slate-700">
          Listing Type
        </label>
        <select
          id="srp-listing-type"
          value={filters.listingType}
          onChange={(e) => updateFilter('listingType', e.target.value)}
          className="mt-1.5 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm focus:border-red-600 focus:outline-none"
        >
          <option value="">All (Sale &amp; Rental)</option>
          <option value="Sale">Cars for Sale</option>
          <option value="Rental">Car Rental Available</option>
        </select>
      </div>

      <div>
        <label htmlFor="srp-condition" className="block text-xs font-semibold text-slate-700">
          Condition
        </label>
        <select
          id="srp-condition"
          value={filters.condition}
          onChange={(e) => updateFilter('condition', e.target.value)}
          className="mt-1.5 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm focus:border-red-600 focus:outline-none"
        >
          <option value="">All Conditions</option>
          <option value="New">New</option>
          <option value="Used">Used</option>
          <option value="Certified Pre-Owned">Certified Pre-Owned</option>
        </select>
      </div>

      <div>
        <label htmlFor="srp-make" className="block text-xs font-semibold text-slate-700">
          Make
        </label>
        <select
          id="srp-make"
          value={filters.make}
          onChange={(e) => updateFilter('make', e.target.value)}
          className="mt-1.5 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm focus:border-red-600 focus:outline-none"
        >
          <option value="">All Makes</option>
          {availableMakes.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="srp-model" className="block text-xs font-semibold text-slate-700">
          Model
        </label>
        <select
          id="srp-model"
          value={filters.model}
          onChange={(e) => updateFilter('model', e.target.value)}
          className="mt-1.5 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm focus:border-red-600 focus:outline-none"
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
        <label htmlFor="srp-bodystyle" className="block text-xs font-semibold text-slate-700">
          Body Style
        </label>
        <select
          id="srp-bodystyle"
          value={filters.bodyStyle}
          onChange={(e) => updateFilter('bodyStyle', e.target.value)}
          className="mt-1.5 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm focus:border-red-600 focus:outline-none"
        >
          <option value="">All Styles</option>
          <option value="SUV">SUV</option>
          <option value="Truck">Truck</option>
          <option value="Sedan">Sedan</option>
          <option value="Coupe">Coupe</option>
          <option value="Electric">Electric</option>
          <option value="Luxury">Luxury</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        <div>
          <label htmlFor="srp-min-year" className="block text-xs font-semibold text-slate-700">
            Min Year
          </label>
          <select
            id="srp-min-year"
            value={filters.minYear}
            onChange={(e) => updateFilter('minYear', e.target.value)}
            className="mt-1.5 h-10 w-full rounded-lg border border-slate-200 bg-white px-2.5 text-sm tabular-nums focus:border-red-600 focus:outline-none"
          >
            <option value="">Any</option>
            <option value="2024">2024+</option>
            <option value="2023">2023+</option>
            <option value="2022">2022+</option>
            <option value="2015">2015+</option>
            <option value="2005">2005+</option>
            <option value="1995">1995+</option>
            <option value="1985">1985+</option>
          </select>
        </div>
        <div>
          <label htmlFor="srp-max-mileage" className="block text-xs font-semibold text-slate-700">
            Max Mileage
          </label>
          <select
            id="srp-max-mileage"
            value={filters.maxMileage}
            onChange={(e) => updateFilter('maxMileage', e.target.value)}
            className="mt-1.5 h-10 w-full rounded-lg border border-slate-200 bg-white px-2.5 text-sm tabular-nums focus:border-red-600 focus:outline-none"
          >
            <option value="">Any</option>
            <option value="10000">10,000 mi</option>
            <option value="25000">25,000 mi</option>
            <option value="65000">65,000 mi</option>
            <option value="100000">100,000 mi</option>
            <option value="150000">150,000 mi</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        <div>
          <label htmlFor="srp-min-price" className="block text-xs font-semibold text-slate-700">
            Min Price
          </label>
          <input
            id="srp-min-price"
            type="number"
            step={500}
            min={0}
            value={filters.minPrice}
            onChange={(e) => updateFilter('minPrice', e.target.value)}
            placeholder="$0"
            className="mt-1.5 h-10 w-full rounded-lg border border-slate-200 bg-white px-2.5 text-sm tabular-nums focus:border-red-600 focus:outline-none"
          />
        </div>
        <div>
          <label htmlFor="srp-max-price" className="block text-xs font-semibold text-slate-700">
            Max Price
          </label>
          <input
            id="srp-max-price"
            type="number"
            step={500}
            min={0}
            value={filters.maxPrice}
            onChange={(e) => updateFilter('maxPrice', e.target.value)}
            placeholder="Any"
            className="mt-1.5 h-10 w-full rounded-lg border border-slate-200 bg-white px-2.5 text-sm tabular-nums focus:border-red-600 focus:outline-none"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {['5000', '10000', '15000', '35000'].map((preset) => (
          <button
            key={preset}
            type="button"
            onClick={() => updateFilter('maxPrice', filters.maxPrice === preset ? '' : preset)}
            className={`rounded-md border px-2 py-1 text-[11px] font-semibold tabular-nums transition-colors ${
              filters.maxPrice === preset
                ? 'border-slate-950 bg-slate-950 text-white'
                : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-red-300'
            }`}
          >
            &lt;${Number(preset) / 1000}k
          </button>
        ))}
      </div>

      <div>
        <label htmlFor="srp-fuel" className="block text-xs font-semibold text-slate-700">
          Fuel Type
        </label>
        <select
          id="srp-fuel"
          value={filters.fuelType}
          onChange={(e) => updateFilter('fuelType', e.target.value)}
          className="mt-1.5 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm focus:border-red-600 focus:outline-none"
        >
          <option value="">All Fuel Types</option>
          <option value="Gasoline">Gasoline</option>
          <option value="Hybrid">Hybrid</option>
          <option value="Electric">Electric</option>
        </select>
      </div>

      <div>
        <label htmlFor="srp-drivetrain" className="block text-xs font-semibold text-slate-700">
          Drivetrain
        </label>
        <select
          id="srp-drivetrain"
          value={filters.drivetrain}
          onChange={(e) => updateFilter('drivetrain', e.target.value)}
          className="mt-1.5 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm focus:border-red-600 focus:outline-none"
        >
          <option value="">All Drivetrains</option>
          <option value="AWD">AWD</option>
          <option value="4WD">4WD</option>
          <option value="RWD">RWD</option>
          <option value="FWD">FWD</option>
        </select>
      </div>

      <div className="space-y-2.5 border-t border-slate-100 pt-3">
        <label className="flex items-center gap-2.5 text-sm font-medium text-slate-800 cursor-pointer">
          <input
            type="checkbox"
            checked={filters.greatDealsOnly}
            onChange={(e) => updateFilter('greatDealsOnly', e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-red-600 focus:ring-red-600"
          />
          <span>Great Deals Only (4%+ off)</span>
        </label>

        <label className="flex items-center gap-2.5 text-sm font-medium text-slate-800 cursor-pointer">
          <input
            type="checkbox"
            checked={filters.freeHistoryOnly}
            onChange={(e) => updateFilter('freeHistoryOnly', e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-red-600 focus:ring-red-600"
          />
          <span>Free History Report Only</span>
        </label>

        <label className="flex items-center gap-2.5 text-sm font-medium text-slate-800 cursor-pointer">
          <input
            type="checkbox"
            checked={filters.warrantyOnly}
            onChange={(e) => updateFilter('warrantyOnly', e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-red-600 focus:ring-red-600"
          />
          <span>Warranty Backed Only</span>
        </label>

        <label className="flex items-center gap-2.5 text-sm font-medium text-slate-800 cursor-pointer">
          <input
            type="checkbox"
            checked={filters.deliveryOnly}
            onChange={(e) => updateFilter('deliveryOnly', e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-red-600 focus:ring-red-600"
          />
          <span>Doorstep Delivery Eligible</span>
        </label>
      </div>
    </div>
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Page Header */}
      <div className="border-b border-slate-200 pb-6">
        <h1 className="font-display text-2xl font-extrabold tracking-tight text-slate-950 sm:text-3xl">
          {titlePrefix}
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Showing verified vehicles within{' '}
          <span className="font-semibold text-slate-900">
            {filters.radius === 'nationwide' ? 'all US states' : `${filters.radius} miles of ${filters.zip || '10001'}`}
          </span>
        </p>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Desktop Sidebar Filters */}
        <aside className="hidden lg:block lg:col-span-3">
          <div className="sticky top-20 rounded-xl border border-slate-200 bg-white p-5">
            {filterPanel}
          </div>
        </aside>

        {/* Results Main Column */}
        <div className="lg:col-span-9">
          {/* Sort & Actions Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white px-4 py-3">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 lg:hidden"
              >
                <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Filters</span>
              </button>

              <span className="text-sm font-semibold text-slate-900 tabular-nums">
                {filteredVehicles.length} {filteredVehicles.length === 1 ? 'Vehicle' : 'Vehicles'} Found
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleSaveCurrentSearch}
                className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-100 transition-colors whitespace-nowrap"
              >
                <BellPlus className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Save Search Alert</span>
              </button>

              <div className="flex items-center gap-2">
                <label htmlFor="srp-sort" className="text-xs font-medium text-slate-500">
                  Sort:
                </label>
                <select
                  id="srp-sort"
                  value={filters.sortBy}
                  onChange={(e) => updateFilter('sortBy', e.target.value as SearchFilters['sortBy'])}
                  className="h-9 rounded-lg border border-slate-200 bg-slate-50 px-2.5 text-xs font-semibold text-slate-900 focus:border-red-600 focus:outline-none"
                >
                  <option value="best">Best Match</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="mileage_asc">Mileage: Lowest</option>
                  <option value="year_desc">Year: Newest</option>
                </select>
              </div>

              <div className="hidden sm:inline-flex rounded-lg border border-slate-200 p-0.5">
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  aria-label="Grid view"
                  className={`rounded-md p-1.5 ${
                    viewMode === 'grid' ? 'bg-slate-950 text-white' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <LayoutGrid className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  aria-label="List view"
                  className={`rounded-md p-1.5 ${
                    viewMode === 'list' ? 'bg-slate-950 text-white' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Removable Active Filter Controls */}
          {activeFilters.length > 0 && (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {activeFilters.map((af) => (
                <button
                  key={af.label}
                  type="button"
                  onClick={af.clear}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:border-red-300 hover:text-red-600"
                >
                  <span>{af.label}</span>
                  <X className="h-3 w-3" aria-hidden="true" />
                </button>
              ))}
              <button
                type="button"
                onClick={resetFilters}
                className="text-xs font-semibold text-red-600 hover:text-red-700 px-1"
              >
                Clear All
              </button>
            </div>
          )}

          {/* Results List / Grid */}
          {filteredVehicles.length === 0 ? (
            <div className="mt-6 rounded-xl border border-slate-200 bg-white p-12 text-center">
              <h3 className="font-display text-lg font-bold text-slate-950">
                No vehicles match your current filters
              </h3>
              <p className="mt-2 text-sm text-slate-600">
                Try expanding your search radius to Nationwide or clearing specific price and mileage limits.
              </p>
              <button
                type="button"
                onClick={resetFilters}
                className="mt-5 inline-flex items-center gap-2 rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-700"
              >
                <RotateCcw className="h-4 w-4" aria-hidden="true" />
                <span>Clear All Filters</span>
              </button>
            </div>
          ) : (
            <>
              {viewMode === 'grid' ? (
                <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                  {filteredVehicles.slice(0, visibleCount).map((vehicle) => (
                    <VehicleCard
                      key={vehicle.id}
                      vehicle={vehicle}
                      layout="grid"
                      onCheckAvailability={(v) => setAvailabilityVehicle(v)}
                    />
                  ))}
                </div>
              ) : (
                <div className="mt-6 flex flex-col gap-4">
                  {filteredVehicles.slice(0, visibleCount).map((vehicle) => (
                    <VehicleCard
                      key={vehicle.id}
                      vehicle={vehicle}
                      layout="list"
                      onCheckAvailability={(v) => setAvailabilityVehicle(v)}
                    />
                  ))}
                </div>
              )}

              {filteredVehicles.length > visibleCount && (
                <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => setVisibleCount((prev) => prev + 12)}
                    className="rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-xs font-bold text-slate-950 shadow-xs transition-colors hover:border-red-300 hover:text-red-600 tabular-nums"
                  >
                    Load More ({filteredVehicles.length - visibleCount} Remaining)
                  </button>
                  <button
                    type="button"
                    onClick={() => setVisibleCount(filteredVehicles.length)}
                    className="rounded-lg bg-slate-950 px-5 py-2.5 text-xs font-bold text-white transition-colors hover:bg-red-600 tabular-nums"
                  >
                    Show All {filteredVehicles.length} Vehicles
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-slate-950/60"
            onClick={() => setMobileFiltersOpen(false)}
            aria-hidden="true"
          />
          <div className="relative z-10 h-full w-80 max-w-[85vw] overflow-y-auto bg-white p-5 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <span className="font-display text-base font-bold text-slate-950">Search Filters</span>
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(false)}
                className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100"
                aria-label="Close filters"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {filterPanel}
          </div>
        </div>
      )}

      {/* Quick Availability Inquiry Modal */}
      {availabilityVehicle && (
        <AvailabilityModal
          vehicle={availabilityVehicle}
          onClose={() => setAvailabilityVehicle(null)}
        />
      )}
    </div>
  );
}
