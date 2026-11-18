import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { CompareTray } from './components/CompareTray';
import { FloatingActions } from './components/FloatingActions';
import { Footer } from './components/Footer';
import { Navbar } from './components/Navbar';
import { ToastContainer } from './components/ToastContainer';
import { MarketplaceProvider } from './context/MarketplaceContext';
import { DashboardPage } from './pages/DashboardPage';
import { DealersPage } from './pages/DealersPage';
import { FinancingPage } from './pages/FinancingPage';
import { HomePage } from './pages/HomePage';
import { ResearchPage } from './pages/ResearchPage';
import { SearchResultsPage } from './pages/SearchResultsPage';
import { SellYourCarPage } from './pages/SellYourCarPage';
import { VehicleDetailsPage } from './pages/VehicleDetailsPage';

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
          </main>
          <CompareTray />
          <FloatingActions />
          <Footer />
        </div>
      </BrowserRouter>
    </MarketplaceProvider>
  );
}
