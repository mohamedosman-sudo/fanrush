import AppShell from "@/components/AppShell"

function Section({ num, title, children }: { num: number; title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3 border-t border-white/5 pt-6">
      <h2 className="text-white font-black text-base flex items-center gap-3">
        <span className="text-orange-500">{num}.</span> {title}
      </h2>
      <div className="text-gray-300 text-sm leading-relaxed space-y-3">{children}</div>
    </section>
  )
}

export default function DisclaimerPage() {
  return (
    <AppShell title="Disclaimer" showBottomNav={false}>
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">

        {/* HERO */}
        <div className="space-y-1">
          <h1 className="font-black text-3xl text-white">Legal Disclaimer</h1>
          <p className="text-gray-500 text-sm">Last updated: January 2026</p>
        </div>

        {/* PROMINENT DISCLAIMER BOX */}
        <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-2xl p-5 space-y-2">
          <h2 className="text-yellow-400 font-black text-base">
            ⚠️ Independent Platform Disclaimer
          </h2>
          <p className="text-gray-300 text-sm leading-relaxed">
            FanRush is an independent fan platform and is not affiliated with, endorsed by, or in
            any way connected to FIFA, the 2026 FIFA World Cup™ Organising Committee, CONCACAF, or
            any official tournament organiser, national football association, or club.
          </p>
        </div>

        {/* SECTIONS */}
        <Section num={1} title="Independence Statement">
          <p>
            FanRush operates as an independent third-party platform designed to enhance the fan
            experience around major football tournaments. The name &quot;FanRush&quot;, any logos,
            and associated branding are original works and are not derived from, nor intended to
            suggest affiliation with, any official tournament brand or governing body.
          </p>
          <p>
            References to &quot;World Cup 2026&quot;, &quot;FIFA World Cup&quot;, or related
            trademarks on this platform are used for descriptive and nominative purposes only, and
            do not imply sponsorship, endorsement, or official status of any kind.
          </p>
        </Section>

        <Section num={2} title="No FIFA or Tournament Affiliation">
          <p>
            FanRush has no commercial, contractual, or operational relationship with FIFA, the FIFA
            World Cup 2026™ Host Countries (United States of America, Canada, and Mexico), their
            respective football associations, or any official tournament organiser.
          </p>
          <p>
            FanRush does not sell, resell, or facilitate the purchase of official match tickets to
            the FIFA World Cup 2026™. Any links to ticket platforms on this site are provided for
            informational purposes only. Official match tickets are only available through
            FIFA&apos;s authorised channels.
          </p>
        </Section>

        <Section num={3} title="User-Generated Content">
          <p>
            Venue listings, watch party details, events, and related content on FanRush are
            submitted by independent business owners, operators, and fans. FanRush does not verify
            the accuracy, completeness, or legality of user-generated or business-submitted content.
          </p>
          <p>
            FanRush makes no warranties, express or implied, regarding the accuracy of venue
            information, event listings, operating hours, pricing, or availability. Users should
            confirm details directly with venues before attending any event.
          </p>
          <p>
            FanRush reserves the right to remove any listing or content that violates its community
            standards or these terms.
          </p>
        </Section>

        <Section num={4} title="Prediction Game Disclaimer">
          <p>
            The FanRush Prediction League is provided for entertainment purposes only. It is a
            free-to-play game in which users predict match scores and earn points. No real money,
            financial instruments, or prizes of monetary value are wagered or awarded through the
            prediction game by FanRush.
          </p>
          <p>
            The prediction game does not constitute gambling, betting, or any regulated financial
            activity. FanRush is not a licensed gambling operator and does not accept stakes of any
            kind. Users must not rely on FanRush predictions for gambling purposes.
          </p>
          <p>
            Any sponsored prizes offered through affiliated private leagues are at the sole
            discretion of the sponsoring party and are subject to their separate terms and
            conditions. FanRush accepts no liability for sponsored prize fulfilment.
          </p>
        </Section>

        <Section num={5} title="Business Listing Disclaimer">
          <p>
            Businesses that list on FanRush do so subject to FanRush&apos;s listing policies.
            FanRush does not endorse any particular venue, business, or service. A &quot;featured&quot;
            or &quot;sponsored&quot; badge indicates that a business has paid for promotional
            placement and does not constitute a quality endorsement by FanRush.
          </p>
          <p>
            FanRush accepts no responsibility for the quality of service, safety conditions,
            licensing compliance, or any other aspect of any listed venue or business. Fans attend
            events and visit venues entirely at their own risk.
          </p>
        </Section>

        <Section num={6} title="Affiliate Links & Commercial Relationships">
          <p>
            Some links on FanRush — particularly in the Matchday Deals section — are affiliate
            links. FanRush may earn a commission if you make a purchase through these links, at no
            extra cost to you. Affiliate relationships do not influence editorial decisions about
            which deals or venues are featured.
          </p>
        </Section>

        <Section num={7} title="Limitation of Liability">
          <p>
            To the fullest extent permitted by applicable law, FanRush, its directors, employees,
            and affiliates shall not be liable for any indirect, incidental, special, consequential,
            or punitive damages arising from your use of this platform, including but not limited to
            reliance on venue listings, event information, prediction results, or affiliate links.
          </p>
        </Section>

        {/* CONTACT */}
        <section className="border-t border-white/5 pt-6 space-y-3 pb-4">
          <p className="text-xs font-black uppercase tracking-widest text-gray-500">Contact</p>
          <p className="text-gray-300 text-sm leading-relaxed">
            If you have questions about this disclaimer, or wish to report content you believe
            violates these terms, please contact us:
          </p>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-gray-500">Legal:</span>
              <a href="mailto:legal@fanrush.com" className="text-orange-500 hover:underline">
                legal@fanrush.com
              </a>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-500">General:</span>
              <a href="mailto:hello@fanrush.com" className="text-orange-500 hover:underline">
                hello@fanrush.com
              </a>
            </div>
          </div>
        </section>

      </div>
    </AppShell>
  )
}
