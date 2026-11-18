import { Link } from 'react-router-dom';
import { AUTOLUX_LOGO, POPULAR_MAKES } from '../data/inventory';

export function Footer() {
  return (
    <footer className="border-t border-slate-800 bg-slate-950 text-slate-300">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand Column */}
          <div>
            <Link to="/" className="inline-flex items-center gap-3">
              <img
                src={AUTOLUX_LOGO}
                alt="AutoLux USA — Drive Your Dream"
                className="h-12 w-24 rounded-md object-cover border border-slate-800"
                referrerPolicy="no-referrer"
              />
              <div>
                <div className="font-display text-lg font-extrabold text-white">
                  AutoLux <span className="text-red-500">USA</span>
                </div>
                <div className="text-xs tracking-wide text-slate-400">Drive Your Dream</div>
              </div>
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-slate-400">
              Nationwide automotive marketplace for inspected cars for sale, executive car rentals,
              free vehicle history reports, and trusted certified dealerships.
            </p>
          </div>

          {/* Marketplace */}
          <div>
            <h3 className="font-display text-sm font-semibold text-white">Explore Marketplace</h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <Link to="/cars-for-sale" className="hover:text-white transition-colors">
                  All Cars for Sale
                </Link>
              </li>
              <li>
                <Link to="/cars-for-sale?listingType=Rental" className="hover:text-white transition-colors">
                  Executive Car Rentals
                </Link>
              </li>
              <li>
                <Link to="/cars-for-sale?condition=Certified+Pre-Owned" className="hover:text-white transition-colors">
                  Certified Pre-Owned
                </Link>
              </li>
              <li>
                <Link to="/sell-your-car" className="hover:text-white transition-colors">
                  Sell or Trade Your Car
                </Link>
              </li>
              <li>
                <Link to="/financing" className="hover:text-white transition-colors">
                  Auto Financing &amp; Pre-Qualify
                </Link>
              </li>
            </ul>
          </div>

          {/* Popular Makes (SEO Internal Linking) */}
          <div>
            <h3 className="font-display text-sm font-semibold text-white">Popular Makes</h3>
            <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              {POPULAR_MAKES.slice(0, 8).map((make) => (
                <li key={make.name}>
                  <Link
                    to={`/cars-for-sale?make=${encodeURIComponent(make.name)}`}
                    className="hover:text-white transition-colors"
                  >
                    {make.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Account & Dealers */}
          <div>
            <h3 className="font-display text-sm font-semibold text-white">Account &amp; Partners</h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <Link to="/dashboard" className="hover:text-white transition-colors">
                  Buyer Dashboard
                </Link>
              </li>
              <li>
                <Link to="/dashboard/settings" className="hover:text-white transition-colors">
                  Profile &amp; Alert Settings
                </Link>
              </li>
              <li>
                <Link to="/research" className="hover:text-white transition-colors">
                  Reviews &amp; Side-by-Side Compare
                </Link>
              </li>
              <li>
                <Link to="/dealers" className="hover:text-white transition-colors">
                  Trusted Dealer Directory
                </Link>
              </li>
              <li>
                <a href="/sitemap.xml" className="hover:text-white transition-colors">
                  XML Sitemap
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-start justify-between gap-4 border-t border-slate-800 pt-6 text-xs text-slate-400 sm:flex-row sm:items-center">
          <p>&copy; {new Date().getFullYear()} AutoLux USA Marketplace. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-4">
            <span>Cars for Sale</span>
            <span aria-hidden="true">&middot;</span>
            <span>Car Rental</span>
            <span aria-hidden="true">&middot;</span>
            <span>Trusted Dealer Network</span>
            <span aria-hidden="true">&middot;</span>
            <span>Premium Quality</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
