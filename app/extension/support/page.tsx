import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Support — Sigvik för Hemnet',
  description: 'Hjälp och vanliga frågor för Sigvik-tillägget för Chrome.',
  robots: { index: true, follow: false },
};

export default function ExtensionSupportPage() {
  return (
    <main className="min-h-screen px-6 py-16 max-w-2xl mx-auto">
      <p className="text-xs uppercase tracking-widest text-[#8C8474] mb-8">
        Sigvik för Hemnet · Chrome-tillägg
      </p>

      <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold mb-2">
        Support — Sigvik för Hemnet
      </h1>
      <p className="text-sm text-[#8C8474] mb-12">
        Vi svarar normalt inom 1–2 arbetsdagar.
      </p>

      <Section title="Vanliga frågor">
        <div className="border-b border-[#EDE9E0] py-3">
          <details>
            <summary className="cursor-pointer font-medium text-sm list-none">
              Tillägget visar inte något kort på Hemnet — vad gör jag?
            </summary>
            <p className="mt-2 text-sm text-[#4A4438] leading-relaxed">
              Kontrollera att du är på en lägenhetssida (URL:en ska innehålla{' '}
              <code>/bostad/lagenhet-</code>). Tillägget aktiveras inte på villor, radhus eller
              tomter. Prova att ladda om sidan. Om kortet fortfarande saknas, kontakta oss via
              formuläret nedan.
            </p>
          </details>
        </div>
        <div className="border-b border-[#EDE9E0] py-3">
          <details>
            <summary className="cursor-pointer font-medium text-sm list-none">
              BRF:en visas som &quot;okänd&quot; — varför?
            </summary>
            <p className="mt-2 text-sm text-[#4A4438] leading-relaxed">
              Sigviks databas täcker tusentals föreningar men är inte komplett. När en förening
              inte hittas skickas ett automatiskt meddelande till oss så att vi kan lägga till
              den. Du kan också höra av dig direkt via{' '}
              <a href="mailto:support@sigvik.com" className="underline underline-offset-2 text-[#1A1A1A]">
                support@sigvik.com
              </a>
              .
            </p>
          </details>
        </div>
        <div className="border-b border-[#EDE9E0] py-3">
          <details>
            <summary className="cursor-pointer font-medium text-sm list-none">
              Hur ofta uppdateras informationen?
            </summary>
            <p className="mt-2 text-sm text-[#4A4438] leading-relaxed">
              Informationen hämtas från publicerade årsredovisningar och uppdateras när ny data
              finns tillgänglig, normalt inom några veckor efter att en årsredovisning publicerats
              hos Bolagsverket.
            </p>
          </details>
        </div>
        <div className="border-b border-[#EDE9E0] py-3">
          <details>
            <summary className="cursor-pointer font-medium text-sm list-none">
              Kan föreningen begära rättelse av felaktig information?
            </summary>
            <p className="mt-2 text-sm text-[#4A4438] leading-relaxed">
              Ja. Skicka ett e-postmeddelande till{' '}
              <a href="mailto:support@sigvik.com" className="underline underline-offset-2 text-[#1A1A1A]">
                support@sigvik.com
              </a>{' '}
              med föreningens namn, organisationsnummer och en beskrivning av felet. Vi granskar
              och korrigerar inom 5 arbetsdagar.
            </p>
          </details>
        </div>
        <div className="border-b border-[#EDE9E0] py-3">
          <details>
            <summary className="cursor-pointer font-medium text-sm list-none">
              Är tillägget gratis?
            </summary>
            <p className="mt-2 text-sm text-[#4A4438] leading-relaxed">
              Ja, tillägget är kostnadsfritt. Fullständiga rapporter på sigvik.com kräver ett
              konto.
            </p>
          </details>
        </div>
      </Section>

      <Section title="Kontakt">
        <p>
          Skicka ett e-postmeddelande till{' '}
          <a href="mailto:support@sigvik.com" className="underline underline-offset-2 text-[#1A1A1A]">
            support@sigvik.com
          </a>
          .
        </p>
      </Section>

      <Section title="Felrapportering">
        <p>
          Har du hittat ett fel i tillägget? Beskriv vad som hände och vilket steg som föregick
          felet.
        </p>
        <p>
          <a
            href="mailto:support@sigvik.com?subject=Felrapport%20%E2%80%94%20Sigvik%20f%C3%B6r%20Hemnet"
            className="underline underline-offset-2 text-[#1A1A1A]"
          >
            Skicka felrapport
          </a>
        </p>
      </Section>

      <p className="mt-16 text-xs text-[#8C8474]">
        Sigvik AB ·{' '}
        <a href="https://sigvik.com" className="underline underline-offset-2">
          sigvik.com
        </a>
      </p>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-12">
      <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold mb-4 pb-2 border-b border-[#D8D2C4]">
        {title}
      </h2>
      <div className="space-y-3 text-sm leading-relaxed [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1 [&_code]:font-mono [&_code]:text-[0.8em] [&_code]:bg-[#EDE9E0] [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_table]:w-full [&_table]:text-xs [&_table]:border-collapse [&_th]:text-left [&_th]:font-medium [&_th]:pb-1 [&_th]:border-b [&_th]:border-[#D8D2C4] [&_td]:py-1.5 [&_td]:pr-4 [&_td]:align-top [&_td]:border-b [&_td]:border-[#EDE9E0] [&_strong]:font-semibold">
        {children}
      </div>
    </section>
  );
}
