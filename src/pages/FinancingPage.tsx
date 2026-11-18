import { CheckCircle2, Lock, ShieldCheck } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useMarketplace } from '../context/MarketplaceContext';
import { useSeo } from '../hooks/useSeo';
import type { FinancingProfile } from '../types/marketplace';

export function FinancingPage() {
  const { financingProfile, saveFinancingProfile } = useMarketplace();

  const [creditTier, setCreditTier] = useState<FinancingProfile['creditTier']>(
    financingProfile.creditTier,
  );
  const [annualIncome, setAnnualIncome] = useState(financingProfile.annualIncome);
  const [monthlyHousing, setMonthlyHousing] = useState(financingProfile.monthlyHousing);
  const [downPayment, setDownPayment] = useState(financingProfile.downPayment);
  const [termMonths, setTermMonths] = useState<36 | 48 | 60 | 72>(
    financingProfile.preferredTermMonths,
  );
  const [submitted, setSubmitted] = useState(false);

  useSeo({
    title: 'Auto Financing & No-Impact Pre-Qualification – AutoLux USA',
    description:
      'Estimate your monthly auto loan payment and pre-qualify for AutoLux USA dealer financing in minutes with zero impact to your credit score.',
    path: '/financing',
  });

  const estimate = useMemo(() => {
    const aprMap: Record<FinancingProfile['creditTier'], number> = {
      'Excellent (740+)': 5.49,
      'Good (680-739)': 6.99,
      'Fair (620-679)': 9.75,
      'Rebuilding (<620)': 13.5,
    };
    const apr = aprMap[creditTier];
    const monthlyGross = annualIncome / 12;
    const maxTotalDebtPayment = monthlyGross * 0.36;
    const maxAutoPayment = Math.max(350, Math.round(maxTotalDebtPayment - monthlyHousing));
    const r = apr / 100 / 12;
    const loanAmount = Math.round(
      maxAutoPayment * ((Math.pow(1 + r, termMonths) - 1) / (r * Math.pow(1 + r, termMonths))),
    );
    const buyingPower = Math.min(200000, loanAmount + downPayment);
    return { apr, maxAutoPayment, buyingPower };
  }, [creditTier, annualIncome, monthlyHousing, downPayment, termMonths]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveFinancingProfile({
      preQualified: true,
      creditTier,
      annualIncome,
      monthlyHousing,
      downPayment,
      estimatedBuyingPower: estimate.buyingPower,
      estimatedApr: estimate.apr,
      preferredTermMonths: termMonths,
      updatedAt: new Date().toISOString().slice(0, 10),
    });
    setSubmitted(true);
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="max-w-3xl">
        <h1 className="font-display text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
          Auto Financing &amp; Soft-Pull Pre-Qualification
        </h1>
        <p className="mt-2 text-sm text-slate-600 sm:text-base">
          Discover your personalized buying power and estimated APR across AutoLux USA partner lenders
          with zero impact on your credit score.
        </p>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-12">
        <form
          onSubmit={handleSubmit}
          className="space-y-5 rounded-xl border border-slate-200 bg-white p-6 lg:col-span-7"
        >
          <div>
            <label htmlFor="fin-credit" className="block text-xs font-semibold text-slate-700">
              Estimated Credit Tier
            </label>
            <select
              id="fin-credit"
              value={creditTier}
              onChange={(e) => setCreditTier(e.target.value as FinancingProfile['creditTier'])}
              className="mt-1.5 h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium focus:border-red-600 focus:outline-none"
            >
              <option value="Excellent (740+)">Excellent (740+)</option>
              <option value="Good (680-739)">Good (680-739)</option>
              <option value="Fair (620-679)">Fair (620-679)</option>
              <option value="Rebuilding (<620)">Rebuilding (&lt;620)</option>
            </select>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="fin-income" className="block text-xs font-semibold text-slate-700">
                Gross Annual Income (USD)
              </label>
              <input
                id="fin-income"
                type="number"
                min={18000}
                step={2500}
                value={annualIncome}
                onChange={(e) => setAnnualIncome(Number(e.target.value))}
                className="mt-1.5 h-11 w-full rounded-lg border border-slate-200 px-3 font-mono text-sm tabular-nums focus:border-red-600 focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="fin-housing" className="block text-xs font-semibold text-slate-700">
                Monthly Rent / Mortgage (USD)
              </label>
              <input
                id="fin-housing"
                type="number"
                min={0}
                step={100}
                value={monthlyHousing}
                onChange={(e) => setMonthlyHousing(Number(e.target.value))}
                className="mt-1.5 h-11 w-full rounded-lg border border-slate-200 px-3 font-mono text-sm tabular-nums focus:border-red-600 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="fin-down" className="block text-xs font-semibold text-slate-700">
                Down Payment / Trade Equity (USD)
              </label>
              <input
                id="fin-down"
                type="number"
                min={0}
                step={500}
                value={downPayment}
                onChange={(e) => setDownPayment(Number(e.target.value))}
                className="mt-1.5 h-11 w-full rounded-lg border border-slate-200 px-3 font-mono text-sm tabular-nums focus:border-red-600 focus:outline-none"
              />
            </div>

            <div>
              <span className="block text-xs font-semibold text-slate-700">Preferred Term</span>
              <div className="mt-1.5 grid grid-cols-4 gap-2">
                {([36, 48, 60, 72] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTermMonths(t)}
                    className={`h-11 rounded-lg border text-xs font-semibold tabular-nums transition-colors ${
                      termMonths === t
                        ? 'border-slate-950 bg-slate-950 text-white'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {t}m
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-lg bg-slate-50 p-3 text-xs text-slate-600">
            <Lock className="h-4 w-4 shrink-0 text-emerald-600" aria-hidden="true" />
            <span>Soft-inquiry simulation only. Does not affect your FICO or VantageScore.</span>
          </div>

          <button
            type="submit"
            className="h-11 w-full rounded-lg bg-red-600 px-6 text-sm font-bold text-white hover:bg-red-700 transition-colors"
          >
            Save Pre-Qualification to Dashboard
          </button>

          {submitted && (
            <div className="flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800">
              <span className="inline-flex items-center gap-1.5 font-semibold">
                <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                Pre-qualification updated in your Buyer Dashboard.
              </span>
              <Link to="/dashboard" className="font-bold underline">
                Open Dashboard
              </Link>
            </div>
          )}
        </form>

        {/* Live Pre-Qualification Summary Card */}
        <div className="flex flex-col justify-between rounded-xl border border-slate-800 bg-slate-950 p-6 text-white lg:col-span-5">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
              <ShieldCheck className="h-4 w-4" aria-hidden="true" />
              <span>Estimated Pre-Qualification</span>
            </div>
            <div className="mt-4 text-xs text-slate-400">Estimated Total Buying Power</div>
            <div className="mt-1 font-display text-4xl font-extrabold tabular-nums">
              ${estimate.buyingPower.toLocaleString()}
            </div>

            <dl className="mt-6 space-y-3 border-t border-slate-800 pt-5 text-sm">
              <div className="flex justify-between">
                <dt className="text-slate-400">Estimated APR</dt>
                <dd className="font-mono font-semibold tabular-nums">{estimate.apr.toFixed(2)}%</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-400">Comfortable Monthly Budget</dt>
                <dd className="font-mono font-semibold tabular-nums">
                  Up to ${estimate.maxAutoPayment.toLocaleString()}/mo
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-400">Down Payment Included</dt>
                <dd className="font-mono font-semibold tabular-nums">${downPayment.toLocaleString()}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-400">Loan Term</dt>
                <dd className="font-mono font-semibold tabular-nums">{termMonths} months</dd>
              </div>
            </dl>
          </div>

          <div className="mt-8 space-y-3">
            <Link
              to={`/cars-for-sale?maxPrice=${estimate.buyingPower}`}
              className="flex h-11 w-full items-center justify-center rounded-lg bg-red-600 text-sm font-bold text-white hover:bg-red-700 transition-colors"
            >
              Shop Vehicles Within My Budget
            </Link>
            <p className="text-center text-xs text-slate-400">
              Accepted across all AutoLux USA Certified Dealerships
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
