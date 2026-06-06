import Link from "next/link"
import AppShell from "@/components/AppShell"

export default function AboutPage() {
  return (
    <AppShell title="About FanRush" showBottomNav={false}>
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-10">

        {/* HERO */}
        <section className="text-center space-y-3">
          <h1 className="font-black text-3xl text-white">About FanRush</h1>
          <p className="text-gray-400 max-w-xl mx-auto leading-relaxed">
            Built by fans, for fans — the ultimate companion for World Cup 2026. We connect
            football lovers with the best matchday experiences across host cities.
          </p>
        </section>

        {/* MISSION CARDS */}
        <section className="space-y-4">
          <p className="text-xs font-black uppercase tracking-widest text-gray-500">Our Mission</p>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              {
                icon: "⚽",
                title: "For Fans",
                desc: "Discover watch parties, predict scores, follow your teams, and plan your World Cup calendar in one place.",
              },
              {
                icon: "🏟️",
                title: "For Venues",
                desc: "List your pub, bar, or fan zone, promote events, and get discovered by thousands of football fans.",
              },
              {
                icon: "🌍",
                title: "For the Community",
                desc: "Unite fans across all 8 host cities and beyond — whether you're local or travelling thousands of miles.",
              },
            ].map((card) => (
              <div
                key={card.title}
                className="bg-gray-900 border border-white/10 rounded-2xl p-5 space-y-3"
              >
                <div className="text-3xl">{card.icon}</div>
                <h3 className="text-white font-black text-base">{card.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{card.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="space-y-4">
          <p className="text-xs font-black uppercase tracking-widest text-gray-500">How It Works</p>
          <div className="space-y-3">
            {[
              "Browse matches and find watch parties happening near you or in host cities.",
              "Filter venues by city, capacity, atmosphere, and match day offers.",
              "Save your favourite spots and build your World Cup calendar.",
              "Join the free prediction league and compete against fans worldwide.",
            ].map((step, i) => (
              <div
                key={i}
                className="bg-gray-900 border border-white/10 rounded-2xl p-4 flex items-start gap-4"
              >
                <span className="text-orange-500 font-black text-lg leading-none mt-0.5 w-6 flex-shrink-0">
                  {i + 1}
                </span>
                <p className="text-gray-300 text-sm leading-relaxed">{step}</p>
              </div>
            ))}
          </div>
        </section>

        {/* THE VISION */}
        <section className="space-y-4">
          <p className="text-xs font-black uppercase tracking-widest text-gray-500">The Vision</p>
          <div className="bg-gray-900 border border-white/10 rounded-2xl p-5 space-y-3 text-gray-300 text-sm leading-relaxed">
            <p>
              We believe the World Cup is the greatest sporting event on Earth — and that the fan
              experience around it should match that. FanRush is being built to be the go-to
              platform for the 2026 tournament.
            </p>
            <p>
              From the opening group stage to the final, we want to be in your pocket — helping
              you find the best places to watch, the best people to watch with, and the most fun
              ways to engage with the beautiful game.
            </p>
          </div>
        </section>

        {/* DISCLAIMER */}
        <section>
          <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-2xl p-5 space-y-2">
            <h2 className="text-yellow-400 font-black text-base">
              ⚠️ Independent Platform Disclaimer
            </h2>
            <p className="text-gray-300 text-sm leading-relaxed">
              FanRush is an independent fan platform and is not affiliated with FIFA or any
              official tournament organiser. All venue listings and events are submitted by
              independent businesses and fans. The prediction game is for entertainment purposes
              only and does not constitute gambling.
            </p>
            <Link
              href="/legal/disclaimer"
              className="inline-block text-orange-500 text-sm hover:underline"
            >
              Read full disclaimer →
            </Link>
          </div>
        </section>

        {/* CONTACT */}
        <section className="space-y-4 pb-4">
          <p className="text-xs font-black uppercase tracking-widest text-gray-500">Get in Touch</p>
          <div className="bg-gray-900 border border-white/10 rounded-2xl p-5 space-y-3">
            <p className="text-gray-400 text-sm">
              Questions, feedback, or partnership enquiries? We&apos;d love to hear from you.
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-gray-500">General:</span>
                <a href="mailto:hello@fanrush.com" className="text-orange-500 hover:underline">
                  hello@fanrush.com
                </a>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-500">Business:</span>
                <a href="mailto:business@fanrush.com" className="text-orange-500 hover:underline">
                  business@fanrush.com
                </a>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-500">Press:</span>
                <a href="mailto:press@fanrush.com" className="text-orange-500 hover:underline">
                  press@fanrush.com
                </a>
              </div>
            </div>
            <div className="flex items-center gap-4 pt-1">
              <span className="text-gray-500 text-xs font-black uppercase tracking-widest">Follow</span>
              <a href="#" className="text-gray-400 text-sm hover:text-white transition-colors">Twitter / X</a>
              <a href="#" className="text-gray-400 text-sm hover:text-white transition-colors">Instagram</a>
              <a href="#" className="text-gray-400 text-sm hover:text-white transition-colors">TikTok</a>
            </div>
          </div>
        </section>

      </div>
    </AppShell>
  )
}
