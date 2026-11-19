import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { CompareTray } from './components/CompareTray';
import { FloatingActions } from './components/FloatingActions';
import { Footer } from './components/Footer';
import { Navbar } from './components/Navbar';
import { ToastContainer } from './components/ToastContainer';
import { MarketplaceProvider } from './context/MarketplaceContext';
import { HomePage } from './pages/HomePage';

const loadSearchResults = () => import('./pages/SearchResultsPage');
const loadVehicleDetails = () => import('./pages/VehicleDetailsPage');
const loadSellYourCar = () => import('./pages/SellYourCarPage');
const loadResearch = () => import('./pages/ResearchPage');
const loadFinancing = () => import('./pages/FinancingPage');
const loadDealers = () => import('./pages/DealersPage');
const loadDashboard = () => import('./pages/DashboardPage');

const SearchResultsPage = lazy(() =>
  loadSearchResults().then((m) => ({ default: m.SearchResultsPage })),
);
const VehicleDetailsPage = lazy(() =>
  loadVehicleDetails().then((m) => ({ default: m.VehicleDetailsPage })),
);
const SellYourCarPage = lazy(() =>
  loadSellYourCar().then((m) => ({ default: m.SellYourCarPage })),
);
const ResearchPage = lazy(() => loadResearch().then((m) => ({ default: m.ResearchPage })));
const FinancingPage = lazy(() => loadFinancing().then((m) => ({ default: m.FinancingPage })));
const DealersPage = lazy(() => loadDealers().then((m) => ({ default: m.DealersPage })));
const DashboardPage = lazy(() => loadDashboard().then((m) => ({ default: m.DashboardPage })));

const prefetchedRoutes = new Set<string>();

export function prefetchRoute(path: string) {
  if (prefetchedRoutes.has(path)) return;
  prefetchedRoutes.add(path);
  if (path.startsWith('/cars-for-sale')) void loadSearchResults();
  else if (path.startsWith('/vehicle/')) void loadVehicleDetails();
  else if (path.startsWith('/sell-your-car')) void loadSellYourCar();
  else if (path.startsWith('/research')) void loadResearch();
  else if (path.startsWith('/financing')) void loadFinancing();
  else if (path.startsWith('/dealers')) void loadDealers();
  else if (path.startsWith('/dashboard')) void loadDashboard();
}

function PageLoader() {
  return (
    <div
      className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8"
      role="status"
      aria-label="Loading page content"
    >
      <div className="h-8 w-64 animate-pulse rounded-lg bg-slate-200" />
      <div className="mt-3 h-4 w-96 max-w-full animate-pulse rounded bg-slate-200" />
      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-80 animate-pulse rounded-xl border border-slate-200 bg-white p-4">
            <div className="h-44 rounded-lg bg-slate-100" />
            <div className="mt-4 h-4 w-3/4 rounded bg-slate-100" />
            <div className="mt-2 h-4 w-1/2 rounded bg-slate-100" />
          </div>
        ))}
      </div>
    </div>
  );
}

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <MarketplaceProvider>
      <BrowserRouter>
        <ScrollToTop />
        <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900">
          <Navbar />
          <ToastContainer />
          <main className="flex-1">
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/cars-for-sale" element={<SearchResultsPage />} />
                <Route path="/vehicle/:slug" element={<VehicleDetailsPage />} />
                <Route path="/sell-your-car" element={<SellYourCarPage />} />
                <Route path="/research" element={<ResearchPage />} />
                <Route path="/financing" element={<FinancingPage />} />
                <Route path="/dealers" element={<DealersPage />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/dashboard/:section" element={<DashboardPage />} />
                <Route path="/settings" element={<Navigate to="/dashboard/settings" replace />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </main>
          <CompareTray />
          <FloatingActions />
          <Footer />
        </div>
      </BrowserRouter>
    </MarketplaceProvider>
  );
}
