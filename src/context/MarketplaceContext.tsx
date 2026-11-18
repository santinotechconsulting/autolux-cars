import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { IMG_FORD_F150, IMG_MERCEDES_AMG, VEHICLES } from '../data/inventory';
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
  addUserListing: (listing: Omit<UserListing, 'id' | 'createdAt'>) => void;
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

const MarketplaceContext = createContext<MarketplaceContextValue | undefined>(undefined);

export function MarketplaceProvider({ children }: { children: React.ReactNode }) {
  const [vehicles] = useState<Vehicle[]>(VEHICLES);
  const [savedVehicles, setSavedVehicles] = useState<SavedVehicleEntry[]>(DEFAULT_SAVED_VEHICLES);
  const [savedSearches, setSavedSearches] = useState<SavedSearchEntry[]>(DEFAULT_SAVED_SEARCHES);
  const [recentlyViewedIds, setRecentlyViewedIds] = useState<string[]>(DEFAULT_RECENTLY_VIEWED);
  const [messages, setMessages] = useState<MessageThread[]>(DEFAULT_MESSAGES);
  const [financingProfile, setFinancingProfile] = useState<FinancingProfile>(DEFAULT_FINANCING);
  const [userListings, setUserListings] = useState<UserListing[]>([]);
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile>(DEFAULT_USER_PROFILE);
  const [notifications, setNotifications] = useState<NotificationPreferences>(DEFAULT_NOTIFICATIONS);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

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

  const isSaved = (vehicleId: string) => savedVehicles.some((entry) => entry.vehicleId === vehicleId);

  const toggleSaveVehicle = (vehicle: Vehicle) => {
    const exists = savedVehicles.some((entry) => entry.vehicleId === vehicle.id);
    if (exists) {
      setSavedVehicles((prev) => prev.filter((entry) => entry.vehicleId !== vehicle.id));
      showToast(`Removed ${vehicle.year} ${vehicle.make} ${vehicle.model} from saved vehicles.`, 'info');
    } else {
      setSavedVehicles((prev) => [
        {
          vehicleId: vehicle.id,
          savedAt: new Date().toISOString().slice(0, 10),
          priceAtSave: vehicle.price,
          note: '',
        },
        ...prev,
      ]);
      showToast(`Saved ${vehicle.year} ${vehicle.make} ${vehicle.model} to your dashboard.`);
    }
  };

  const updateSavedVehicleNote = (vehicleId: string, note: string) => {
    setSavedVehicles((prev) =>
      prev.map((entry) => (entry.vehicleId === vehicleId ? { ...entry, note } : entry)),
    );
    showToast('Saved note updated.');
  };

  const trackVehicleView = useCallback((vehicleId: string) => {
    setRecentlyViewedIds((prev) => {
      const next = [vehicleId, ...prev.filter((id) => id !== vehicleId)].slice(0, 6);
      if (next.length === prev.length && next.every((v, i) => v === prev[i])) return prev;
      return next;
    });
  }, []);

  const clearRecentlyViewed = () => {
    setRecentlyViewedIds([]);
    showToast('Recently viewed history cleared.', 'info');
  };

  const saveSearchAlert = (name: string, filters: Partial<SearchFilters>, matchCount: number) => {
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
  };

  const updateSavedSearch = (id: string, updates: Partial<SavedSearchEntry>) => {
    setSavedSearches((prev) => prev.map((item) => (item.id === id ? { ...item, ...updates } : item)));
  };

  const deleteSavedSearch = (id: string) => {
    setSavedSearches((prev) => prev.filter((item) => item.id !== id));
    showToast('Search alert removed.', 'info');
  };

  const sendDealerInquiry = (
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

    const existing = messages.find((m) => m.vehicleId === vehicle.id);
    const newMsg = {
      id: `m-${Date.now()}`,
      sender: 'buyer' as const,
      text: buyerMessage,
      timestamp: nowLabel,
    };

    if (existing) {
      setMessages((prev) =>
        prev.map((thread) =>
          thread.id === existing.id
            ? {
                ...thread,
                status: nextStatus,
                updatedAt: nowLabel,
                messages: [...thread.messages, newMsg],
              }
            : thread,
        ),
      );
    } else {
      const threadId = `msg-${Date.now()}`;
      const newThread: MessageThread = {
        id: threadId,
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
      setMessages((prev) => [newThread, ...prev]);
    }

    const toastMap = {
      'Test Drive': `Test drive request sent to ${vehicle.dealerName}.`,
      Offer: `Offer submitted to ${vehicle.dealerName} — track in Dashboard Messages.`,
      Rental: `Executive rental request sent to ${vehicle.dealerName}.`,
      Inquiry: `Availability inquiry sent to ${vehicle.dealerName}.`,
    };
    showToast(toastMap[requestType]);
  };

  const replyToThread = (threadId: string, text: string) => {
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
  };

  const markThreadRead = (threadId: string) => {
    setMessages((prev) => prev.map((t) => (t.id === threadId ? { ...t, unread: false } : t)));
  };

  const saveFinancingProfile = (profile: FinancingProfile) => {
    setFinancingProfile(profile);
    showToast('Pre-qualification profile saved to your AutoLux Dashboard.');
  };

  const addUserListing = (listing: Omit<UserListing, 'id' | 'createdAt'>) => {
    const created: UserListing = {
      ...listing,
      id: `ul-${Date.now()}`,
      createdAt: new Date().toISOString().slice(0, 10),
    };
    setUserListings((prev) => [created, ...prev]);
    showToast(`${listing.year} ${listing.make} ${listing.model} added to My Listings.`);
  };

  const removeUserListing = (id: string) => {
    setUserListings((prev) => prev.filter((item) => item.id !== id));
    showToast('Listing removed.', 'info');
  };

  const toggleCompare = (vehicleId: string) => {
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
  };

  const clearCompare = () => setCompareIds([]);

  const updateUserProfile = (profile: Partial<UserProfile>) => {
    setUserProfile((prev) => ({ ...prev, ...profile }));
    showToast('Profile settings saved.');
  };

  const updateNotifications = (prefs: Partial<NotificationPreferences>) => {
    setNotifications((prev) => ({ ...prev, ...prefs }));
    showToast('Notification preferences updated.');
  };

  const exportUserData = () => {
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
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `autolux-usa-account-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Account data exported as JSON.');
  };

  const resetDemoState = () => {
    setSavedVehicles(DEFAULT_SAVED_VEHICLES);
    setSavedSearches(DEFAULT_SAVED_SEARCHES);
    setRecentlyViewedIds(DEFAULT_RECENTLY_VIEWED);
    setMessages(DEFAULT_MESSAGES);
    setFinancingProfile(DEFAULT_FINANCING);
    setUserListings([]);
    setUserProfile(DEFAULT_USER_PROFILE);
    setNotifications(DEFAULT_NOTIFICATIONS);
    localStorage.removeItem(STORAGE_KEY);
    showToast('Account preferences and saved data restored to defaults.', 'info');
  };

  return (
    <MarketplaceContext.Provider
      value={{
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
      }}
    >
      {children}
    </MarketplaceContext.Provider>
  );
}

export function useMarketplace() {
  const ctx = useContext(MarketplaceContext);
  if (!ctx) {
    throw new Error('useMarketplace must be used inside MarketplaceProvider');
  }
  return ctx;
}
