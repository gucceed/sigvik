import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Sigvik för mäklare — BRF-underlag direkt från källan',
  description:
    'Ge dina köpare ett objektivt beslutsunderlag för BRF-ekonomi, avgiftstrend och underhållsrisk. Direkt från Bolagsverket och Boverket.',
};

export default function AgentPage() {
  return (
    <main className="min-h-screen">
      {/* Header */}
      <header className="w-full px-6 md:px-12 pt-8 pb-6 border-b border-rule">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <a href="/" className="font-display text-display-sm font-normal tracking-tight text-ink hover:text-accent transition-colors">
            Sigvik
          </a>
          <a href="/search" className="font-sans text-body-sm text-ink-soft hover:text-ink transition-colors">
            Sök föreningar →
          </a>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 md:px-12 py-14 md:py-20">

        {/* Hero */}
        <div className="max-w-3xl mb-16 md:mb-24">
          <span className="font-sans text-overline text-ink-muted uppercase block mb-4">För mäklare</span>
          <h1 className="font-display text-display-md md:text-display-lg font-normal tracking-tight text-ink mb-6">
            Köparen frågar om föreningen. Svara med källdata.
          </h1>
          <p className="font-display text-body-lg text-ink-soft leading-relaxed max-w-prose">
            Sigvik sammanfattar BRF-ekonomi, avgiftstrend, energiklass och
            underhållsrisk i ett format som är läsbart på fem sekunder — och
            delbart direkt från detaljsidan. Data har källhänvisning till
            Bolagsverket och Boverket. Du behöver inte förklara var du fick
            det ifrån.
          </p>
        </div>

        {/* Three use cases */}
        <section className="mb-16 md:mb-24">
          <h2 className="font-sans text-overline text-ink-muted uppercase mb-8">Tre sätt att använda Sigvik</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-rule">
            {[
              {
                title: 'Under visning',
                body: 'Slå upp föreningens BRF-sida på mobilen. Visa köparen avgiftstrend, energiklass och underhållssignal på plats. En sida, all relevant data.',
              },
              {
                title: 'I köparbrevet',
                body: 'Kopiera länken från BRF-sidans delningsknapp och bifoga i kommunikationen med köparen. Sidan är alltid uppdaterad — du skickar aldrig gammal PDF.',
              },
              {
                title: 'I budgivningen',
                body: 'En förening med hög underhållssignal kan motivera ett lägre bud eller en villkorsklausul. Sigvik ger köparen argumenten — med källhänvisning.',
              },
            ].map((u) => (
              <div key={u.title} className="bg-paper p-8">
                <h3 className="font-display text-body-lg text-ink mb-3">{u.title}</h3>
                <p className="font-sans text-body-sm text-ink-soft leading-relaxed">{u.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* What the share page shows */}
        <section className="mb-16 md:mb-24 max-w-2xl">
          <h2 className="font-sans text-overline text-ink-muted uppercase mb-6">Vad köparen ser</h2>
          <ul className="space-y-3">
            {[
              'Underhållssignal: Stark signal / Måttlig signal / Tidig indikation',
              'Avgiftshöjning per år — trend senaste 5 årsredovisningar',
              'Totala lån och underhållsfond (senaste årsredovisning)',
              'Energiklass med EU-tidsgränsanalys',
              'Planerade underhållsåtgärder med årsangivelse',
              'Antal årsredovisningar inlästa och datumstämpel',
            ].map((item) => (
              <li key={item} className="flex gap-3 font-sans text-body-sm text-ink-soft">
                <span className="text-sage flex-shrink-0 mt-0.5">✓</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Disclaimer note */}
        <section className="border border-rule p-6 md:p-8 max-w-2xl mb-14">
          <h2 className="font-display text-body-lg text-ink mb-3">Om du delar Sigvik-data</h2>
          <p className="font-sans text-body-sm text-ink-soft leading-relaxed">
            Sigviks information är hämtad från offentliga register och presenteras
            i informationssyfte. Den utgör inte finansiell, juridisk eller
            värderingsrådgivning. Var tydlig med det i din kommunikation med
            köparen — precis som du är med prospektet. Sikviks disclaimer
            syns på varje BRF-sida.
          </p>
        </section>

        {/* PDF note */}
        <section className="border border-rule-soft p-6 max-w-2xl mb-14">
          <h2 className="font-sans text-overline text-ink-muted uppercase mb-3">Köparrapport PDF</h2>
          <p className="font-sans text-body-sm text-ink-soft leading-relaxed mb-4">
            PDF-export med Sigvik-logotyp, källhänvisningar och anpassad rubrik
            är under utveckling för mäklarlicenser. Anmäl intresse för tidig
            åtkomst.
          </p>
          <a
            href="mailto:hej@sigvik.com?subject=Mäklarlicens — PDF-rapport"
            className="font-sans text-body-sm text-accent hover:text-accent-hover underline underline-offset-4 decoration-1"
          >
            Anmäl intresse →
          </a>
        </section>

        {/* CTA */}
        <div className="flex flex-wrap gap-4">
          <Link
            href="/search"
            className="font-sans text-body-sm text-paper bg-ink px-6 py-3 hover:bg-ink-soft transition-colors"
          >
            Sök en förening →
          </Link>
          <a
            href="mailto:hej@sigvik.com?subject=Mäklaråtkomst"
            className="font-sans text-body-sm text-accent border border-accent px-6 py-3 hover:bg-accent hover:text-paper transition-colors"
          >
            Kontakta oss
          </a>
        </div>
      </div>
    </main>
  );
}
