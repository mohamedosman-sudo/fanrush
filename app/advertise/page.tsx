import Link from "next/link"
import AuthNav from "@/components/AuthNav"

const CONTACT_EMAIL = "Mohamedosmanldn@gmail.com"
const ENQUIRY_SUBJECT = encodeURIComponent("FanRush sponsorship enquiry")
const ENQUIRY_BODY = encodeURIComponent(
  "Hi FanRush team,\n\nI'm interested in sponsoring a placement on FanRush for World Cup 2026.\n\nCompany: \nWebsite: \nPlacement interest: \nBudget: \n\nLooking forward to hearing from you."
)
const MAILTO = `mailto:${CONTACT_EMAIL}?subject=${ENQUIRY_SUBJECT}&body=${ENQUIRY_BODY}`

// ── Package data ──────────────────────────────────────────────────────────────
const PACKAGES = [
  {
    id: "local",
    emoji: "📍",
    name: "Local Matchday Sponsor",
    price: "£99",
    period: "per match window",
    tagline: "Best for bars, cafés and restaurants",
    accent: "border-orange-500/40 hover:border-orange-500/70",
    badge: "bg-orange-500/15 text-orange-400 border-orange-500/25",
    placements: ["Watch parties page", "Match-detail page"],
    includes: [
      "Sponsor banner on watch-parties page",
      "Sponsor banner on match-detail page",
      "Click tracking & reporting",
      "Active date range control",
      "Custom emoji + tagline",
    ],
  },
  {
    id: "city",
    emoji: "🏙️",
    name: "City Fan Zone Sponsor",
    price: "£249",
    period: "per month",
    tagline: "Best for venues and local brands targeting one city",
    accent: "border-yellow-400/50 hover:border-yellow-400/80",
    badge: "bg-yellow-400/15 text-yellow-400 border-yellow-400/25",
    featured: true,
    placements: ["Home page", "Predictions page", "Watch parties page"],
    includes: [
      "Sponsor banners on home, predictions & watch-parties",
      "Priority placement — shown first",
      "Click tracking & reporting",
      "Logged-in / logged-out click analytics",
      "Active date range control",
      "Custom emoji, title, subtitle & link",
    ],
  },
  {
    id: "tournament",
    emoji: "🏆",
    name: "Tournament Partner",
    price: "£499",
    period: "per month",
    tagline: "Best for bigger brands wanting multi-page visibility",
    accent: "border-purple-500/40 hover:border-purple-500/70",
    badge: "bg-purple-500/15 text-purple-400 border-purple-500/25",
    placements: ["All pages (global placement)"],
    includes: [
      "Global sponsor banner — every page",
      "Leagues page sponsor banner",
      "Priority placement across all placements",
      "Full click tracking with user-level analytics",
      "Dedicated account support",
      "Custom campaign landing URL",
      "Active date range control",
    ],
  },
]

// ── Placement examples ────────────────────────────────────────────────────────
const PLACEMENTS = [
  {
    id: "home",
    emoji: "🏠",
    label: "Home Page Banner",
    placement: "home",
    desc: "Shown to every fan on the FanRush home feed — the highest-traffic page.",
    reach: "All fans",
  },
  {
    id: "predictions",
    emoji: "🎯",
    label: "Predictions Page",
    placement: "predictions",
    desc: "Reach the most engaged fans — prediction players check this page every matchday.",
    reach: "High engagement",
  },
  {
    id: "watch-parties",
    emoji: "📍",
    label: "Watch Parties",
    placement: "watch-parties",
    desc: "Appear to fans actively looking for a place to watch. Perfect for venues and F&B brands.",
    reach: "High intent",
  },
  {
    id: "leagues",
    emoji: "🏆",
    label: "Leagues Section",
    placement: "leagues",
    desc: "Your brand alongside the prediction leaderboard — social, shareable, competitive.",
    reach: "Community fans",
  },
]

// ── Why FanRush reasons ───────────────────────────────────────────────────────
const REASONS = [
  {
    icon: "⚽",
    title: "World Cup 2026 Audience",
    desc: "Reach fans during the biggest sporting event of the decade — USA, Canada & Mexico host cities.",
  },
  {
    icon: "📍",
    title: "Promote Your Brand",
    desc: "Perfect for venues, food deals, travel offers, fan merchandise and local events.",
  },
  {
    icon: "📊",
    title: "Real Click Tracking",
    desc: "See exactly how many fans clicked your banner, when, and from which page. Admin dashboard included.",
  },
  {
    icon: "📱",
    title: "Mobile-First Audience",
    desc: "FanRush is built for fans on their phones. Your banner reaches them in the moment.",
  },
]

export default function AdvertisePage() {
  return (
    <div className="min-h-screen text-white">

      {/* ── HEADER ────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-[#0a0a0f]/90 backdrop-blur-md border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-1 font-black text-2xl tracking-tight">
            <span className="text-orange-500">⚡</span>
            <span className="text-orange-500">Fan</span>
            <span className="text-white">Rush</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            {[
              ["Matches", "/matches"],
              ["Watch Parties", "/watch-parties"],
              ["Predictions", "/predictions"],
              ["Pricing", "/pricing"],
              ["Advertise", "/advertise"],
            ].map(([label, href]) => (
              <Link
                key={href}
                href={href}
                className={`text-sm font-medium transition-colors ${
                  href === "/advertise"
                    ? "text-orange-400"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                {label}
              </Link>
            ))}
          </nav>
          <AuthNav />
        </div>
      </header>

      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <section
        className="relative pt-24 pb-20 px-4 overflow-hidden"
      >
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-400 text-xs font-semibold mb-8">
            📣 Sponsorship & Advertising · World Cup 2026
          </div>

          <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-tight mb-6">
            <span className="text-white">Advertise to</span>
            <br />
            <span className="bg-gradient-to-r from-orange-400 to-yellow-400 bg-clip-text text-transparent">
              World Cup fans
            </span>
            <br />
            <span className="text-white">with FanRush</span>
          </h1>

          <p className="text-gray-400 text-lg leading-relaxed mb-10 max-w-2xl mx-auto">
            Reach fans looking for watch parties, matchday deals, predictions and fan zones — right when
            they&apos;re in the moment and ready to engage.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href={MAILTO}
              className="bg-orange-500 hover:bg-orange-400 text-white font-bold rounded-xl px-7 py-3.5 transition-all active:scale-95 text-sm"
            >
              📩 Become a Sponsor
            </a>
            <a
              href="#packages"
              className="bg-white/10 hover:bg-white/15 text-white font-semibold rounded-xl px-7 py-3.5 transition-all text-sm"
            >
              View Packages ↓
            </a>
          </div>

          {/* Quick stats bar */}
          <div className="mt-14 grid grid-cols-3 gap-4 max-w-sm mx-auto">
            {[
              { v: "7",    l: "Ad placements" },
              { v: "48M",  l: "Expected fans" },
              { v: "100%", l: "Mobile audience" },
            ].map(({ v, l }) => (
              <div key={l} className="text-center">
                <p className="text-orange-400 font-black text-2xl">{v}</p>
                <p className="text-gray-500 text-xs mt-0.5">{l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHY SPONSOR FANRUSH ───────────────────────────────────────────── */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <div className="inline-block w-12 h-1 bg-orange-500 rounded-full mb-4" />
            <h2 className="text-3xl md:text-4xl font-black mb-3">Why Sponsor FanRush?</h2>
            <p className="text-gray-400">
              Put your brand in front of passionate fans at exactly the right moment.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {REASONS.map((r) => (
              <div
                key={r.title}
                className="bg-gray-900 border border-white/10 rounded-2xl p-6 hover:border-orange-500/25 transition-colors"
              >
                <div className="text-3xl mb-4">{r.icon}</div>
                <h3 className="text-white font-bold text-base mb-2">{r.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{r.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SPONSOR PACKAGES ──────────────────────────────────────────────── */}
      <section id="packages" className="py-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <div className="inline-block w-12 h-1 bg-orange-500 rounded-full mb-4" />
            <h2 className="text-3xl md:text-4xl font-black mb-3">Sponsor Packages</h2>
            <p className="text-gray-400">
              Simple, transparent pricing — no hidden fees. All packages include click tracking.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PACKAGES.map((pkg) => (
              <div
                key={pkg.id}
                className={`relative bg-gray-900 border-2 rounded-2xl overflow-hidden transition-colors ${pkg.accent} ${
                  pkg.featured ? "ring-2 ring-yellow-400/30" : ""
                }`}
              >
                {/* Popular badge */}
                {pkg.featured && (
                  <div className="absolute top-0 inset-x-0 text-center">
                    <span className="inline-block bg-yellow-400 text-black text-[10px] font-black uppercase tracking-widest px-4 py-1">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className={`p-6 ${pkg.featured ? "pt-10" : ""}`}>
                  {/* Header */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div>
                      <div className="text-2xl mb-2">{pkg.emoji}</div>
                      <h3 className="text-white font-bold text-base leading-snug">{pkg.name}</h3>
                      <p className="text-gray-500 text-xs mt-1">{pkg.tagline}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-white font-black text-2xl leading-none">{pkg.price}</p>
                      <p className="text-gray-500 text-xs mt-0.5">{pkg.period}</p>
                    </div>
                  </div>

                  {/* Placement tags */}
                  <div className="flex flex-wrap gap-1.5 mb-5">
                    {pkg.placements.map((p) => (
                      <span
                        key={p}
                        className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${pkg.badge}`}
                      >
                        {p}
                      </span>
                    ))}
                  </div>

                  {/* Includes list */}
                  <ul className="space-y-2.5 mb-6">
                    {pkg.includes.map((item) => (
                      <li key={item} className="flex items-start gap-2.5 text-sm text-gray-300">
                        <span className="text-orange-400 font-bold mt-0.5 flex-shrink-0">✓</span>
                        {item}
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <a
                    href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(
                      `FanRush sponsorship enquiry — ${pkg.name}`
                    )}&body=${ENQUIRY_BODY}`}
                    className={`block w-full text-center font-bold text-sm rounded-xl py-3 transition-all active:scale-95 ${
                      pkg.featured
                        ? "bg-yellow-400 hover:bg-yellow-300 text-black"
                        : "bg-orange-500/15 hover:bg-orange-500/25 text-orange-400 border border-orange-500/30"
                    }`}
                  >
                    Enquire about this package →
                  </a>
                </div>
              </div>
            ))}
          </div>

          <p className="text-center text-gray-500 text-xs mt-6">
            All prices in GBP. Custom packages available for agencies and national brands —{" "}
            <a href={MAILTO} className="text-orange-400 hover:text-orange-300 underline">
              contact us to discuss
            </a>
            .
          </p>
        </div>
      </section>

      {/* ── EXAMPLE PLACEMENTS ────────────────────────────────────────────── */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <div className="inline-block w-12 h-1 bg-orange-500 rounded-full mb-4" />
            <h2 className="text-3xl md:text-4xl font-black mb-3">Where Your Brand Appears</h2>
            <p className="text-gray-400">
              Sponsor banners are native, non-intrusive and always visible.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {PLACEMENTS.map((pl) => (
              <div
                key={pl.id}
                className="bg-gray-900 border border-white/10 rounded-2xl p-5 hover:border-orange-500/25 transition-colors"
              >
                {/* Mock banner preview */}
                <div className="rounded-xl overflow-hidden border border-white/8 mb-4 bg-[#111118]">
                  <div className="h-[2px] w-full bg-gradient-to-r from-orange-500 via-orange-400 to-yellow-500" />
                  <div className="px-4 py-3 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-lg flex-shrink-0">
                      {pl.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-orange-400 text-[10px] font-black uppercase tracking-widest leading-none mb-0.5">
                        Sponsored
                      </p>
                      <p className="text-white font-bold text-sm truncate">Your Brand Name Here</p>
                      <p className="text-gray-500 text-xs truncate">Your tagline or offer text</p>
                    </div>
                    <span className="flex-shrink-0 px-2.5 py-1.5 rounded-lg bg-orange-500 text-white text-[11px] font-bold whitespace-nowrap">
                      Learn More
                    </span>
                  </div>
                </div>

                {/* Placement info */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-white font-bold text-sm">{pl.label}</h3>
                    <p className="text-gray-400 text-xs mt-1 leading-relaxed">{pl.desc}</p>
                  </div>
                  <span className="flex-shrink-0 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-orange-500/10 text-orange-400 border border-orange-500/20 whitespace-nowrap">
                    {pl.reach}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CONTACT / ENQUIRY ─────────────────────────────────────────────── */}
      <section
        id="contact"
        className="py-20 px-4 relative overflow-hidden"
      >
        <div className="max-w-2xl mx-auto text-center">
          <div className="inline-block w-12 h-1 bg-orange-500 rounded-full mb-6" />
          <h2 className="text-3xl md:text-4xl font-black mb-4">Ready to reach World Cup fans?</h2>
          <p className="text-gray-400 text-base leading-relaxed mb-8">
            Send us an email and we&apos;ll get back to you within 24 hours with a tailored proposal.
            No commitment needed.
          </p>

          {/* Contact card */}
          <div className="bg-gray-900 border border-white/10 rounded-2xl p-6 md:p-8 mb-8 text-left">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-400 flex-shrink-0 text-sm">
                  📧
                </span>
                <div>
                  <p className="text-gray-500 text-xs">Email us directly</p>
                  <a
                    href={MAILTO}
                    className="text-orange-400 font-semibold text-sm hover:text-orange-300 transition-colors break-all"
                  >
                    {CONTACT_EMAIL}
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-400 flex-shrink-0 text-sm">
                  💬
                </span>
                <div>
                  <p className="text-gray-500 text-xs">What to include</p>
                  <p className="text-gray-300 text-sm mt-0.5">
                    Your company name, website, the placement you&apos;re interested in, and your
                    approximate budget. We&apos;ll reply with a custom proposal.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-400 flex-shrink-0 text-sm">
                  ⚡
                </span>
                <div>
                  <p className="text-gray-500 text-xs">Response time</p>
                  <p className="text-gray-300 text-sm">Within 24 hours</p>
                </div>
              </div>
            </div>
          </div>

          <a
            href={MAILTO}
            className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-400 text-white font-bold rounded-xl px-8 py-4 transition-all active:scale-95 text-sm w-full sm:w-auto justify-center"
          >
            📩 Send Sponsorship Enquiry
          </a>

          <p className="text-gray-600 text-xs mt-4">
            No payments or contracts online — we handle everything via email.
          </p>
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────────────────────────────────── */}
      <footer className="border-t border-white/10 bg-[#0a0a0f] py-12">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-start justify-between gap-8">
          <div>
            <Link href="/" className="flex items-center gap-1 font-black text-xl tracking-tight mb-2">
              <span className="text-orange-500">⚡</span>
              <span className="text-orange-500">Fan</span>
              <span className="text-white">Rush</span>
            </Link>
            <p className="text-gray-500 text-xs max-w-xs leading-relaxed">
              The fan platform for World Cup 2026. Advertising enquiries:{" "}
              <a href={MAILTO} className="text-orange-400 hover:text-orange-300">
                {CONTACT_EMAIL}
              </a>
            </p>
          </div>
          <div className="flex gap-12">
            <div>
              <p className="text-white font-semibold text-sm mb-3">Platform</p>
              <div className="space-y-2">
                {[["Matches", "/matches"], ["Watch Parties", "/watch-parties"], ["Predictions", "/predictions"]].map(
                  ([l, h]) => (
                    <Link key={h} href={h} className="block text-gray-400 text-sm hover:text-white transition-colors">
                      {l}
                    </Link>
                  )
                )}
              </div>
            </div>
            <div>
              <p className="text-white font-semibold text-sm mb-3">Sponsorship</p>
              <div className="space-y-2">
                {[
                  ["Packages", "#packages"],
                  ["Placements", "#contact"],
                  ["Enquire", MAILTO],
                  ["Pricing", "/pricing"],
                ].map(([l, h]) => (
                  <a key={h} href={h} className="block text-gray-400 text-sm hover:text-white transition-colors">
                    {l}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="max-w-6xl mx-auto px-4 mt-8 pt-6 border-t border-white/10">
          <p className="text-gray-600 text-xs">
            © 2026 FanRush. All rights reserved. Not affiliated with FIFA or any official tournament
            organiser.
          </p>
        </div>
      </footer>

    </div>
  )
}
