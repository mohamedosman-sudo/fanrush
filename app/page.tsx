import Link from "next/link"
import { mockVenues } from "@/lib/mock-data"
import VenueCard from "@/components/VenueCard"
import AuthNav from "@/components/AuthNav"

const featuredVenues = mockVenues
  .filter((v) => v.status === "approved" && v.featured)
  .slice(0, 3)

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* ── HEADER ──────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-[#0a0a0f]/90 backdrop-blur-md border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-1 font-black text-2xl tracking-tight">
            <span className="text-orange-500">⚡</span>
            <span className="text-orange-500">Fan</span>
            <span className="text-white">Rush</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-7">
            {[
              ["Matches", "/matches"],
              ["Watch Parties", "/watch-parties"],
              ["Predictions", "/predictions"],
              ["Business", "/business"],
              ["Pricing", "/pricing"],
              ["Advertise", "/advertise"],
            ].map(([label, href]) => (
              <Link
                key={href}
                href={href}
                className="text-gray-400 hover:text-white text-sm font-medium transition-colors"
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* Auth nav — shows Log in / Create Account when logged out,
               Account / Log out when logged in */}
          <AuthNav />
        </div>
      </header>

      {/* ── HERO ────────────────────────────────────────────────────────── */}
      <section
        className="relative min-h-screen flex flex-col items-center justify-center text-center px-4 overflow-hidden"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(249,115,22,0.12) 0%, transparent 70%), #0a0a0f",
        }}
      >
        {/* Floating badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-400 text-xs font-semibold mb-8">
          🏆 World Cup 2026 · USA · Canada · Mexico
        </div>

        {/* Headline */}
        <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-none mb-6">
          <span className="block text-white">Your World Cup.</span>
          <span className="block bg-gradient-to-r from-orange-400 to-yellow-400 bg-clip-text text-transparent">
            Rush Starts Here.
          </span>
        </h1>

        <p className="text-gray-400 text-lg max-w-xl mx-auto mb-10 leading-relaxed">
          Find watch parties near you, predict match scores, earn points, and make every matchday
          unforgettable with fellow fans.
        </p>

        {/* CTA row */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
          <Link
            href="/matches"
            className="bg-orange-500 hover:bg-orange-400 text-white font-bold rounded-xl px-6 py-3 transition-all active:scale-95"
          >
            🏟️ Explore Matches
          </Link>
          <Link
            href="/watch-parties"
            className="bg-white/10 hover:bg-white/15 text-white font-semibold rounded-xl px-6 py-3 transition-all"
          >
            🍺 Find Watch Parties
          </Link>
          <Link
            href="/business"
            className="border border-white/20 hover:border-orange-500/50 hover:text-orange-400 text-white font-semibold rounded-xl px-6 py-3 transition-all"
          >
            List Your Venue
          </Link>
        </div>

        {/* Social proof */}
        <p className="text-gray-500 text-sm">World Cup 2026 · 8 host cities · Free for fans</p>

        {/* Phone mockup */}
        <div className="mt-16 relative">
          <div className="w-56 bg-gray-900 border border-white/10 rounded-3xl p-4 shadow-2xl shadow-orange-500/5 mx-auto">
            <div className="text-xs text-gray-500 mb-3 font-medium">Tonight&apos;s Rush</div>
            <div className="bg-[#12121a] border border-white/10 rounded-xl p-3 mb-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm">🇺🇸 USA</span>
                <span className="text-orange-400 font-black text-sm">vs</span>
                <span className="text-sm">🇲🇽 MEX</span>
              </div>
              <div className="text-gray-500 text-xs text-center">MetLife Stadium · 18:00</div>
            </div>
            <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-2 text-center">
              <div className="text-orange-400 text-xs font-semibold">12 watch parties nearby</div>
            </div>
          </div>
          {/* Glow */}
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-10 blur-3xl opacity-20"
            style={{ background: "radial-gradient(circle, rgba(249,115,22,0.6) 0%, transparent 70%)" }}
          />
        </div>
      </section>

      {/* ── HOW IT WORKS ────────────────────────────────────────────────── */}
      <section className="py-24 bg-[#0a0a0f]">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-14">
            <div className="inline-block w-12 h-1 bg-orange-500 rounded-full mb-4" />
            <h2 className="text-3xl md:text-4xl font-black mb-3">How FanRush Works</h2>
            <p className="text-gray-400">Four simple steps to the perfect matchday</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                icon: "🎯",
                step: "01",
                title: "Pick Your Teams",
                desc: "Follow your nation and set personalised match alerts",
              },
              {
                icon: "📍",
                step: "02",
                title: "Find Watch Parties",
                desc: "Discover the best venues near you for every match",
              },
              {
                icon: "🏆",
                step: "03",
                title: "Predict & Compete",
                desc: "Score predictions, earn points, climb the leaderboard",
              },
              {
                icon: "🎟️",
                step: "04",
                title: "Exclusive Deals",
                desc: "Matchday discounts from partner venues and brands",
              },
            ].map((item) => (
              <div
                key={item.step}
                className="bg-gray-900 border border-white/10 rounded-2xl p-6 hover:border-orange-500/30 transition-colors"
              >
                <div className="text-3xl mb-3">{item.icon}</div>
                <div className="text-orange-500 text-xs font-black mb-2 tracking-widest">
                  STEP {item.step}
                </div>
                <h3 className="text-white font-bold text-base mb-2">{item.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOR FANS ────────────────────────────────────────────────────── */}
      <section className="py-24 bg-[#12121a]">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-14">
            <div className="inline-block w-12 h-1 bg-orange-500 rounded-full mb-4" />
            <h2 className="text-3xl md:text-4xl font-black mb-3">Built for Fans</h2>
            <p className="text-gray-400">Everything you need for an epic World Cup experience</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: "📱",
                title: "Personalised Feed",
                desc: "Tailored match schedules, alerts, and content based on the teams you love and your city.",
                bullets: ["Team-specific alerts", "City-based venues", "Custom predictions feed"],
              },
              {
                icon: "🗺️",
                title: "Venue Discovery",
                desc: "Browse watch parties across 8 host cities. Filter by vibe, price, and capacity.",
                bullets: ["Free & ticketed options", "Ratings & reviews", "One-tap directions"],
              },
              {
                icon: "🎮",
                title: "Prediction Game",
                desc: "Compete for points on every match. Create private leagues with friends or join the global table.",
                bullets: ["5pts for exact score", "2pts correct result", "Private leagues"],
              },
            ].map((card) => (
              <div
                key={card.title}
                className="bg-gray-900 border border-white/10 rounded-2xl p-6 hover:border-orange-500/20 transition-colors"
              >
                <div className="text-4xl mb-4">{card.icon}</div>
                <h3 className="text-white font-bold text-lg mb-2">{card.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed mb-4">{card.desc}</p>
                <ul className="space-y-2">
                  {card.bullets.map((b) => (
                    <li key={b} className="flex items-center gap-2 text-sm text-gray-300">
                      <span className="text-orange-500 font-bold">✓</span> {b}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED WATCH PARTIES ──────────────────────────────────────── */}
      <section className="py-24 bg-[#0a0a0f]">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-end justify-between mb-10">
            <div>
              <div className="inline-block w-12 h-1 bg-orange-500 rounded-full mb-4" />
              <h2 className="text-3xl md:text-4xl font-black mb-1">Featured Watch Parties</h2>
              <p className="text-gray-400">Top venues for World Cup 2026</p>
            </div>
            <Link
              href="/watch-parties"
              className="text-orange-400 hover:text-orange-300 text-sm font-semibold transition-colors"
            >
              See all →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredVenues.map((venue) => (
              <VenueCard key={venue.id} venue={venue} />
            ))}
          </div>
          <div className="text-center mt-10">
            <Link
              href="/watch-parties"
              className="bg-white/10 hover:bg-white/15 text-white font-semibold rounded-xl px-8 py-3 transition-all inline-block"
            >
              See All Watch Parties
            </Link>
          </div>
        </div>
      </section>

      {/* ── PREDICTION GAME ─────────────────────────────────────────────── */}
      <section
        className="py-24 relative overflow-hidden"
        style={{
          background:
            "radial-gradient(ellipse 60% 80% at 100% 50%, rgba(249,115,22,0.08) 0%, transparent 60%), #0f0f16",
        }}
      >
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-14 items-center">
            {/* Left: copy */}
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-yellow-400/10 border border-yellow-400/20 text-yellow-400 text-xs font-semibold mb-6">
                🏆 Free to Play
              </div>
              <h2 className="text-3xl md:text-4xl font-black mb-4">
                Prediction League —{" "}
                <span className="bg-gradient-to-r from-orange-400 to-yellow-400 bg-clip-text text-transparent">
                  Can you call it?
                </span>
              </h2>
              <p className="text-gray-400 text-base leading-relaxed mb-6">
                Predict the score of every World Cup match, earn points, and compete on the global
                leaderboard. Create private leagues with friends or enter sponsored prize leagues.
              </p>

              {/* Scoring */}
              <div className="flex gap-4 mb-8">
                {[
                  { pts: "5pts", label: "Exact score" },
                  { pts: "2pts", label: "Correct result" },
                  { pts: "0pts", label: "Wrong" },
                ].map((s) => (
                  <div key={s.label} className="bg-gray-900 border border-white/10 rounded-xl p-4 text-center flex-1">
                    <div className="text-orange-400 font-black text-lg">{s.pts}</div>
                    <div className="text-gray-500 text-xs mt-0.5">{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Leaderboard preview */}
              <div className="bg-gray-900 border border-white/10 rounded-2xl overflow-hidden mb-8">
                <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
                  <span className="text-white font-bold text-sm">Global Leaderboard</span>
                  <span className="text-gray-500 text-xs">Early access standings</span>
                </div>
                {[
                  { rank: "🥇", name: "Alex Rivera", pts: "87 pts", city: "New York" },
                  { rank: "🥈", name: "Carlos Mendez", pts: "74 pts", city: "Dallas" },
                  { rank: "🥉", name: "Liam O'Brien", pts: "68 pts", city: "Toronto" },
                ].map((row) => (
                  <div
                    key={row.name}
                    className="px-4 py-3 flex items-center gap-3 border-b border-white/5 last:border-0"
                  >
                    <span className="text-lg w-6">{row.rank}</span>
                    <div className="flex-1">
                      <div className="text-white text-sm font-semibold">{row.name}</div>
                      <div className="text-gray-500 text-xs">{row.city}</div>
                    </div>
                    <span className="text-orange-400 font-bold text-sm">{row.pts}</span>
                  </div>
                ))}
              </div>

              <Link
                href="/predictions"
                className="bg-orange-500 hover:bg-orange-400 text-white font-bold rounded-xl px-6 py-3 transition-all active:scale-95 inline-block"
              >
                🎯 Join the Prediction Game
              </Link>
            </div>

            {/* Right: stats */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { v: "64", l: "Matches" },
                { v: "8", l: "Host Cities" },
                { v: "1000+", l: "Fan Zones" },
                { v: "Free", l: "to Play" },
              ].map((s) => (
                <div
                  key={s.l}
                  className="bg-gray-900 border border-white/10 rounded-2xl p-8 text-center"
                >
                  <div className="text-4xl font-black text-orange-400 mb-2">{s.v}</div>
                  <div className="text-gray-400 text-sm">{s.l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── FOR BUSINESSES ──────────────────────────────────────────────── */}
      <section className="py-24 bg-[#0a0a0f]">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-14 items-start">
            {/* Left: benefits */}
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-semibold mb-6">
                🏪 For Businesses
              </div>
              <h2 className="text-3xl md:text-4xl font-black mb-4">
                Reach Match-Day Fans
              </h2>
              <p className="text-gray-400 text-base leading-relaxed mb-8">
                List your venue, bar, or fan zone on FanRush and get discovered by passionate football
                fans searching for the perfect place to watch the World Cup.
              </p>
              <ul className="space-y-4 mb-10">
                {[
                  "Reach fans searching by city and match",
                  "Featured venue listings",
                  "Real-time analytics dashboard",
                  "Boost your booking rate",
                  "Matchday deals & promotions",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-gray-300 text-sm">
                    <span className="w-5 h-5 bg-orange-500/20 border border-orange-500/30 rounded-full flex items-center justify-center text-orange-400 text-xs font-bold flex-shrink-0">
                      ✓
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                href="/business/add-venue"
                className="bg-orange-500 hover:bg-orange-400 text-white font-bold rounded-xl px-6 py-3 transition-all active:scale-95 inline-block"
              >
                List Your Venue Free →
              </Link>
            </div>

            {/* Right: pricing tiers */}
            <div className="bg-gray-900 border border-white/10 rounded-2xl overflow-hidden">
              <div className="px-6 py-5 border-b border-white/10">
                <h3 className="text-white font-bold">Venue Plans</h3>
                <p className="text-gray-500 text-sm">Choose the plan that fits your venue</p>
              </div>
              {[
                {
                  tier: "Free",
                  price: "$0",
                  color: "text-emerald-400",
                  bg: "bg-emerald-400/10",
                  border: "border-emerald-400/20",
                  features: ["Basic listing", "Venue profile", "Match schedule link"],
                },
                {
                  tier: "Featured",
                  price: "$49/mo",
                  color: "text-orange-400",
                  bg: "bg-orange-500/10",
                  border: "border-orange-500/20",
                  features: ["Priority placement", "Featured badge", "Booking integration"],
                },
                {
                  tier: "Premium",
                  price: "$129/mo",
                  color: "text-yellow-400",
                  bg: "bg-yellow-400/10",
                  border: "border-yellow-400/20",
                  features: ["Everything in Featured", "Analytics dashboard", "Matchday deals"],
                },
              ].map((plan) => (
                <div key={plan.tier} className="px-6 py-5 border-b border-white/10 last:border-0">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded-md text-xs font-bold ${plan.bg} ${plan.border} border ${plan.color}`}
                      >
                        {plan.tier}
                      </span>
                    </div>
                    <span className={`${plan.color} font-black`}>{plan.price}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {plan.features.map((f) => (
                      <span
                        key={f}
                        className="text-gray-400 text-xs bg-white/5 rounded-lg px-2 py-1"
                      >
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── REVENUE / MONETISATION ──────────────────────────────────────── */}
      <section className="py-24 bg-[#12121a]">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-14">
            <div className="inline-block w-12 h-1 bg-orange-500 rounded-full mb-4" />
            <h2 className="text-3xl md:text-4xl font-black mb-3">Advertising & Sponsorship</h2>
            <p className="text-gray-400">
              Partner with FanRush to reach a passionate, engaged football audience
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                icon: "⭐",
                title: "Featured Listings",
                desc: "Boost your venue to the top of search results with a featured badge and priority placement.",
              },
              {
                icon: "📣",
                title: "City Sponsorships",
                desc: "Own a city or match page. Your brand front and centre for fans exploring that fixture or destination.",
              },
              {
                icon: "🔥",
                title: "Matchday Deals",
                desc: "Promote exclusive discounts to fans in your city on match days. Drive footfall and bookings.",
              },
              {
                icon: "📺",
                title: "Advertising Slots",
                desc: "Banner and in-app placements across the FanRush platform. Targeted by city, team, and interest.",
              },
            ].map((card) => (
              <div
                key={card.title}
                className="bg-gray-900 border border-white/10 rounded-2xl p-6 hover:border-orange-500/20 transition-colors group"
              >
                <div className="text-3xl mb-4">{card.icon}</div>
                <h3 className="text-white font-bold mb-2">{card.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed mb-4">{card.desc}</p>
                <Link
                  href="/pricing"
                  className="text-orange-400 hover:text-orange-300 text-sm font-semibold transition-colors"
                >
                  Learn more →
                </Link>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link
              href="/pricing"
              className="border border-orange-500/40 hover:border-orange-500 text-orange-400 hover:text-orange-300 font-bold rounded-xl px-8 py-3 transition-all inline-block"
            >
              View All Pricing →
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────────────────── */}
      <footer className="border-t border-white/10 bg-[#0a0a0f] py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-start justify-between gap-12 mb-12">
            {/* Brand */}
            <div className="max-w-xs">
              <Link href="/" className="flex items-center gap-1 font-black text-2xl tracking-tight mb-3">
                <span className="text-orange-500">⚡</span>
                <span className="text-orange-500">Fan</span>
                <span className="text-white">Rush</span>
              </Link>
              <p className="text-gray-400 text-sm leading-relaxed">
                The fan platform for World Cup 2026. Find watch parties, predict scores, and connect
                with fans everywhere.
              </p>
            </div>

            {/* Links */}
            <div className="flex gap-16">
              <div>
                <div className="text-white font-semibold text-sm mb-4">Platform</div>
                <div className="space-y-3">
                  {[
                    ["Matches", "/matches"],
                    ["Watch Parties", "/watch-parties"],
                    ["Predictions", "/predictions"],
                  ].map(([l, h]) => (
                    <Link key={h} href={h} className="block text-gray-400 text-sm hover:text-white transition-colors">
                      {l}
                    </Link>
                  ))}
                </div>
              </div>
              <div>
                <div className="text-white font-semibold text-sm mb-4">Company</div>
                <div className="space-y-3">
                  {[
                    ["About", "/about"],
                    ["Pricing", "/pricing"],
                    ["Advertise", "/advertise"],
                    ["Business", "/business"],
                    ["Legal", "/legal"],
                    ["Disclaimer", "/legal/disclaimer"],
                  ].map(([l, h]) => (
                    <Link key={h} href={h} className="block text-gray-400 text-sm hover:text-white transition-colors">
                      {l}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-white/10 pt-8 space-y-2">
            <p className="text-gray-500 text-xs">
              FanRush is an independent fan platform and is not affiliated with FIFA or any official
              tournament organiser.
            </p>
            <p className="text-gray-600 text-xs">© 2026 FanRush. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
