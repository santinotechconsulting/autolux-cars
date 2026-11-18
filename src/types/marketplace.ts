export type ListingType = 'Sale' | 'Rental';
export type VehicleCondition = 'New' | 'Used' | 'Certified Pre-Owned';
export type BodyStyle = 'SUV' | 'Truck' | 'Sedan' | 'Coupe' | 'Electric' | 'Luxury';
export type FuelType = 'Gasoline' | 'Hybrid' | 'Electric' | 'Diesel';
export type Drivetrain = 'AWD' | '4WD' | 'RWD' | 'FWD';
export type Transmission = 'Automatic' | 'Dual-Clutch' | 'Single-Speed EV' | 'Manual';
export type DealRating = 'Great Deal' | 'Good Deal' | 'Fair Price';

export interface HistoryRecord {
  date: string;
  mileage: number;
  event: string;
  location: string;
}

export interface Vehicle {
  id: string;
  slug: string;
  year: number;
  make: string;
  model: string;
  trim: string;
  price: number;
  fairMarketPrice: number;
  rentalDailyRate?: number;
  listingType: ListingType;
  condition: VehicleCondition;
  bodyStyle: BodyStyle;
  mileage: number;
  vin: string;
  stockNumber: string;
  exteriorColor: string;
  interiorColor: string;
  engine: string;
  horsepower: number;
  transmission: Transmission;
  drivetrain: Drivetrain;
  fuelType: FuelType;
  mpgCity: number;
  mpgHighway: number;
  image: string;
  gallery: string[];
  dealerId: string;
  dealerName: string;
  dealerCity: string;
  dealerState: string;
  dealerZip: string;
  dealerPhone: string;
  dealerRating: number;
  dealerReviewCount: number;
  distanceMiles: number;
  freeHistoryReport: boolean;
  accidentsReported: number;
  previousOwners: number;
  titleStatus: 'Clean Title' | 'Certified Clean';
  listedDaysAgo: number;
  isFeatured: boolean;
  features: string[];
  description: string;
  historyRecords: HistoryRecord[];
}

export interface Dealer {
  id: string;
  name: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  address: string;
  rating: number;
  reviewCount: number;
  inventoryCount: number;
  certified: boolean;
  specialties: string[];
  hours: string;
}

export interface ResearchArticle {
  id: string;
  slug: string;
  category: 'Expert Review' | 'Buying Guide' | 'Market Watch' | 'EV & Hybrid';
  title: string;
  excerpt: string;
  author: string;
  authorRole: string;
  publishedDate: string;
  readTime: string;
  image: string;
  keyTakeaways: string[];
  content: string[];
}

export interface SearchFilters {
  query: string;
  make: string;
  model: string;
  condition: string;
  bodyStyle: string;
  listingType: string;
  minPrice: string;
  maxPrice: string;
  minYear: string;
  maxYear: string;
  maxMileage: string;
  fuelType: string;
  drivetrain: string;
  transmission: string;
  zip: string;
  radius: string;
  freeHistoryOnly: boolean;
  greatDealsOnly: boolean;
  sortBy: 'best' | 'price_asc' | 'price_desc' | 'mileage_asc' | 'year_desc';
}

export interface SavedVehicleEntry {
  vehicleId: string;
  savedAt: string;
  priceAtSave: number;
  note: string;
}

export interface SavedSearchEntry {
  id: string;
  name: string;
  filters: Partial<SearchFilters>;
  frequency: 'Instant' | 'Daily' | 'Weekly';
  emailAlerts: boolean;
  smsAlerts: boolean;
  createdAt: string;
  matchCount: number;
}

export interface ChatMessage {
  id: string;
  sender: 'buyer' | 'dealer';
  text: string;
  timestamp: string;
}

export interface MessageThread {
  id: string;
  vehicleId: string;
  vehicleTitle: string;
  vehiclePrice: number;
  vehicleImage: string;
  dealerName: string;
  dealerPhone: string;
  status: 'Active' | 'Test Drive Scheduled' | 'Offer Sent' | 'Rental Reserved';
  unread: boolean;
  updatedAt: string;
  messages: ChatMessage[];
}

export interface FinancingProfile {
  preQualified: boolean;
  creditTier: 'Excellent (740+)' | 'Good (680-739)' | 'Fair (620-679)' | 'Rebuilding (<620)';
  annualIncome: number;
  monthlyHousing: number;
  downPayment: number;
  estimatedBuyingPower: number;
  estimatedApr: number;
  preferredTermMonths: 36 | 48 | 60 | 72;
  updatedAt: string;
}

export interface UserListing {
  id: string;
  year: number;
  make: string;
  model: string;
  trim: string;
  mileage: number;
  vin: string;
  condition: 'Excellent' | 'Good' | 'Fair';
  askingPrice: number;
  instantOfferEstimate: number;
  zip: string;
  status: 'Active Listing' | 'Instant Offer Ready' | 'Pending Inspection';
  createdAt: string;
}

export interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  defaultZip: string;
  defaultRadius: string;
  preferredContact: 'Email & SMS' | 'Email Only' | 'Phone Call';
  memberSince: string;
  lastPasswordUpdate: string;
}

export interface NotificationPreferences {
  priceDropAlerts: boolean;
  newListingMatches: boolean;
  dealerReplySms: boolean;
  weeklyMarketDigest: boolean;
  financingOffers: boolean;
}
