"use client"

import { useState } from "react"
import Link from "next/link"
import AppShell from "@/components/AppShell"

function Check({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2 text-gray-300 text-sm">
      <span className="text-orange-500 font-black mt-0.5 flex-shrink-0">✓</span>
      {children}
    </li>
  )
}

function Cross({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2 text-gray-600 text-sm">
      <span className="font-black mt-0.5 flex-shrink-0">✗</span>
      {children}
    </li>
  )
}

const FAQS = [
  {
    q: "Is the free listing really free?",
    a: "Yes, completely. No credit card required. You can list your venue, add events, and start appearing in fan searches at zero cost.",
  },
  {
    q: "How long do paid plans run?",
    a: "Plans are monthly. You can cancel anytime. We also offer tournament-long packages at a discounted rate — contact us for details.",
  },
  {
    q: "Can I list multiple venues on one account?",
    a: "Yes. Business accounts support multiple venue listings. Enterprise plans include centralised multi-venue management.",
  },
  {
    q: "Are prices inclusive of VAT?",
    a: "All prices shown are exclusive of VAT (or applicable local taxes). VAT will be added at checkout where applicable.",
  },
]

export default function PricingPage() {
  const [annual, setAnnual] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  return (
    <AppShell title="Pricing" showBottomNav={false}>
      <div className="max-w-4xl mx-auto px-4 py-8 pb-[calc(3rem+env(safe-area-inset-bottom))] space-y-12">

        {/* HERO */}
        <section className="text-center space-y-3">
          <h1 className="font-black text-3xl text-white">Simple, Transparent Pricing</h1>
          <p className="text-gray-400 max-w-xl mx-auto leading-relaxed">
            Get your venue in front of thousands of football fans during World Cup 2026. Start
            free, upgrade when you&apos;re ready.
          </p>
        </section>

        {/* TOGGLE */}
        <div className="flex items-center justify-center gap-3">
          <span className={`text-sm font-bold ${!annual ? "text-white" : "text-gray-500"}`}>Monthly</span>
          <button
            onClick={() => setAnnual((v) => !v)}
            className={`relative w-12 h-6 rounded-full transition-colors ${
              annual ? "bg-orange-500" : "bg-gray-700"
            }`}
          >
            <span
              className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                annual ? "translate-x-6" : "translate-x-0"
              }`}
            />
          </button>
          <span className={`text-sm font-bold ${annual ? "text-white" : "text-gray-500"}`}>
            Annual <span className="text-orange-500 text-xs">Save 20%</span>
          </span>
        </div>

        {/* PRICING CARDS */}
        <section className="space-y-4">
          <p className="text-xs font-black uppercase tracking-widest text-gray-500">Venue Listing Plans</p>
          <div className="grid md:grid-cols-3 gap-5">

            {/* Free */}
            <div className="bg-gray-900 border border-white/10 rounded-2xl p-6 flex flex-col">
              <div className="mb-1">
                <span className="text-xs font-black uppercase tracking-widest text-gray-500">Free</span>
              </div>
              <div className="text-white font-black text-4xl mb-0.5">£0</div>
              <p className="text-gray-500 text-xs mb-1">Free forever</p>
              <p className="text-gray-400 text-sm mb-5 leading-relaxed">
                Get your venue on the map with zero commitment.
              </p>
              <ul className="space-y-2 flex-1 mb-6">
                <Check>Basic venue listing</Check>
                <Check>Match-day event creation</Check>
                <Check>City page placement</Check>
                <Check>Fan saves &amp; shares</Check>
                <Cross>Featured badge</Cross>
                <Cross>Analytics dashboard</Cross>
                <Cross>Boosted search visibility</Cross>
              </ul>
              <Link
                href="/business/add-venue"
                className="block text-center py-2.5 rounded-xl border border-white/10 text-white hover:border-orange-500 hover:text-orange-500 text-sm font-bold transition-colors"
              >
                Get Started Free
              </Link>
            </div>

            {/* Featured — highlighted */}
            <div className="bg-gray-900 border-2 border-orange-500 rounded-2xl p-6 flex flex-col relative shadow-[0_0_30px_rgba(249,115,22,0.15)]">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-orange-500 text-black text-xs font-black whitespace-nowrap">
                Most Popular
              </div>
              <div className="mb-1">
                <span className="text-xs font-black uppercase tracking-widest text-orange-500">Featured</span>
              </div>
              <div className="text-white font-black text-4xl mb-0.5">
                £{annual ? "39" : "49"}
              </div>
              <p className="text-gray-500 text-xs mb-1">per month</p>
              <p className="text-gray-400 text-sm mb-5 leading-relaxed">
                Stand out with boosted placement and a featured badge.
              </p>
              <ul className="space-y-2 flex-1 mb-6">
                <Check>Everything in Free</Check>
                <Check>Featured badge</Check>
                <Check>Boosted search visibility</Check>
                <Check>Analytics dashboard</Check>
                <Check>Monthly performance report</Check>
                <Check>1 matchday deal promotion</Check>
                <Cross>Sponsored content</Cross>
                <Cross>Priority support</Cross>
              </ul>
              <Link
                href="/business/add-venue"
                className="block text-center py-2.5 rounded-xl bg-orange-500 hover:bg-orange-400 text-black text-sm font-bold transition-colors"
              >
                Start Featured
              </Link>
            </div>

            {/* Premium */}
            <div className="bg-gray-900 border border-white/10 rounded-2xl p-6 flex flex-col">
              <div className="mb-1">
                <span className="text-xs font-black uppercase tracking-widest text-gray-500">Premium</span>
              </div>
              <div className="text-white font-black text-4xl mb-0.5">
                £{annual ? "79" : "99"}
              </div>
              <p className="text-gray-500 text-xs mb-1">per month · Full Suite</p>
              <p className="text-gray-400 text-sm mb-5 leading-relaxed">
                Maximum visibility with sponsored content and full analytics.
              </p>
              <ul className="space-y-2 flex-1 mb-6">
                <Check>Everything in Featured</Check>
                <Check>Sponsored content placement</Check>
                <Check>Priority customer support</Check>
                <Check>Unlimited deal promotions</Check>
                <Check>City page sponsor slot</Check>
                <Check>Match page banner</Check>
                <Check>Dedicated account manager</Check>
              </ul>
              <Link
                href="/business/add-venue"
                className="block text-center py-2.5 rounded-xl border border-white/10 text-white hover:border-orange-500 hover:text-orange-500 text-sm font-bold transition-colors"
              >
                Go Premium
              </Link>
            </div>
          </div>
        </section>

        {/* ENTERPRISE */}
        <section>
          <div className="bg-gray-900 border border-white/10 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center gap-6">
            <div className="flex-1">
              <p className="text-xs font-black uppercase tracking-widest text-gray-500 mb-1">Enterprise</p>
              <h3 className="text-white font-black text-xl mb-2">Custom pricing for large venues and chains</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Multi-venue management, white-label options, tournament-wide campaigns, API access,
                and a dedicated partnership team.
              </p>
            </div>
            <a
              href="mailto:business@fanrush.com"
              className="flex-shrink-0 px-5 py-2.5 rounded-xl border border-white/10 text-white hover:border-orange-500 hover:text-orange-500 text-sm font-bold transition-colors whitespace-nowrap"
            >
              Contact Sales
            </a>
          </div>
        </section>

        {/* ADVERTISING PACKAGES */}
        <section className="space-y-4">
          <p className="text-xs font-black uppercase tracking-widest text-gray-500">Advertising Packages</p>
          <div className="grid md:grid-cols-3 gap-5">
            {[
              {
                icon: "📺",
                title: "Banner Ads",
                price: "From £299",
                desc: "Display ads across home feeds, match pages, and watch-party listings. Target by city, team, or interest.",
              },
              {
                icon: "📍",
                title: "City Sponsorship",
                price: "£799",
                desc: "Own a city page for the tournament. Your brand on every venue card and at the top of the city feed.",
                highlight: true,
              },
              {
                icon: "🏆",
                title: "League Sponsorship",
                price: "£1,499",
                desc: "Sponsor the FanRush Prediction League — leaderboard branding, sponsored badges, and tournament-wide reach.",
              },
            ].map((pkg) => (
              <div
                key={pkg.title}
                className={`bg-gray-900 rounded-2xl p-5 space-y-3 ${
                  pkg.highlight
                    ? "border border-orange-500/30"
                    : "border border-white/10"
                }`}
              >
                <div className="text-3xl">{pkg.icon}</div>
                <div>
                  <h3 className="text-white font-black text-base">{pkg.title}</h3>
                  <p className="text-orange-500 font-black text-xl">{pkg.price}</p>
                </div>
                <p className="text-gray-400 text-sm leading-relaxed">{pkg.desc}</p>
                <a
                  href="mailto:ads@fanrush.com"
                  className="inline-block text-orange-500 text-sm hover:underline font-bold"
                >
                  Enquire →
                </a>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="space-y-4">
          <p className="text-xs font-black uppercase tracking-widest text-gray-500">FAQ</p>
          <div className="space-y-2">
            {FAQS.map((faq, i) => (
              <div key={i} className="bg-gray-900 border border-white/10 rounded-2xl overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left"
                >
                  <span className="text-white font-bold text-sm">{faq.q}</span>
                  <span className="text-gray-500 ml-4 flex-shrink-0">
                    {openFaq === i ? "−" : "+"}
                  </span>
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-5">
                    <p className="text-gray-400 text-sm leading-relaxed">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="text-center space-y-4 pb-4">
          <h2 className="text-2xl font-black text-white">Start for free today</h2>
          <p className="text-gray-400 text-sm">
            Join venues already reaching World Cup fans on FanRush.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/business/add-venue"
              className="px-6 py-3 rounded-xl bg-orange-500 hover:bg-orange-400 text-black font-bold text-sm transition-colors"
            >
              List Your Venue Free
            </Link>
            <a
              href="mailto:business@fanrush.com"
              className="px-6 py-3 rounded-xl border border-white/10 text-white hover:border-orange-500 hover:text-orange-500 font-bold text-sm transition-colors"
            >
              Talk to Sales
            </a>
          </div>
        </section>

      </div>
    </AppShell>
  )
}
