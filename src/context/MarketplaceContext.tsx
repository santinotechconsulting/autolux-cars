import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  IMG_CIVIC_SI,
  IMG_FORD_BRONCO,
  IMG_FORD_F150,
  IMG_HONDA_ACCORD,
  IMG_KIA_SPORTAGE,
  IMG_MERCEDES_AMG,
  IMG_NISSAN_ALTIMA,
  IMG_SILVERADO_Z71,
  IMG_TOYOTA_RAV4,
  VEHICLES,
} from '../data/inventory';
import type {
  FinancingProfile,
  MessageThread,
  NotificationPreferences,
  SavedSearchEntry,
  SavedVehicleEntry,
  SearchFilters,
  UserListing,
  UserProfile,
  Vehicle,
} from '../types/marketplace';

interface ToastItem {
  id: string;
  message: string;
  tone: 'success' | 'info';
}

interface MarketplaceContextValue {
  vehicles: Vehicle[];
  savedVehicles: SavedVehicleEntry[];
  savedSearches: SavedSearchEntry[];
  recentlyViewedIds: string[];
  messages: MessageThread[];
  financingProfile: FinancingProfile;
  userListings: UserListing[];
  compareIds: string[];
  userProfile: UserProfile;
  notifications: NotificationPreferences;
  toasts: ToastItem[];
  isSaved: (vehicleId: string) => boolean;
  toggleSaveVehicle: (vehicle: Vehicle) => void;
  updateSavedVehicleNote: (vehicleId: string, note: string) => void;
  trackVehicleView: (vehicleId: string) => void;
  clearRecentlyViewed: () => void;
  saveSearchAlert: (name: string, filters: Partial<SearchFilters>, matchCount: number) => void;
  updateSavedSearch: (id: string, updates: Partial<SavedSearchEntry>) => void;
  deleteSavedSearch: (id: string) => void;
  sendDealerInquiry: (
    vehicle: Vehicle,
    buyerMessage: string,
    requestType: 'Inquiry' | 'Test Drive' | 'Offer' | 'Rental',
  ) => void;
  replyToThread: (threadId: string, text: string) => void;
  markThreadRead: (threadId: string) => void;
  saveFinancingProfile: (profile: FinancingProfile) => void;
  addUserListing: (listing: Omit<UserListing, 'id' | 'createdAt'>) => {
    listing: UserListing;
    vehicleSlug?: string;
  };
  removeUserListing: (id: string) => void;
  toggleCompare: (vehicleId: string) => void;
  clearCompare: () => void;
  updateUserProfile: (profile: Partial<UserProfile>) => void;
  updateNotifications: (prefs: Partial<NotificationPreferences>) => void;
  showToast: (message: string, tone?: 'success' | 'info') => void;
  dismissToast: (id: string) => void;
  exportUserData: () => void;
  resetDemoState: () => void;
}

const STORAGE_KEY = 'autolux_usa_marketplace_state_v2';

const DEFAULT_SAVED_VEHICLES: SavedVehicleEntry[] = [
  {
    vehicleId: 'veh-001',
    savedAt: '2026-11-15',
    priceAtSave: 137500,
    note: 'Ask Manhattan Flagship about CPO warranty extension & weekend delivery.',
  },
  {
    vehicleId: 'veh-002',
    savedAt: '2026-11-16',
    priceAtSave: 59900,
    note: 'Compare towing package specs with Ram 1500 Limited.',
  },
];

const DEFAULT_RECENTLY_VIEWED: string[] = ['veh-001', 'veh-004', 'veh-006'];

const DEFAULT_SAVED_SEARCHES: SavedSearchEntry[] = [
  {
    id: 'srch-1',
    name: 'Luxury Coupes under $150k · NY/NJ',
    filters: { bodyStyle: 'Coupe', maxPrice: '150000', zip: '10001', radius: '50' },
    frequency: 'Instant',
    emailAlerts: true,
    smsAlerts: true,
    createdAt: '2026-11-10',
    matchCount: 2,
  },
  {
    id: 'srch-2',
    name: 'Hybrid & Electric SUVs · Clean History',
    filters: { bodyStyle: 'SUV', fuelType: 'Hybrid', freeHistoryOnly: true, radius: '100' },
    frequency: 'Daily',
    emailAlerts: true,
    smsAlerts: false,
    createdAt: '2026-11-12',
    matchCount: 2,
  },
];

const DEFAULT_MESSAGES: MessageThread[] = [
  {
    id: 'msg-1',
    vehicleId: 'veh-001',
    vehicleTitle: '2024 Mercedes-Benz AMG GT 55 4MATIC+ Coupe',
    vehiclePrice: 134900,
    vehicleImage: IMG_MERCEDES_AMG,
    dealerName: 'AutoLux Manhattan Flagship',
    dealerPhone: '(212) 555-0194',
    status: 'Test Drive Scheduled',
    unread: true,
    updatedAt: 'Today, 10:14 AM',
    messages: [
      {
        id: 'm-101',
        sender: 'buyer',
        text: 'Hi, is the Obsidian Black AMG GT 55 still available for a Friday afternoon viewing?',
        timestamp: 'Yesterday, 4:32 PM',
      },
      {
        id: 'm-102',
        sender: 'dealer',
        text: 'Hello! Yes, Stock #ALX-24091 is indoors on our 11th Ave showroom floor and we just reduced the price by $2,600. We have you reserved for Friday at 2:00 PM.',
        timestamp: 'Today, 10:14 AM',
      },
    ],
  },
  {
    id: 'msg-2',
    vehicleId: 'veh-002',
    vehicleTitle: '2024 Ford F-150 Lariat 4x4 SuperCrew',
    vehiclePrice: 58490,
    vehicleImage: IMG_FORD_F150,
    dealerName: 'Liberty Ford & Truck Center',
    dealerPhone: '(973) 555-0148',
    status: 'Active',
    unread: false,
    updatedAt: 'Nov 16',
    messages: [
      {
        id: 'm-201',
        sender: 'buyer',
        text: 'Does this Lariat include the 2.4kW Pro Power Onboard bed outlet and BlueCruise?',
        timestamp: 'Nov 16, 1:15 PM',
      },
      {
        id: 'm-202',
        sender: 'dealer',
        text: 'Yes, both are factory-installed on this VIN. Happy to email the window sticker and full AutoLux History Report!',
        timestamp: 'Nov 16, 2:05 PM',
      },
    ],
  },
];

const DEFAULT_FINANCING: FinancingProfile = {
  preQualified: true,
  creditTier: 'Excellent (740+)',
  annualIncome: 145000,
  monthlyHousing: 2400,
  downPayment: 10000,
  estimatedBuyingPower: 85000,
  estimatedApr: 5.49,
  preferredTermMonths: 60,
  updatedAt: '2026-11-14',
};

const DEFAULT_USER_PROFILE: UserProfile = {
  firstName: 'Alex',
  lastName: 'Mercer',
  email: 'alex.mercer@autolux-member.com',
  phone: '(212) 555-0188',
  defaultZip: '10001',
  defaultRadius: '50',
  preferredContact: 'Email & SMS',
  memberSince: 'March 2024',
  lastPasswordUpdate: 'October 2026',
};

const DEFAULT_NOTIFICATIONS: NotificationPreferences = {
  priceDropAlerts: true,
  newListingMatches: true,
  dealerReplySms: true,
  weeklyMarketDigest: false,
  financingOffers: true,
};

function resolveImageForMake(make: string, model: string): string {
  const m = make.toLowerCase();
  const mod = model.toLowerCase();
  if (m.includes('ford')) {
    if (mod.includes('bronco')) return IMG_FORD_BRONCO;
    return IMG_FORD_F150;
  }
  if (m.includes('chevy') || m.includes('chevrolet') || m.includes('gmc')) return IMG_SILVERADO_Z71;
  if (m.includes('honda')) {
    if (mod.includes('civic')) return IMG_CIVIC_SI;
    return IMG_HONDA_ACCORD;
  }
  if (m.includes('toyota')) return IMG_TOYOTA_RAV4;
  if (m.includes('nissan')) return IMG_NISSAN_ALTIMA;
  if (m.includes('kia') || m.includes('hyundai')) return IMG_KIA_SPORTAGE;
  if (m.includes('mercedes')) return IMG_MERCEDES_AMG;
  return IMG_HONDA_ACCORD;
}

function buildLiveVehicleFromListing(listing: UserListing, ownerZip: string): Vehicle {
  const slugBase = `${listing.year}-${listing.make}-${listing.model}-${listing.id}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  const img = resolveImageForMake(listing.make, listing.model);
  const mod = listing.model.toLowerCase();
  const bodyStyle: Vehicle['bodyStyle'] =
    mod.includes('f-150') || mod.includes('silverado') || mod.includes('ranger') || mod.includes('1500')
      ? 'Truck'
      : mod.includes('rav4') || mod.includes('bronco') || mod.includes('sportage') || mod.includes('x5')
        ? 'SUV'
        : mod.includes('civic') || mod.includes('camaro') || mod.includes('911')
          ? 'Coupe'
          : 'Sedan';
  const down = Math.max(500, Math.round(listing.askingPrice * 0.1));
  const monthly = Math.max(95, Math.round(((listing.askingPrice - down) * 1.09) / 60));

  return {
    id: `custom-${listing.id}`,
    slug: slugBase,
    vin: listing.vin,
    stockNumber: `PVT-${listing.id.slice(-4).toUpperCase()}`,
    year: listing.year,
    make: listing.make,
    model: listing.model,
    trim: listing.trim || 'Owner Listed',
    condition: 'Used',
    bodyStyle,
    listingType: 'Sale',
    price: listing.askingPrice,
    fairMarketPrice: Math.round(listing.askingPrice * 1.07),
    downPaymentEstimate: down,
    monthlyPaymentEstimate: monthly,
    mileage: listing.mileage,
    exteriorColor: 'Metallic Gray',
    interiorColor: 'Charcoal',
    fuelType: 'Gasoline',
    transmission: 'Automatic',
    drivetrain: bodyStyle === 'Truck' || bodyStyle === 'SUV' ? '4WD' : 'FWD',
    engine: 'Verified Owner Powertrain',
    horsepower: 245,
    mpgCity: 23,
    mpgHighway: 31,
    dealerId: 'private-seller',
    dealerName: 'AutoLux Verified Private Seller',
    dealerCity: 'New York',
    dealerState: 'NY',
    dealerZip: listing.zip || ownerZip || '10001',
    dealerPhone: '(212) 555-0188',
    dealerRating: 4.9,
    dealerReviewCount: 42,
    distanceMiles: 5,
    image: img,
    gallery: [img],
    description: `Private seller listing published via AutoLux USA (${listing.condition} condition). Includes verified title check, transparent asking price, and direct owner-to-buyer messaging.`,
    features: [
      `${listing.condition} Inspected Condition`,
      'Clean Title Verified',
      'Direct Owner Messaging',
      'AutoLux Buyer Protection Eligible',
    ],
    freeHistoryReport: true,
    accidentsReported: 0,
    previousOwners: 2,
    titleStatus: 'Clean Title',
    isFeatured: true,
    listedDaysAgo: 0,
    noHagglePrice: false,
    warrantySummary: 'AutoLux 90-Day Shield Eligible',
    inspectionLevel: 'Seller Verified & AutoLux History Checked',
    deliveryAvailable: true,
    historyRecords: [
      {
        date: listing.createdAt,
        mileage: listing.mileage,
        event: 'Listed for Sale on AutoLux USA',
        location: `ZIP ${listing.zip || '10001'}`,
      },
    ],
  };
}

const MarketplaceContext = createContext<MarketplaceContextValue | undefined>(undefined);

export function MarketplaceProvider({ children }: { children: React.ReactNode }) {
  const [savedVehicles, setSavedVehicles] = useState<SavedVehicleEntry[]>(DEFAULT_SAVED_VEHICLES);
  const [savedSearches, setSavedSearches] = useState<SavedSearchEntry[]>(DEFAULT_SAVED_SEARCHES);
  const [recentlyViewedIds, setRecentlyViewedIds] = useState<string[]>(DEFAULT_RECENTLY_VIEWED);
  const [messages, setMessages] = useState<MessageThread[]>(DEFAULT_MESSAGES);
  const [financingProfile, setFinancingProfile] = useState<FinancingProfile>(DEFAULT_FINANCING);
  const [userListings, setUserListings] = useState<UserListing[]>([]);
  const [customVehicles, setCustomVehicles] = useState<Vehicle[]>([]);
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile>(DEFAULT_USER_PROFILE);
  const [notifications, setNotifications] = useState<NotificationPreferences>(DEFAULT_NOTIFICATIONS);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  const vehicles = useMemo(() => [...customVehicles, ...VEHICLES], [customVehicles]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.savedVehicles) setSavedVehicles(parsed.savedVehicles);
        if (parsed.savedSearches) setSavedSearches(parsed.savedSearches);
        if (parsed.recentlyViewedIds) setRecentlyViewedIds(parsed.recentlyViewedIds);
        if (parsed.messages) setMessages(parsed.messages);
        if (parsed.financingProfile) setFinancingProfile(parsed.financingProfile);
        if (parsed.userListings) setUserListings(parsed.userListings);
        if (parsed.customVehicles) setCustomVehicles(parsed.customVehicles);
        if (parsed.compareIds) setCompareIds(parsed.compareIds);
        if (parsed.userProfile) setUserProfile(parsed.userProfile);
        if (parsed.notifications) setNotifications(parsed.notifications);
      }
    } catch {
      // Fallback safely to seeded state
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          savedVehicles,
          savedSearches,
          recentlyViewedIds,
          messages,
          financingProfile,
          userListings,
          customVehicles,
          compareIds,
          userProfile,
          notifications,
        }),
      );
    } catch {
      // Ignore storage quota issues
    }
  }, [
    hydrated,
    savedVehicles,
    savedSearches,
    recentlyViewedIds,
    messages,
    financingProfile,
    userListings,
    customVehicles,
    compareIds,
    userProfile,
    notifications,
  ]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, tone: 'success' | 'info' = 'success') => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      setToasts((prev) => [...prev.slice(-2), { id, message, tone }]);
      setTimeout(() => {
        dismissToast(id);
      }, 3600);
    },
    [dismissToast],
  );

  const isSaved = useCallback(
    (vehicleId: string) => savedVehicles.some((entry) => entry.vehicleId === vehicleId),
    [savedVehicles],
  );

  const toggleSaveVehicle = useCallback(
    (vehicle: Vehicle) => {
      setSavedVehicles((prev) => {
        const exists = prev.some((entry) => entry.vehicleId === vehicle.id);
        if (exists) {
          showToast(`Removed ${vehicle.year} ${vehicle.make} ${vehicle.model} from saved vehicles.`, 'info');
          return prev.filter((entry) => entry.vehicleId !== vehicle.id);
        }
        showToast(`Saved ${vehicle.year} ${vehicle.make} ${vehicle.model} to your dashboard.`);
        return [
          {
            vehicleId: vehicle.id,
            savedAt: new Date().toISOString().slice(0, 10),
            priceAtSave: vehicle.price,
            note: '',
          },
          ...prev,
        ];
      });
    },
    [showToast],
  );

  const updateSavedVehicleNote = useCallback(
    (vehicleId: string, note: string) => {
      setSavedVehicles((prev) =>
        prev.map((entry) => (entry.vehicleId === vehicleId ? { ...entry, note } : entry)),
      );
      showToast('Saved note updated.');
    },
    [showToast],
  );

  const trackVehicleView = useCallback((vehicleId: string) => {
    setRecentlyViewedIds((prev) => {
      const next = [vehicleId, ...prev.filter((id) => id !== vehicleId)].slice(0, 6);
      if (next.length === prev.length && next.every((v, i) => v === prev[i])) return prev;
      return next;
    });
  }, []);

  const clearRecentlyViewed = useCallback(() => {
    setRecentlyViewedIds([]);
    showToast('Recently viewed history cleared.', 'info');
  }, [showToast]);

  const saveSearchAlert = useCallback(
    (name: string, filters: Partial<SearchFilters>, matchCount: number) => {
      const newEntry: SavedSearchEntry = {
        id: `srch-${Date.now()}`,
        name,
        filters,
        frequency: 'Instant',
        emailAlerts: true,
        smsAlerts: notifications.dealerReplySms,
        createdAt: new Date().toISOString().slice(0, 10),
        matchCount,
      };
      setSavedSearches((prev) => [newEntry, ...prev]);
      showToast(`Search alert "${name}" saved to your dashboard.`);
    },
    [notifications.dealerReplySms, showToast],
  );

  const updateSavedSearch = useCallback((id: string, updates: Partial<SavedSearchEntry>) => {
    setSavedSearches((prev) => prev.map((item) => (item.id === id ? { ...item, ...updates } : item)));
  }, []);

  const deleteSavedSearch = useCallback(
    (id: string) => {
      setSavedSearches((prev) => prev.filter((item) => item.id !== id));
      showToast('Search alert removed.', 'info');
    },
    [showToast],
  );

  const sendDealerInquiry = useCallback(
    (
      vehicle: Vehicle,
      buyerMessage: string,
      requestType: 'Inquiry' | 'Test Drive' | 'Offer' | 'Rental',
    ) => {
      const nowLabel = 'Just now';
      const nextStatus: MessageThread['status'] =
        requestType === 'Test Drive'
          ? 'Test Drive Scheduled'
          : requestType === 'Offer'
            ? 'Offer Sent'
            : requestType === 'Rental'
              ? 'Rental Reserved'
              : 'Active';

      const newMsg = {
        id: `m-${Date.now()}`,
        sender: 'buyer' as const,
        text: buyerMessage,
        timestamp: nowLabel,
      };

      setMessages((prev) => {
        const existing = prev.find((m) => m.vehicleId === vehicle.id);
        if (existing) {
          return prev.map((thread) =>
            thread.id === existing.id
              ? {
                  ...thread,
                  status: nextStatus,
                  updatedAt: nowLabel,
                  messages: [...thread.messages, newMsg],
                }
              : thread,
          );
        }
        const newThread: MessageThread = {
          id: `msg-${Date.now()}`,
          vehicleId: vehicle.id,
          vehicleTitle: `${vehicle.year} ${vehicle.make} ${vehicle.model} ${vehicle.trim}`,
          vehiclePrice: vehicle.price,
          vehicleImage: vehicle.image,
          dealerName: vehicle.dealerName,
          dealerPhone: vehicle.dealerPhone,
          status: nextStatus,
          unread: false,
          updatedAt: nowLabel,
          messages: [newMsg],
        };
        return [newThread, ...prev];
      });

      const toastMap = {
        'Test Drive': `Test drive request sent to ${vehicle.dealerName}.`,
        Offer: `Offer submitted to ${vehicle.dealerName} — track in Dashboard Messages.`,
        Rental: `Executive rental request sent to ${vehicle.dealerName}.`,
        Inquiry: `Availability inquiry sent to ${vehicle.dealerName}.`,
      };
      showToast(toastMap[requestType]);
    },
    [showToast],
  );

  const replyToThread = useCallback((threadId: string, text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setMessages((prev) =>
      prev.map((thread) =>
        thread.id === threadId
          ? {
              ...thread,
              unread: false,
              updatedAt: 'Just now',
              messages: [
                ...thread.messages,
                { id: `m-${Date.now()}`, sender: 'buyer', text: trimmed, timestamp: 'Just now' },
              ],
            }
          : thread,
      ),
    );

    setTimeout(() => {
      setMessages((prev) =>
        prev.map((thread) =>
          thread.id === threadId
            ? {
                ...thread,
                unread: true,
                updatedAt: 'Just now',
                messages: [
                  ...thread.messages,
                  {
                    id: `m-reply-${Date.now()}`,
                    sender: 'dealer',
                    text: 'Thank you for following up! An AutoLux USA concierge specialist has received your note and confirmed availability on this VIN.',
                    timestamp: 'Just now',
                  },
                ],
              }
            : thread,
        ),
      );
    }, 900);
  }, []);

  const markThreadRead = useCallback((threadId: string) => {
    setMessages((prev) => prev.map((t) => (t.id === threadId ? { ...t, unread: false } : t)));
  }, []);

  const saveFinancingProfile = useCallback(
    (profile: FinancingProfile) => {
      setFinancingProfile(profile);
      showToast('Pre-qualification profile saved to your AutoLux Dashboard.');
    },
    [showToast],
  );

  const addUserListing = useCallback(
    (listing: Omit<UserListing, 'id' | 'createdAt'>) => {
      const created: UserListing = {
        ...listing,
        id: `ul-${Date.now()}`,
        createdAt: new Date().toISOString().slice(0, 10),
      };
      setUserListings((prev) => [created, ...prev]);

      let vehicleSlug: string | undefined;
      if (listing.status === 'Active Listing') {
        const liveVehicle = buildLiveVehicleFromListing(created, userProfile.defaultZip);
        vehicleSlug = liveVehicle.slug;
        setCustomVehicles((prev) => [liveVehicle, ...prev]);
        showToast(`${listing.year} ${listing.make} ${listing.model} is now live in Search Results!`);
      } else {
        showToast(`${listing.year} ${listing.make} ${listing.model} added to My Listings.`);
      }

      return { listing: created, vehicleSlug };
    },
    [showToast, userProfile.defaultZip],
  );

  const removeUserListing = useCallback(
    (id: string) => {
      setUserListings((prev) => prev.filter((item) => item.id !== id));
      setCustomVehicles((prev) => prev.filter((item) => item.id !== `custom-${id}`));
      showToast('Listing removed.', 'info');
    },
    [showToast],
  );

  const toggleCompare = useCallback(
    (vehicleId: string) => {
      setCompareIds((prev) => {
        if (prev.includes(vehicleId)) {
          return prev.filter((id) => id !== vehicleId);
        }
        if (prev.length >= 3) {
          showToast('You can compare up to 3 vehicles at once.', 'info');
          return prev;
        }
        return [...prev, vehicleId];
      });
    },
    [showToast],
  );

  const clearCompare = useCallback(() => setCompareIds([]), []);

  const updateUserProfile = useCallback(
    (profile: Partial<UserProfile>) => {
      setUserProfile((prev) => ({ ...prev, ...profile }));
      showToast('Profile settings saved.');
    },
    [showToast],
  );

  const updateNotifications = useCallback(
    (prefs: Partial<NotificationPreferences>) => {
      setNotifications((prev) => ({ ...prev, ...prefs }));
      showToast('Notification preferences updated.');
    },
    [showToast],
  );

  const exportUserData = useCallback(() => {
    const payload = {
      exportedAt: new Date().toISOString(),
      platform: 'AutoLux USA',
      userProfile,
      notifications,
      financingProfile,
      savedVehicles,
      savedSearches,
      recentlyViewedIds,
      userListings,
      compareIds,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `autolux-usa-account-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Account data exported as JSON.');
  }, [
    compareIds,
    financingProfile,
    notifications,
    recentlyViewedIds,
    savedSearches,
    savedVehicles,
    showToast,
    userListings,
    userProfile,
  ]);

  const resetDemoState = useCallback(() => {
    setSavedVehicles(DEFAULT_SAVED_VEHICLES);
    setSavedSearches(DEFAULT_SAVED_SEARCHES);
    setRecentlyViewedIds(DEFAULT_RECENTLY_VIEWED);
    setMessages(DEFAULT_MESSAGES);
    setFinancingProfile(DEFAULT_FINANCING);
    setUserListings([]);
    setCustomVehicles([]);
    setCompareIds([]);
    setUserProfile(DEFAULT_USER_PROFILE);
    setNotifications(DEFAULT_NOTIFICATIONS);
    localStorage.removeItem(STORAGE_KEY);
    showToast('Account preferences and saved data restored to defaults.', 'info');
  }, [showToast]);

  const contextValue = useMemo(
    () => ({
      vehicles,
      savedVehicles,
      savedSearches,
      recentlyViewedIds,
      messages,
      financingProfile,
      userListings,
      compareIds,
      userProfile,
      notifications,
      toasts,
      isSaved,
      toggleSaveVehicle,
      updateSavedVehicleNote,
      trackVehicleView,
      clearRecentlyViewed,
      saveSearchAlert,
      updateSavedSearch,
      deleteSavedSearch,
      sendDealerInquiry,
      replyToThread,
      markThreadRead,
      saveFinancingProfile,
      addUserListing,
      removeUserListing,
      toggleCompare,
      clearCompare,
      updateUserProfile,
      updateNotifications,
      showToast,
      dismissToast,
      exportUserData,
      resetDemoState,
    }),
    [
      vehicles,
      savedVehicles,
      savedSearches,
      recentlyViewedIds,
      messages,
      financingProfile,
      userListings,
      compareIds,
      userProfile,
      notifications,
      toasts,
      isSaved,
      toggleSaveVehicle,
      updateSavedVehicleNote,
      trackVehicleView,
      clearRecentlyViewed,
      saveSearchAlert,
      updateSavedSearch,
      deleteSavedSearch,
      sendDealerInquiry,
      replyToThread,
      markThreadRead,
      saveFinancingProfile,
      addUserListing,
      removeUserListing,
      toggleCompare,
      clearCompare,
      updateUserProfile,
      updateNotifications,
      showToast,
      dismissToast,
      exportUserData,
      resetDemoState,
    ],
  );

  return <MarketplaceContext.Provider value={contextValue}>{children}</MarketplaceContext.Provider>;
}

export function useMarketplace() {
  const ctx = useContext(MarketplaceContext);
  if (!ctx) {
    throw new Error('useMarketplace must be used inside MarketplaceProvider');
  }
  return ctx;
}
