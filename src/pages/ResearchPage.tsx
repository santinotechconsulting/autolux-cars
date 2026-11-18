import { ArrowRight, BookOpen, CheckCircle2, Scale } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useMarketplace } from '../context/MarketplaceContext';
import { RESEARCH_ARTICLES } from '../data/inventory';
import { useSeo } from '../hooks/useSeo';

export function ResearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { vehicles, compareIds, toggleCompare } = useMarketplace();

  const initialTab = searchParams.get('tab') === 'compare' ? 'compare' : 'reviews';
  const [activeTab, setActiveTab] = useState<'reviews' | 'compare'>(initialTab);
  const [selectedSlug, setSelectedSlug] = useState(
    searchParams.get('article') || RESEARCH_ARTICLES[0].slug,
  );

  useEffect(() => {
    if (searchParams.get('tab') === 'compare') setActiveTab('compare');
    const slugParam = searchParams.get('article');
    if (slugParam) {
      setSelectedSlug(slugParam);
      setActiveTab('reviews');
    }
  }, [searchParams]);

  useSeo({
    title: 'Car Reviews, Buying Guides & Side-by-Side Comparison – AutoLux USA',
    description:
      'Read expert automotive reviews, ownership cost guides, and compare specs side-by-side on AutoLux USA.',
    path: '/research',
  });

  const activeArticle =
    RESEARCH_ARTICLES.find((a) => a.slug === selectedSlug) || RESEARCH_ARTICLES[0];

  const comparedVehicles =
    compareIds.length > 0
      ? vehicles.filter((v) => compareIds.includes(v.id))
      : vehicles.slice(0, 3);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-col items-start justify-between gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-slate-950">
            Automotive Research &amp; Comparison Hub
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Expert road tests, real-world ownership math, and side-by-side vehicle specification tables.
          </p>
        </div>

        <div className="inline-flex rounded-lg border border-slate-200 bg-white p-1">
          <button
            type="button"
            onClick={() => {
              setActiveTab('reviews');
              setSearchParams({});
            }}
            className={`inline-flex items-center gap-2 rounded-md px-4 py-2 text-xs font-semibold transition-colors whitespace-nowrap ${
              activeTab === 'reviews' ? 'bg-slate-950 text-white' : 'text-slate-600 hover:text-slate-950'
            }`}
          >
            <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Reviews &amp; Guides</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('compare');
              setSearchParams({ tab: 'compare' });
            }}
            className={`inline-flex items-center gap-2 rounded-md px-4 py-2 text-xs font-semibold transition-colors whitespace-nowrap ${
              activeTab === 'compare' ? 'bg-slate-950 text-white' : 'text-slate-600 hover:text-slate-950'
            }`}
          >
            <Scale className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Compare Cars ({comparedVehicles.length})</span>
          </button>
        </div>
      </div>

      {activeTab === 'reviews' ? (
        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Article Sidebar */}
          <div className="space-y-3 lg:col-span-4">
            <h2 className="font-display text-sm font-bold text-slate-950">Latest Editorial Guides</h2>
            {RESEARCH_ARTICLES.map((art) => (
              <button
                key={art.id}
                type="button"
                onClick={() => setSelectedSlug(art.slug)}
                className={`w-full rounded-xl border p-4 text-left transition-all ${
                  art.slug === activeArticle.slug
                    ? 'border-red-600 bg-red-50/40'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span className="font-semibold text-red-600">{art.category}</span>
                  <span aria-hidden="true">&middot;</span>
                  <span>{art.readTime}</span>
                </div>
                <div className="mt-1 font-display text-sm font-bold text-slate-950">{art.title}</div>
              </button>
            ))}
          </div>

          {/* Full Article Reader */}
          <article className="rounded-xl border border-slate-200 bg-white overflow-hidden lg:col-span-8">
            <div className="aspect-[16/9] w-full overflow-hidden bg-slate-100">
              <img
                src={activeArticle.image}
                alt={activeArticle.title}
                className="h-full w-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="p-6 sm:p-8">
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <span className="font-semibold text-red-600">{activeArticle.category}</span>
                <span aria-hidden="true">&middot;</span>
                <span>{activeArticle.publishedDate}</span>
                <span aria-hidden="true">&middot;</span>
                <span>{activeArticle.readTime}</span>
              </div>

              <h2 className="mt-2 font-display text-2xl font-extrabold text-slate-950 sm:text-3xl">
                {activeArticle.title}
              </h2>
              <p className="mt-2 text-xs font-medium text-slate-500">
                By {activeArticle.author} &middot; {activeArticle.authorRole}
              </p>

              <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-5">
                <h3 className="font-display text-sm font-bold text-slate-950">Key Takeaways</h3>
                <ul className="mt-3 space-y-2">
                  {activeArticle.keyTakeaways.map((point) => (
                    <li key={point} className="flex items-start gap-2 text-sm text-slate-700">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" aria-hidden="true" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-6 space-y-4 text-base leading-relaxed text-slate-700">
                {activeArticle.content.map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </div>
            </div>
          </article>
        </div>
      ) : (
        <div className="mt-8 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4">
            <div className="text-sm text-slate-600">
              {compareIds.length > 0
                ? `Comparing your ${compareIds.length} selected vehicles.`
                : 'Showing top 3 featured models. Click "Compare" on any listing to customize.'}
            </div>
            <div className="flex flex-wrap gap-2">
              {vehicles.slice(0, 6).map((v) => {
                const selected = compareIds.includes(v.id);
                return (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => toggleCompare(v.id)}
                    className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${
                      selected
                        ? 'border-slate-950 bg-slate-950 text-white'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {v.year} {v.make} {v.model}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
            <table className="w-full min-w-[680px] text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr>
                  <th className="w-44 p-4 font-display text-xs font-bold text-slate-500">Specification</th>
                  {comparedVehicles.map((v) => (
                    <th key={v.id} className="p-4 align-top">
                      <Link to={`/vehicle/${v.slug}`} className="group block">
                        <img
                          src={v.image}
                          alt={`${v.year} ${v.make} ${v.model}`}
                          className="aspect-[4/3] w-full rounded-lg object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <div className="mt-3 font-display text-base font-bold text-slate-950 group-hover:text-red-600">
                          {v.year} {v.make} {v.model}
                        </div>
                        <div className="text-xs font-normal text-slate-500">{v.trim}</div>
                      </Link>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="p-4 text-xs font-semibold text-slate-500">AutoLux Price</td>
                  {comparedVehicles.map((v) => (
                    <td key={v.id} className="p-4 font-display text-lg font-bold tabular-nums text-slate-950">
                      ${v.price.toLocaleString()}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-4 text-xs font-semibold text-slate-500">Mileage</td>
                  {comparedVehicles.map((v) => (
                    <td key={v.id} className="p-4 tabular-nums text-slate-800">
                      {v.mileage.toLocaleString()} mi
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-4 text-xs font-semibold text-slate-500">Engine</td>
                  {comparedVehicles.map((v) => (
                    <td key={v.id} className="p-4 text-slate-800">
                      {v.engine}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-4 text-xs font-semibold text-slate-500">Horsepower</td>
                  {comparedVehicles.map((v) => (
                    <td key={v.id} className="p-4 font-semibold tabular-nums text-slate-800">
                      {v.horsepower} hp
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-4 text-xs font-semibold text-slate-500">Drivetrain / Fuel</td>
                  {comparedVehicles.map((v) => (
                    <td key={v.id} className="p-4 text-slate-800">
                      {v.drivetrain} &middot; {v.fuelType}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-4 text-xs font-semibold text-slate-500">Fuel Economy</td>
                  {comparedVehicles.map((v) => (
                    <td key={v.id} className="p-4 tabular-nums text-slate-800">
                      {v.mpgCity} / {v.mpgHighway} {v.fuelType === 'Electric' ? 'MPGe' : 'MPG'}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-4 text-xs font-semibold text-slate-500">History Report</td>
                  {comparedVehicles.map((v) => (
                    <td key={v.id} className="p-4 text-emerald-700 font-semibold">
                      {v.titleStatus} ({v.accidentsReported} accidents)
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-4" />
                  {comparedVehicles.map((v) => (
                    <td key={v.id} className="p-4">
                      <Link
                        to={`/vehicle/${v.slug}`}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700 transition-colors"
                      >
                        <span>View Listing</span>
                        <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                      </Link>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
