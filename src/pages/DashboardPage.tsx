import {
  ArrowRight,
  Bell,
  Car,
  CheckCircle2,
  ChevronRight,
  Clock,
  CreditCard,
  Download,
  ExternalLink,
  Heart,
  LayoutDashboard,
  Lock,
  Mail,
  MapPin,
  MessageSquare,
  RotateCcw,
  Search,
  Send,
  Settings,
  ShieldCheck,
  Tag,
  Trash2,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { AvailabilityModal } from '../components/AvailabilityModal';
import { useMarketplace } from '../context/MarketplaceContext';
import { useSeo } from '../hooks/useSeo';
import type { NotificationPreferences, UserProfile, Vehicle } from '../types/marketplace';

type DashboardSection =
  | 'overview'
  | 'saved-vehicles'
  | 'saved-searches'
  | 'recently-viewed'
  | 'messages'
  | 'financing'
  | 'listings'
  | 'settings';

const SECTION_ITEMS: { id: DashboardSection; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'saved-vehicles', label: 'Saved Vehicles', icon: Heart },
  { id: 'saved-searches', label: 'Saved Searches', icon: Bell },
  { id: 'recently-viewed', label: 'Recently Viewed', icon: Clock },
  { id: 'messages', label: 'Messages', icon: MessageSquare },
  { id: 'financing', label: 'Financing Hub', icon: CreditCard },
  { id: 'listings', label: 'My Listings', icon: Tag },
  { id: 'settings', label: 'Profile Settings', icon: Settings },
];

function AnimatedSwitch({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2 ${
        checked ? 'bg-red-600' : 'bg-slate-200'
      }`}
    >
      <motion.span
        layout
        transition={{ type: 'spring', stiffness: 500, damping: 32 }}
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );
}

export function DashboardPage() {
  const { section } = useParams<{ section?: string }>();
  const navigate = useNavigate();

  const {
    vehicles,
    savedVehicles,
    savedSearches,
    recentlyViewedIds,
    messages,
    financingProfile,
    userListings,
    userProfile,
    notifications,
    toggleSaveVehicle,
    updateSavedVehicleNote,
    clearRecentlyViewed,
    updateSavedSearch,
    deleteSavedSearch,
    replyToThread,
    markThreadRead,
    removeUserListing,
    updateUserProfile,
    updateNotifications,
    exportUserData,
    resetDemoState,
    showToast,
  } = useMarketplace();

  const validSection: DashboardSection =
    SECTION_ITEMS.find((s) => s.id === section)?.id || 'overview';

  const [activeThreadId, setActiveThreadId] = useState<string>(messages[0]?.id || '');
  const [replyText, setReplyText] = useState('');
  const [noteDrafts, setNoteDrafts] = useState<Record<string, string>>({});
  const [savedSearchQuery, setSavedSearchQuery] = useState('');
  const [availabilityVehicle, setAvailabilityVehicle] = useState<Vehicle | null>(null);

  // Profile Settings Form State
  const [profileForm, setProfileForm] = useState<UserProfile>(userProfile);
  const [passwordForm, setPasswordForm] = useState({
    current: '',
    next: '',
    confirm: '',
  });
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);

  useEffect(() => {
    setProfileForm(userProfile);
  }, [userProfile]);

  useEffect(() => {
    if (!activeThreadId && messages.length > 0) {
      setActiveThreadId(messages[0].id);
    }
  }, [messages, activeThreadId]);

  const activeSectionLabel =
    SECTION_ITEMS.find((s) => s.id === validSection)?.label || 'Overview';

  useSeo({
    title: `${activeSectionLabel} – AutoLux USA Buyer Dashboard`,
    description:
      'Manage your saved vehicles, search alerts, recently viewed cars, dealer conversations, financing pre-qualification, and profile settings on AutoLux USA.',
    path: validSection === 'overview' ? '/dashboard' : `/dashboard/${validSection}`,
  });

  const handleSelectSection = (id: DashboardSection) => {
    if (id === 'overview') {
      navigate('/dashboard');
    } else {
      navigate(`/dashboard/${id}`);
    }
  };

  const unreadCount = messages.filter((m) => m.unread).length;
  const activeThread = messages.find((m) => m.id === activeThreadId) || messages[0];

  const savedVehicleDetails = savedVehicles
    .map((entry) => {
      const vehicle = vehicles.find((v) => v.id === entry.vehicleId);
      return vehicle ? { ...entry, vehicle } : null;
    })
    .filter((item): item is NonNullable<typeof item> => item !== null)
    .filter((item) => {
      if (!savedSearchQuery.trim()) return true;
      const q = savedSearchQuery.toLowerCase();
      return `${item.vehicle.year} ${item.vehicle.make} ${item.vehicle.model} ${item.vehicle.trim}`
        .toLowerCase()
        .includes(q);
    });

  const recentlyViewedVehicles = recentlyViewedIds
    .map((id) => vehicles.find((v) => v.id === id))
    .filter((v): v is NonNullable<typeof v> => Boolean(v));

  const avgSavedPrice =
    savedVehicleDetails.length > 0
      ? Math.round(
          savedVehicleDetails.reduce((sum, item) => sum + item.vehicle.price, 0) /
            savedVehicleDetails.length,
        )
      : 0;

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeThread || !replyText.trim()) return;
    replyToThread(activeThread.id, replyText);
    setReplyText('');
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfile(profileForm);
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.next.length < 8) {
      showToast('New password must be at least 8 characters.', 'info');
      return;
    }
    if (passwordForm.next !== passwordForm.confirm) {
      showToast('New passwords do not match.', 'info');
      return;
    }
    updateUserProfile({
      lastPasswordUpdate: new Date().toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
      }),
    });
    setPasswordForm({ current: '', next: '', confirm: '' });
    setShowPasswordModal(false);
    showToast('Account password updated securely.');
  };

  const buildSearchUrl = (filters: Record<string, unknown>) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => {
      if (v !== undefined && v !== '' && v !== false) {
        params.set(k, String(v));
      }
    });
    return `/cars-for-sale?${params.toString()}`;
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Contextual Top Header & Breadcrumbs */}
      <div className="flex flex-col justify-between gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-center">
        <div>
          <nav aria-label="Dashboard Breadcrumb" className="flex items-center gap-1.5 text-xs text-slate-500">
            <Link to="/" className="hover:text-slate-900">
              AutoLux USA
            </Link>
            <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
            <Link to="/dashboard" className="hover:text-slate-900">
              Buyer Dashboard
            </Link>
            <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
            <span className="font-semibold text-slate-900">{activeSectionLabel}</span>
          </nav>
          <h1 className="mt-1 font-display text-2xl font-extrabold tracking-tight text-slate-950">
            Welcome back, {userProfile.firstName} {userProfile.lastName}
          </h1>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link
            to="/cars-for-sale"
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50 whitespace-nowrap"
          >
            Browse Cars
          </Link>
          <Link
            to="/dashboard/settings"
            className="rounded-lg bg-slate-950 px-4 py-2 text-xs font-semibold text-white hover:bg-red-600 transition-colors whitespace-nowrap"
          >
            Profile Settings
          </Link>
        </div>
      </div>

      {/* Main Workspace Canvas: Sidebar + Viewport */}
      <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Left Sidebar Navigation */}
        <aside className="lg:col-span-3">
          <div className="rounded-xl border border-slate-200 bg-white p-3">
            <div className="flex items-center gap-3 border-b border-slate-100 px-2 pb-3 mb-2">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-950 font-display text-sm font-bold text-white">
                {userProfile.firstName[0]}
                {userProfile.lastName[0]}
              </div>
              <div className="min-w-0">
                <div className="truncate text-sm font-bold text-slate-950">
                  {userProfile.firstName} {userProfile.lastName}
                </div>
                <div className="truncate text-xs text-slate-500">
                  ZIP {userProfile.defaultZip} &middot; {userProfile.defaultRadius} mi
                </div>
              </div>
            </div>

            <nav className="flex flex-row gap-1 overflow-x-auto lg:flex-col" aria-label="Dashboard Sections">
              {SECTION_ITEMS.map((item) => {
                const Icon = item.icon;
                const active = validSection === item.id;
                const count =
                  item.id === 'saved-vehicles'
                    ? savedVehicles.length
                    : item.id === 'saved-searches'
                      ? savedSearches.length
                      : item.id === 'recently-viewed'
                        ? recentlyViewedVehicles.length
                        : item.id === 'messages'
                          ? unreadCount
                          : item.id === 'listings'
                            ? userListings.length
                            : null;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelectSection(item.id)}
                    className={`relative flex items-center justify-between gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium whitespace-nowrap transition-colors ${
                      active ? 'text-white' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950'
                    }`}
                  >
                    {active && (
                      <motion.span
                        layoutId="dashboard-sidebar-pill"
                        transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                        className="absolute inset-0 rounded-lg bg-slate-950"
                      />
                    )}
                    <span className="relative z-10 flex items-center gap-2.5">
                      <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                      <span>{item.label}</span>
                    </span>
                    {count !== null && count > 0 && (
                      <span
                        className={`relative z-10 font-mono text-xs tabular-nums ${
                          active ? 'text-red-300' : 'text-slate-500'
                        }`}
                      >
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* Main Content Viewport */}
        <div className="lg:col-span-9">
          <AnimatePresence mode="wait">
            <motion.div
              key={validSection}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            >
              {/* 1. OVERVIEW */}
              {validSection === 'overview' && (
                <div className="space-y-6">
                  {/* 4-Column KPI Row */}
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    <button
                      type="button"
                      onClick={() => handleSelectSection('saved-vehicles')}
                      className="rounded-xl border border-slate-200 bg-white p-4 text-left transition-all duration-150 hover:-translate-y-0.5 hover:border-red-300"
                    >
                      <div className="text-xs font-medium text-slate-500">Saved Vehicles</div>
                      <div className="mt-1 font-display text-2xl font-extrabold tabular-nums text-slate-950">
                        {savedVehicles.length}
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSelectSection('saved-searches')}
                      className="rounded-xl border border-slate-200 bg-white p-4 text-left transition-all duration-150 hover:-translate-y-0.5 hover:border-red-300"
                    >
                      <div className="text-xs font-medium text-slate-500">Search Alerts</div>
                      <div className="mt-1 font-display text-2xl font-extrabold tabular-nums text-slate-950">
                        {savedSearches.length}
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSelectSection('messages')}
                      className="rounded-xl border border-slate-200 bg-white p-4 text-left transition-all duration-150 hover:-translate-y-0.5 hover:border-red-300"
                    >
                      <div className="text-xs font-medium text-slate-500">Dealer Threads</div>
                      <div className="mt-1 font-display text-2xl font-extrabold tabular-nums text-slate-950">
                        {messages.length}
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSelectSection('financing')}
                      className="rounded-xl border border-slate-200 bg-white p-4 text-left transition-all duration-150 hover:-translate-y-0.5 hover:border-red-300"
                    >
                      <div className="text-xs font-medium text-slate-500">Buying Power</div>
                      <div className="mt-1 font-display text-2xl font-extrabold tabular-nums text-emerald-700">
                        ${financingProfile.estimatedBuyingPower.toLocaleString()}
                      </div>
                    </button>
                  </div>

                  {/* Price Drops & Saved Highlights */}
                  <div className="rounded-xl border border-slate-200 bg-white p-6">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                      <h2 className="font-display text-base font-bold text-slate-950">
                        Saved Vehicle Price Tracker
                      </h2>
                      <button
                        type="button"
                        onClick={() => handleSelectSection('saved-vehicles')}
                        className="text-xs font-semibold text-red-600 hover:text-red-700"
                      >
                        View All Saved
                      </button>
                    </div>

                    {savedVehicleDetails.length === 0 ? (
                      <div className="py-8 text-center text-sm text-slate-500">
                        No vehicles bookmarked yet. Save cars while browsing to track price drops.
                      </div>
                    ) : (
                      <div className="divide-y divide-slate-100">
                        {savedVehicleDetails.slice(0, 3).map(({ vehicle, priceAtSave }) => {
                          const priceDrop = priceAtSave - vehicle.price;
                          return (
                            <div
                              key={vehicle.id}
                              className="flex flex-col justify-between gap-4 py-4 sm:flex-row sm:items-center"
                            >
                              <div className="flex items-center gap-4">
                                <img
                                  src={vehicle.image}
                                  alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                                  className="h-16 w-24 rounded-lg object-cover bg-slate-100 shrink-0"
                                  referrerPolicy="no-referrer"
                                />
                                <div>
                                  <Link
                                    to={`/vehicle/${vehicle.slug}`}
                                    className="font-display text-sm font-bold text-slate-950 hover:text-red-600"
                                  >
                                    {vehicle.year} {vehicle.make} {vehicle.model} {vehicle.trim}
                                  </Link>
                                  <div className="mt-0.5 text-xs text-slate-500 tabular-nums">
                                    {vehicle.mileage.toLocaleString()} mi &middot; {vehicle.dealerName}
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center justify-between gap-3 sm:justify-end">
                                <div className="text-right">
                                  <div className="font-display text-base font-bold tabular-nums text-slate-950">
                                    ${vehicle.price.toLocaleString()}
                                  </div>
                                  {priceDrop > 0 && (
                                    <div className="text-xs font-semibold text-emerald-700 tabular-nums">
                                      Price dropped ${priceDrop.toLocaleString()}
                                    </div>
                                  )}
                                </div>
                                <button
                                  type="button"
                                  onClick={() => setAvailabilityVehicle(vehicle)}
                                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                                >
                                  Inquire
                                </button>
                                <Link
                                  to={`/vehicle/${vehicle.slug}`}
                                  className="rounded-lg bg-slate-950 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-600"
                                >
                                  View
                                </Link>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Active Search Alerts Preview */}
                  <div className="rounded-xl border border-slate-200 bg-white p-6">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                      <h2 className="font-display text-base font-bold text-slate-950">
                        Active Search Alerts
                      </h2>
                      <button
                        type="button"
                        onClick={() => handleSelectSection('saved-searches')}
                        className="text-xs font-semibold text-red-600 hover:text-red-700"
                      >
                        Manage Alerts
                      </button>
                    </div>
                    <div className="divide-y divide-slate-100">
                      {savedSearches.map((alert) => (
                        <div key={alert.id} className="flex items-center justify-between gap-4 py-3.5">
                          <div>
                            <div className="text-sm font-semibold text-slate-950">{alert.name}</div>
                            <div className="text-xs text-slate-500 tabular-nums">
                              {alert.frequency} alerts &middot; {alert.matchCount} matches available
                            </div>
                          </div>
                          <Link
                            to={buildSearchUrl(alert.filters)}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 hover:text-red-700 whitespace-nowrap"
                          >
                            <span>Run Search</span>
                            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                          </Link>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* 2. SAVED VEHICLES */}
              {validSection === 'saved-vehicles' && (
                <div className="rounded-xl border border-slate-200 bg-white p-6">
                  <div className="flex flex-col justify-between gap-4 border-b border-slate-100 pb-4 sm:flex-row sm:items-center">
                    <div>
                      <h2 className="font-display text-lg font-bold text-slate-950">
                        Saved Vehicles ({savedVehicles.length})
                      </h2>
                      <p className="text-xs text-slate-500">
                        Track price changes and keep personal comparison notes on your shortlisted cars.
                      </p>
                    </div>

                    <div className="relative">
                      <Search
                        className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400"
                        aria-hidden="true"
                      />
                      <input
                        type="text"
                        value={savedSearchQuery}
                        onChange={(e) => setSavedSearchQuery(e.target.value)}
                        placeholder="Filter saved cars..."
                        className="h-9 rounded-lg border border-slate-200 pl-8 pr-3 text-xs focus:border-red-600 focus:outline-none"
                      />
                    </div>
                  </div>

                  {savedVehicleDetails.length === 0 ? (
                    <div className="py-12 text-center">
                      <Car className="mx-auto h-10 w-10 text-slate-300" aria-hidden="true" />
                      <h3 className="mt-3 font-display text-base font-bold text-slate-950">
                        Your Garage Is Empty
                      </h3>
                      <p className="mt-1 text-xs text-slate-500">
                        Save vehicles while browsing to monitor price drops and availability.
                      </p>
                      <Link
                        to="/cars-for-sale"
                        className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700"
                      >
                        Explore Inventory
                      </Link>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-200">
                      {savedVehicleDetails.map(({ vehicle, priceAtSave, savedAt, note }) => {
                        const priceDiff = priceAtSave - vehicle.price;
                        const draft = noteDrafts[vehicle.id] ?? note;

                        return (
                          <div key={vehicle.id} className="py-5">
                            <div className="flex flex-col gap-5 sm:flex-row">
                              <Link
                                to={`/vehicle/${vehicle.slug}`}
                                className="aspect-[4/3] w-full shrink-0 overflow-hidden rounded-lg bg-slate-100 sm:w-52"
                              >
                                <img
                                  src={vehicle.image}
                                  alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                                  className="h-full w-full object-cover"
                                  referrerPolicy="no-referrer"
                                />
                              </Link>

                              <div className="flex flex-1 flex-col justify-between">
                                <div className="flex flex-wrap items-start justify-between gap-4">
                                  <div>
                                    <div className="text-xs text-slate-500 tabular-nums">
                                      Saved {savedAt} &middot; {vehicle.mileage.toLocaleString()} mi &middot;{' '}
                                      {vehicle.dealerName}
                                    </div>
                                    <Link
                                      to={`/vehicle/${vehicle.slug}`}
                                      className="mt-1 block font-display text-base font-bold text-slate-950 hover:text-red-600"
                                    >
                                      {vehicle.year} {vehicle.make} {vehicle.model} {vehicle.trim}
                                    </Link>
                                  </div>

                                  <div className="text-right">
                                    <div className="font-display text-xl font-extrabold tabular-nums text-slate-950">
                                      ${vehicle.price.toLocaleString()}
                                    </div>
                                    {priceDiff > 0 && (
                                      <div className="text-xs font-semibold text-emerald-700 tabular-nums">
                                        Down ${priceDiff.toLocaleString()} since saved
                                      </div>
                                    )}
                                  </div>
                                </div>

                                <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
                                  <input
                                    type="text"
                                    value={draft}
                                    onChange={(e) =>
                                      setNoteDrafts((prev) => ({
                                        ...prev,
                                        [vehicle.id]: e.target.value,
                                      }))
                                    }
                                    placeholder="Add a personal note (e.g. ask about warranty)..."
                                    className="h-9 flex-1 rounded-lg border border-slate-200 px-3 text-xs focus:border-red-600 focus:outline-none"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => updateSavedVehicleNote(vehicle.id, draft)}
                                    className="h-9 rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                                  >
                                    Save Note
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setAvailabilityVehicle(vehicle)}
                                    className="h-9 rounded-lg bg-slate-950 px-3 text-xs font-semibold text-white hover:bg-red-600 transition-colors"
                                  >
                                    Check Availability
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => toggleSaveVehicle(vehicle)}
                                    aria-label="Remove saved vehicle"
                                    className="inline-flex h-9 items-center justify-center gap-1 rounded-lg border border-slate-200 px-3 text-xs font-semibold text-red-600 hover:bg-red-50"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                                    <span>Remove</span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* 3. SAVED SEARCHES */}
              {validSection === 'saved-searches' && (
                <div className="rounded-xl border border-slate-200 bg-white p-6">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <div>
                      <h2 className="font-display text-lg font-bold text-slate-950">
                        Saved Searches &amp; Alert Triggers
                      </h2>
                      <p className="text-xs text-slate-500">
                        Receive instant email or SMS alerts when matching inventory hits the marketplace.
                      </p>
                    </div>
                    <Link
                      to="/cars-for-sale"
                      className="rounded-lg bg-slate-950 px-3.5 py-2 text-xs font-semibold text-white hover:bg-red-600 transition-colors"
                    >
                      New Search
                    </Link>
                  </div>

                  {savedSearches.length === 0 ? (
                    <div className="py-12 text-center">
                      <Bell className="mx-auto h-10 w-10 text-slate-300" aria-hidden="true" />
                      <h3 className="mt-3 font-display text-base font-bold text-slate-950">
                        No Saved Search Alerts
                      </h3>
                      <p className="mt-1 text-xs text-slate-500">
                        Click "Save Search Alert" on any search results page to automate vehicle tracking.
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100">
                      {savedSearches.map((item) => (
                        <div
                          key={item.id}
                          className="flex flex-col justify-between gap-4 py-4 sm:flex-row sm:items-center"
                        >
                          <div>
                            <div className="font-display text-sm font-bold text-slate-950">{item.name}</div>
                            <div className="mt-0.5 text-xs text-slate-500 tabular-nums">
                              Created {item.createdAt} &middot; {item.matchCount} matching vehicles
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-4">
                            <select
                              aria-label={`Alert frequency for ${item.name}`}
                              value={item.frequency}
                              onChange={(e) =>
                                updateSavedSearch(item.id, {
                                  frequency: e.target.value as 'Instant' | 'Daily' | 'Weekly',
                                })
                              }
                              className="h-9 rounded-lg border border-slate-200 bg-slate-50 px-2.5 text-xs font-semibold focus:border-red-600 focus:outline-none"
                            >
                              <option value="Instant">Instant Alerts</option>
                              <option value="Daily">Daily Digest</option>
                              <option value="Weekly">Weekly Digest</option>
                            </select>

                            <label className="flex items-center gap-2 text-xs font-medium text-slate-700">
                              <input
                                type="checkbox"
                                checked={item.emailAlerts}
                                onChange={(e) =>
                                  updateSavedSearch(item.id, { emailAlerts: e.target.checked })
                                }
                                className="h-4 w-4 rounded border-slate-300 text-red-600 focus:ring-red-600"
                              />
                              <span>Email</span>
                            </label>

                            <label className="flex items-center gap-2 text-xs font-medium text-slate-700">
                              <input
                                type="checkbox"
                                checked={item.smsAlerts}
                                onChange={(e) =>
                                  updateSavedSearch(item.id, { smsAlerts: e.target.checked })
                                }
                                className="h-4 w-4 rounded border-slate-300 text-red-600 focus:ring-red-600"
                              />
                              <span>SMS</span>
                            </label>

                            <Link
                              to={buildSearchUrl(item.filters)}
                              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-800 hover:bg-slate-50"
                            >
                              <span>View</span>
                              <ExternalLink className="h-3 w-3" aria-hidden="true" />
                            </Link>

                            <button
                              type="button"
                              onClick={() => deleteSavedSearch(item.id)}
                              aria-label="Delete saved search"
                              className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* 4. RECENTLY VIEWED */}
              {validSection === 'recently-viewed' && (
                <div className="rounded-xl border border-slate-200 bg-white p-6">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <div>
                      <h2 className="font-display text-lg font-bold text-slate-950">
                        Recently Viewed Vehicles ({recentlyViewedVehicles.length})
                      </h2>
                      <p className="text-xs text-slate-500">
                        Your browsing session history synced across AutoLux USA.
                      </p>
                    </div>
                    {recentlyViewedVehicles.length > 0 && (
                      <button
                        type="button"
                        onClick={clearRecentlyViewed}
                        className="text-xs font-semibold text-red-600 hover:text-red-700"
                      >
                        Clear History
                      </button>
                    )}
                  </div>

                  {recentlyViewedVehicles.length === 0 ? (
                    <div className="py-12 text-center">
                      <Clock className="mx-auto h-10 w-10 text-slate-300" aria-hidden="true" />
                      <h3 className="mt-3 font-display text-base font-bold text-slate-950">
                        No Recently Viewed Vehicles
                      </h3>
                      <p className="mt-1 text-xs text-slate-500">
                        Vehicles you open will appear here for quick side-by-side comparison.
                      </p>
                      <Link
                        to="/cars-for-sale"
                        className="mt-4 inline-flex items-center rounded-lg bg-slate-950 px-4 py-2 text-xs font-semibold text-white hover:bg-red-600"
                      >
                        Browse Inventory
                      </Link>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100">
                      {recentlyViewedVehicles.map((v) => (
                        <div
                          key={v.id}
                          className="flex flex-col justify-between gap-4 py-4 sm:flex-row sm:items-center"
                        >
                          <div className="flex items-center gap-4">
                            <img
                              src={v.image}
                              alt={`${v.year} ${v.make} ${v.model}`}
                              className="h-16 w-24 rounded-lg object-cover bg-slate-100 shrink-0"
                              referrerPolicy="no-referrer"
                            />
                            <div>
                              <Link
                                to={`/vehicle/${v.slug}`}
                                className="font-display text-sm font-bold text-slate-950 hover:text-red-600"
                              >
                                {v.year} {v.make} {v.model} {v.trim}
                              </Link>
                              <div className="mt-0.5 text-xs text-slate-500 tabular-nums">
                                {v.mileage.toLocaleString()} mi &middot; {v.dealerName}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className="font-display text-base font-bold tabular-nums text-slate-950">
                              ${v.price.toLocaleString()}
                            </span>
                            <button
                              type="button"
                              onClick={() => toggleSaveVehicle(v)}
                              className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                            >
                              Save
                            </button>
                            <Link
                              to={`/vehicle/${v.slug}`}
                              className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700"
                            >
                              View
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* 5. MESSAGES & INQUIRIES */}
              {validSection === 'messages' && (
                <div className="grid grid-cols-1 overflow-hidden rounded-xl border border-slate-200 bg-white md:grid-cols-12">
                  {/* Thread List */}
                  <div className="border-b border-slate-200 md:col-span-5 md:border-b-0 md:border-r">
                    <div className="border-b border-slate-100 p-4">
                      <h2 className="font-display text-base font-bold text-slate-950">
                        Dealer Inquiries ({messages.length})
                      </h2>
                    </div>

                    <div className="divide-y divide-slate-100">
                      {messages.map((thread) => {
                        const selected = thread.id === activeThread?.id;
                        return (
                          <button
                            key={thread.id}
                            type="button"
                            onClick={() => {
                              setActiveThreadId(thread.id);
                              markThreadRead(thread.id);
                            }}
                            className={`w-full p-4 text-left transition-colors ${
                              selected ? 'bg-slate-50' : 'hover:bg-slate-50/60'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <span className="text-xs font-semibold text-slate-950">
                                {thread.dealerName}
                              </span>
                              <span className="text-[11px] tabular-nums text-slate-400">
                                {thread.updatedAt}
                              </span>
                            </div>
                            <div className="mt-1 truncate text-xs font-medium text-slate-700">
                              {thread.vehicleTitle}
                            </div>
                            <div className="mt-1 flex items-center justify-between text-xs text-slate-500">
                              <span>{thread.status}</span>
                              {thread.unread && (
                                <span className="font-semibold text-red-600">Unread reply</span>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Active Thread Conversation */}
                  <div className="flex flex-col justify-between md:col-span-7">
                    {activeThread ? (
                      <>
                        <div className="flex items-center justify-between gap-3 border-b border-slate-100 p-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={activeThread.vehicleImage}
                              alt={activeThread.vehicleTitle}
                              className="h-12 w-16 rounded-md object-cover bg-slate-100 shrink-0"
                              referrerPolicy="no-referrer"
                            />
                            <div>
                              <div className="text-sm font-bold text-slate-950">
                                {activeThread.vehicleTitle}
                              </div>
                              <div className="text-xs text-slate-500 tabular-nums">
                                ${activeThread.vehiclePrice.toLocaleString()} &middot;{' '}
                                {activeThread.dealerPhone}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex-1 space-y-3 overflow-y-auto p-4 max-h-[380px]">
                          {activeThread.messages.map((msg) => (
                            <div
                              key={msg.id}
                              className={`flex flex-col ${
                                msg.sender === 'buyer' ? 'items-end' : 'items-start'
                              }`}
                            >
                              <div
                                className={`max-w-[85%] rounded-xl px-4 py-2.5 text-sm leading-relaxed ${
                                  msg.sender === 'buyer'
                                    ? 'bg-slate-950 text-white'
                                    : 'border border-slate-200 bg-slate-50 text-slate-800'
                                }`}
                              >
                                {msg.text}
                              </div>
                              <span className="mt-1 text-[11px] text-slate-400">
                                {msg.sender === 'buyer' ? 'You' : activeThread.dealerName} &middot;{' '}
                                {msg.timestamp}
                              </span>
                            </div>
                          ))}
                        </div>

                        <form
                          onSubmit={handleSendReply}
                          className="flex items-center gap-2 border-t border-slate-100 p-3"
                        >
                          <input
                            type="text"
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            placeholder="Write a message to the dealership..."
                            className="h-10 flex-1 rounded-lg border border-slate-200 px-3 text-sm focus:border-red-600 focus:outline-none"
                          />
                          <button
                            type="submit"
                            className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-red-600 px-4 text-xs font-bold text-white hover:bg-red-700 transition-colors"
                          >
                            <Send className="h-3.5 w-3.5" aria-hidden="true" />
                            <span>Send</span>
                          </button>
                        </form>
                      </>
                    ) : (
                      <div className="p-10 text-center text-sm text-slate-500">
                        Select a conversation or message a dealer from any listing.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 6. FINANCING HUB */}
              {validSection === 'financing' && (
                <div className="space-y-6">
                  <div className="rounded-xl border border-slate-200 bg-white p-6">
                    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
                      <div>
                        <h2 className="font-display text-lg font-bold text-slate-950">
                          Pre-Qualification &amp; Financing Hub
                        </h2>
                        <p className="text-xs text-slate-500">
                          Updated {financingProfile.updatedAt} &middot; Soft-pull verified for participating dealers
                        </p>
                      </div>
                      <Link
                        to="/financing"
                        className="rounded-lg bg-slate-950 px-4 py-2 text-xs font-semibold text-white hover:bg-red-600 transition-colors"
                      >
                        Recalculate Terms
                      </Link>
                    </div>

                    <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
                      <div className="rounded-xl border border-slate-800 bg-slate-950 p-6 text-white">
                        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
                          <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                          <span>Active Pre-Qualification Certificate</span>
                        </div>
                        <div className="mt-4 text-xs text-slate-400">Approved Buying Power</div>
                        <div className="mt-1 font-display text-4xl font-extrabold tabular-nums">
                          ${financingProfile.estimatedBuyingPower.toLocaleString()}
                        </div>
                        <div className="mt-4 flex items-center gap-4 text-xs text-slate-300 tabular-nums">
                          <span>Est. {financingProfile.estimatedApr}% APR</span>
                          <span aria-hidden="true">&middot;</span>
                          <span>{financingProfile.preferredTermMonths} Months</span>
                        </div>
                      </div>

                      <dl className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-5 text-sm">
                        <div className="flex justify-between">
                          <dt className="text-slate-500">Credit Tier</dt>
                          <dd className="font-semibold text-slate-950">{financingProfile.creditTier}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-slate-500">Gross Annual Income</dt>
                          <dd className="font-mono font-semibold tabular-nums text-slate-950">
                            ${financingProfile.annualIncome.toLocaleString()}
                          </dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-slate-500">Monthly Housing</dt>
                          <dd className="font-mono font-semibold tabular-nums text-slate-950">
                            ${financingProfile.monthlyHousing.toLocaleString()}
                          </dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-slate-500">Down Payment</dt>
                          <dd className="font-mono font-semibold tabular-nums text-slate-950">
                            ${financingProfile.downPayment.toLocaleString()}
                          </dd>
                        </div>
                      </dl>
                    </div>

                    {avgSavedPrice > 0 && (
                      <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
                        <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-semibold text-slate-700">
                          <span>Saved Garage Avg. vs. Pre-Qualified Limit</span>
                          <span className="font-mono tabular-nums">
                            ${avgSavedPrice.toLocaleString()} / ${financingProfile.estimatedBuyingPower.toLocaleString()}
                          </span>
                        </div>
                        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-200">
                          <div
                            className={`h-full rounded-full ${
                              avgSavedPrice <= financingProfile.estimatedBuyingPower
                                ? 'bg-emerald-600'
                                : 'bg-amber-500'
                            }`}
                            style={{
                              width: `${Math.min(
                                100,
                                Math.round((avgSavedPrice / financingProfile.estimatedBuyingPower) * 100),
                              )}%`,
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 7. MY LISTINGS (SELL YOUR CAR) */}
              {validSection === 'listings' && (
                <div className="rounded-xl border border-slate-200 bg-white p-6">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <div>
                      <h2 className="font-display text-lg font-bold text-slate-950">
                        My Vehicles For Sale ({userListings.length})
                      </h2>
                      <p className="text-xs text-slate-500">
                        Manage private listings and instant dealer cash offers.
                      </p>
                    </div>
                    <Link
                      to="/sell-your-car"
                      className="rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700 transition-colors"
                    >
                      Sell Another Vehicle
                    </Link>
                  </div>

                  {userListings.length === 0 ? (
                    <div className="py-12 text-center">
                      <Tag className="mx-auto h-10 w-10 text-slate-300" aria-hidden="true" />
                      <h3 className="mt-3 font-display text-base font-bold text-slate-950">
                        No Active Seller Listings
                      </h3>
                      <p className="mt-1 text-xs text-slate-500">
                        Get an instant cash offer or list your car to nationwide buyers in under 3 minutes.
                      </p>
                      <Link
                        to="/sell-your-car"
                        className="mt-4 inline-flex items-center rounded-lg bg-slate-950 px-4 py-2 text-xs font-semibold text-white hover:bg-red-600"
                      >
                        Start Vehicle Valuation
                      </Link>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100">
                      {userListings.map((item) => (
                        <div
                          key={item.id}
                          className="flex flex-col justify-between gap-4 py-4 sm:flex-row sm:items-center"
                        >
                          <div>
                            <div className="text-xs font-semibold text-emerald-700">{item.status}</div>
                            <div className="font-display text-base font-bold text-slate-950">
                              {item.year} {item.make} {item.model} {item.trim}
                            </div>
                            <div className="text-xs text-slate-500 tabular-nums">
                              {item.mileage.toLocaleString()} mi &middot; VIN {item.vin} &middot; ZIP {item.zip}
                            </div>
                          </div>

                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <div className="font-display text-lg font-bold tabular-nums text-slate-950">
                                ${item.askingPrice.toLocaleString()}
                              </div>
                              <div className="text-xs text-slate-500 tabular-nums">
                                Cash Offer: ${item.instantOfferEstimate.toLocaleString()}
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeUserListing(item.id)}
                              className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-red-50 hover:text-red-600"
                              aria-label="Remove listing"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* 8. PROFILE SETTINGS */}
              {validSection === 'settings' && (
                <div className="space-y-6">
                  {/* Account Credentials & Location Defaults */}
                  <form
                    onSubmit={handleSaveProfile}
                    className="rounded-xl border border-slate-200 bg-white p-6 space-y-5"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
                      <div>
                        <h2 className="font-display text-lg font-bold text-slate-950">
                          Account Credentials &amp; Search Defaults
                        </h2>
                        <p className="text-xs text-slate-500">
                          Member since {userProfile.memberSince} &middot; Password updated{' '}
                          {userProfile.lastPasswordUpdate}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowPasswordModal(true)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        <Lock className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>Change Password</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label htmlFor="prof-first" className="block text-xs font-semibold text-slate-700">
                          First Name
                        </label>
                        <input
                          id="prof-first"
                          type="text"
                          required
                          value={profileForm.firstName}
                          onChange={(e) =>
                            setProfileForm((p) => ({ ...p, firstName: e.target.value }))
                          }
                          className="mt-1.5 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm focus:border-red-600 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label htmlFor="prof-last" className="block text-xs font-semibold text-slate-700">
                          Last Name
                        </label>
                        <input
                          id="prof-last"
                          type="text"
                          required
                          value={profileForm.lastName}
                          onChange={(e) =>
                            setProfileForm((p) => ({ ...p, lastName: e.target.value }))
                          }
                          className="mt-1.5 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm focus:border-red-600 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label htmlFor="prof-email" className="block text-xs font-semibold text-slate-700">
                          Email Address
                        </label>
                        <input
                          id="prof-email"
                          type="email"
                          required
                          value={profileForm.email}
                          onChange={(e) => setProfileForm((p) => ({ ...p, email: e.target.value }))}
                          className="mt-1.5 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm focus:border-red-600 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label htmlFor="prof-phone" className="block text-xs font-semibold text-slate-700">
                          Mobile Phone Number
                        </label>
                        <input
                          id="prof-phone"
                          type="tel"
                          value={profileForm.phone}
                          onChange={(e) => setProfileForm((p) => ({ ...p, phone: e.target.value }))}
                          className="mt-1.5 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm focus:border-red-600 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="border-t border-slate-100 pt-5">
                      <h3 className="flex items-center gap-1.5 font-display text-sm font-bold text-slate-950">
                        <MapPin className="h-4 w-4 text-red-600" aria-hidden="true" />
                        <span>Default Location &amp; Dealer Contact</span>
                      </h3>
                      <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <div>
                          <label htmlFor="prof-zip" className="block text-xs font-semibold text-slate-700">
                            Default ZIP Code
                          </label>
                          <input
                            id="prof-zip"
                            type="text"
                            maxLength={5}
                            value={profileForm.defaultZip}
                            onChange={(e) =>
                              setProfileForm((p) => ({
                                ...p,
                                defaultZip: e.target.value.replace(/\D/g, ''),
                              }))
                            }
                            className="mt-1.5 h-10 w-full rounded-lg border border-slate-200 px-3 font-mono text-sm tabular-nums focus:border-red-600 focus:outline-none"
                          />
                        </div>

                        <div>
                          <label htmlFor="prof-radius" className="block text-xs font-semibold text-slate-700">
                            Default Search Radius
                          </label>
                          <select
                            id="prof-radius"
                            value={profileForm.defaultRadius}
                            onChange={(e) =>
                              setProfileForm((p) => ({ ...p, defaultRadius: e.target.value }))
                            }
                            className="mt-1.5 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm focus:border-red-600 focus:outline-none"
                          >
                            <option value="25">25 Miles</option>
                            <option value="50">50 Miles</option>
                            <option value="100">100 Miles</option>
                            <option value="250">250 Miles</option>
                            <option value="nationwide">Nationwide</option>
                          </select>
                        </div>

                        <div>
                          <label htmlFor="prof-contact" className="block text-xs font-semibold text-slate-700">
                            Preferred Dealer Contact
                          </label>
                          <select
                            id="prof-contact"
                            value={profileForm.preferredContact}
                            onChange={(e) =>
                              setProfileForm((p) => ({
                                ...p,
                                preferredContact: e.target.value as UserProfile['preferredContact'],
                              }))
                            }
                            className="mt-1.5 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm focus:border-red-600 focus:outline-none"
                          >
                            <option value="Email & SMS">Email &amp; SMS</option>
                            <option value="Email Only">Email Only</option>
                            <option value="Phone Call">Phone Call</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end border-t border-slate-100 pt-4">
                      <button
                        type="submit"
                        className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-red-700 transition-colors"
                      >
                        <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                        <span>Save Profile Changes</span>
                      </button>
                    </div>
                  </form>

                  {/* Notification Preferences + Live Alert Preview */}
                  <div className="rounded-xl border border-slate-200 bg-white p-6">
                    <h2 className="font-display text-lg font-bold text-slate-950">
                      Notification Preferences
                    </h2>
                    <p className="mt-0.5 text-xs text-slate-500">
                      Control how AutoLux USA notifies you about saved cars, searches, and dealer replies.
                    </p>

                    <div className="mt-4 divide-y divide-slate-100">
                      {(
                        [
                          {
                            key: 'priceDropAlerts',
                            title: 'Price Drop Alerts',
                            desc: 'Instant email notifications whenever a vehicle in your Saved Vehicles drops in price.',
                          },
                          {
                            key: 'newListingMatches',
                            title: 'New Search Match Alerts',
                            desc: 'Receive notifications when newly listed vehicles match your saved searches.',
                          },
                          {
                            key: 'dealerReplySms',
                            title: 'Dealer Message SMS Alerts',
                            desc: 'Get text alerts when a dealership confirms availability or a test drive appointment.',
                          },
                          {
                            key: 'weeklyMarketDigest',
                            title: 'Weekly Market Price Digest',
                            desc: 'Weekly summary of price trends and expert road tests from AutoLux USA Research.',
                          },
                          {
                            key: 'financingOffers',
                            title: 'Pre-Qualification & APR Updates',
                            desc: 'Receive updates when lower APR offers become available for your credit profile.',
                          },
                        ] as { key: keyof NotificationPreferences; title: string; desc: string }[]
                      ).map((pref) => (
                        <div key={pref.key} className="flex items-center justify-between gap-4 py-4">
                          <div>
                            <div className="text-sm font-semibold text-slate-950">{pref.title}</div>
                            <div className="text-xs text-slate-500">{pref.desc}</div>
                          </div>
                          <AnimatedSwitch
                            checked={notifications[pref.key]}
                            onChange={(val) => updateNotifications({ [pref.key]: val })}
                            label={pref.title}
                          />
                        </div>
                      ))}
                    </div>

                    {/* Alert Delivery Summary Preview */}
                    <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                        <Mail className="h-4 w-4 text-red-600" aria-hidden="true" />
                        <span>Active Alert Delivery Summary</span>
                      </div>
                      <p className="mt-1.5 text-xs text-slate-600">
                        Alerts will deliver to <span className="font-semibold text-slate-900">{profileForm.email}</span>
                        {notifications.dealerReplySms && profileForm.phone
                          ? ` and SMS to ${profileForm.phone}`
                          : ''}{' '}
                        for inventory near ZIP <span className="font-mono font-semibold">{profileForm.defaultZip}</span>.
                      </p>
                    </div>
                  </div>

                  {/* Privacy, Export & Reset */}
                  <div className="flex flex-col justify-between gap-4 rounded-xl border border-slate-200 bg-white p-6 sm:flex-row sm:items-center">
                    <div>
                      <h2 className="font-display text-base font-bold text-slate-950">
                        Account Data &amp; Privacy Controls
                      </h2>
                      <p className="mt-0.5 text-xs text-slate-500">
                        Export your saved vehicles and search alerts, or restore account defaults.
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                      <button
                        type="button"
                        onClick={exportUserData}
                        className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50 whitespace-nowrap"
                      >
                        <Download className="h-4 w-4" aria-hidden="true" />
                        <span>Export JSON Data</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowResetModal(true)}
                        className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:border-red-200 hover:bg-red-50 hover:text-red-700 whitespace-nowrap"
                      >
                        <RotateCcw className="h-4 w-4" aria-hidden="true" />
                        <span>Reset Defaults</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Quick Availability Modal */}
      {availabilityVehicle && (
        <AvailabilityModal
          vehicle={availabilityVehicle}
          onClose={() => setAvailabilityVehicle(null)}
        />
      )}

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
          <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-2xl">
            <h2 className="font-display text-lg font-bold text-slate-950">Update Account Password</h2>
            <p className="mt-1 text-xs text-slate-500">
              Use at least 8 characters with letters and numbers.
            </p>
            <form onSubmit={handlePasswordSubmit} className="mt-4 space-y-3">
              <div>
                <label htmlFor="pw-curr" className="block text-xs font-semibold text-slate-700">
                  Current Password
                </label>
                <input
                  id="pw-curr"
                  type="password"
                  required
                  value={passwordForm.current}
                  onChange={(e) => setPasswordForm((p) => ({ ...p, current: e.target.value }))}
                  className="mt-1 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm focus:border-red-600 focus:outline-none"
                />
              </div>
              <div>
                <label htmlFor="pw-next" className="block text-xs font-semibold text-slate-700">
                  New Password
                </label>
                <input
                  id="pw-next"
                  type="password"
                  required
                  value={passwordForm.next}
                  onChange={(e) => setPasswordForm((p) => ({ ...p, next: e.target.value }))}
                  className="mt-1 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm focus:border-red-600 focus:outline-none"
                />
              </div>
              <div>
                <label htmlFor="pw-conf" className="block text-xs font-semibold text-slate-700">
                  Confirm New Password
                </label>
                <input
                  id="pw-conf"
                  type="password"
                  required
                  value={passwordForm.confirm}
                  onChange={(e) => setPasswordForm((p) => ({ ...p, confirm: e.target.value }))}
                  className="mt-1 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm focus:border-red-600 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700"
                >
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset Defaults Confirmation Modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
          <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-2xl">
            <h2 className="font-display text-lg font-bold text-slate-950">Reset Account Defaults?</h2>
            <p className="mt-1.5 text-sm text-slate-600">
              This restores your saved vehicles, search alerts, browsing history, and profile settings back to
              their initial state.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowResetModal(false)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  resetDemoState();
                  setShowResetModal(false);
                }}
                className="rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700"
              >
                Confirm Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
