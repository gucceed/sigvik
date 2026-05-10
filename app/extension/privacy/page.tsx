import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Integritetsbeskrivning — Sigvik för Hemnet',
  description:
    'Exakt vilka uppgifter Sigvik-tillägget för Chrome läser, skickar och lagrar lokalt.',
  robots: { index: true, follow: false },
};

export default function ExtensionPrivacyPage() {
  return (
    <main className="min-h-screen px-6 py-16 max-w-2xl mx-auto">
      <p className="text-xs uppercase tracking-widest text-[#8C8474] mb-8">
        Sigvik för Hemnet · Chrome-tillägg
      </p>

      <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold mb-2">
        Integritetsbeskrivning
      </h1>
      <p className="text-sm text-[#8C8474] mb-12">
        Baserad på en kodgranskning av den publicerade tilläggets källkod.
      </p>

      <Section title="Vilka uppgifter läser tillägget?">
        <p>
          Tilläggsskriptet körs enbart på Hemnets lägenhetssidor
          (<code>https://www.hemnet.se/bostad/*</code>). När en kompatibel annons
          identifieras läser det fyra fält från sidans DOM:
        </p>
        <ul>
          <li><strong>Föreningsnamn</strong> — t.ex. "Brf Solsidan"</li>
          <li><strong>Gatuadress</strong> — t.ex. "Storgatan 4"</li>
          <li><strong>Postnummer</strong> — t.ex. "21138"</li>
          <li><strong>Stad</strong> — t.ex. "Malmö"</li>
        </ul>
        <p>
          Inga personuppgifter läses. Tillägget läser inte ditt namn, dina
          kontouppgifter, dina sparade sökningar eller annan användarspecifik
          information. Det läser enbart offentligt synlig fastighetsinformation
          som visas på sidan för alla besökare.
        </p>
        <p>Tillägget körs inte på någon annan webbplats än Hemnet.</p>
      </Section>

      <Section title="Vilka uppgifter lämnar din enhet?">
        <SubSection title="1. BRF-sökning (Hop 1)">
          <dl>
            <Row label="URL" value="https://sigvik.com/api/v1/brf/lookup?address=…" />
            <Row label="Metod" value="GET" />
            <Row
              label="Vad skickas"
              value="En URL-parameter (address) med föreningsnamn, gatuadress, postnummer och stad — allt hämtat från den offentliga Hemnet-annonsen."
            />
            <Row
              label="När"
              value="En gång per annonsbesök, efter att sidans DOM laddats, förutsatt att ingen felkarantän är aktiv."
            />
            <Row
              label="Används till"
              value="Vid HTTP 200 innehåller svaret en slug (en BRF-identifierare) som används som nyckel för Hop 2. Vid HTTP 404 skickas en separat rapport om okänd BRF (se avsnitt 3)."
            />
          </dl>
        </SubSection>

        <SubSection title="2. BRF-data (Hop 2)">
          <dl>
            <Row label="URL" value="https://sigvik.com/api/v1/brf/public/<slug>" />
            <Row label="Metod" value="GET" />
            <Row label="Vad skickas" value="Inget. Sluggen från Hop 1 är inbäddad i URL-sökvägen." />
            <Row
              label="När"
              value="Efter lyckad Hop 1, om BRF-datat inte finns i den lokala cachen (24 h TTL). Om en giltig cache-post finns hoppas Hop 2 över helt."
            />
            <Row
              label="Används till"
              value="JSON-datat visas i Sigviks kort på Hemnet-sidan och skrivs till chrome.storage.local för cachning."
            />
          </dl>
        </SubSection>

        <SubSection title="3. Rapport om okänd BRF (vid 404 från Hop 1)">
          <dl>
            <Row label="URL" value="https://sigvik.com/api/v1/brf/unmatched" />
            <Row label="Metod" value="POST" />
            <Row
              label="Vad skickas"
              value="brf_name, street, postal_code, city (från sidan) samt hemnet_url — den offentliga annons-URL som syns i webbläsarens adressfält för alla besökare."
            />
            <Row
              label="När"
              value="Enbart när Hop 1 returnerar HTTP 404. Används av Sigvik för att identifiera luckor i BRF-databasen."
            />
            <Row label="Svar" value="Ignoreras — tillägget väntar inte på eller använder svaret." />
          </dl>
        </SubSection>

        <SubSection title="4. Anonym användningsstatistik (Plausible)">
          <dl>
            <Row label="URL" value="https://analytics.norric.io/api/event" />
            <Row label="Metod" value="POST" />
            <Row label="Leverantör" value="Plausible Analytics, egenhostad av Sigvik AB." />
          </dl>
          <p className="mt-3 mb-2 text-sm font-medium">Händelser som skickas:</p>
          <div className="overflow-x-auto">
            <table>
              <thead>
                <tr>
                  <th>Händelse</th>
                  <th>När</th>
                  <th>Egenskaper</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><code>extension_brf_match</code></td>
                  <td>BRF hittades, data tillgänglig</td>
                  <td><code>score_band</code>, <code>data_status: &quot;complete&quot;</code>, <code>municipality</code></td>
                </tr>
                <tr>
                  <td><code>extension_brf_match</code></td>
                  <td>BRF hittades, data väntar</td>
                  <td><code>score_band: &quot;none&quot;</code>, <code>data_status: &quot;pending&quot;</code>, <code>municipality: &quot;&quot;</code></td>
                </tr>
                <tr>
                  <td><code>extension_brf_unmatched</code></td>
                  <td>BRF hittades inte (404)</td>
                  <td><em>inga</em></td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            <strong>Vad som INTE skickas:</strong> namn, e-postadresser, annons-URL:er,
            föreningsnamn, annons-ID eller andra identifierare som kan kopplas till en
            specifik fastighet eller användare.
          </p>
          <p>
            Fältet <code>domain</code> sätts alltid till strängen <code>&quot;sigvik.com&quot;</code>{' '}
            och <code>url</code> till <code>&quot;https://sigvik.com/extension&quot;</code> — ingen
            av dessa reflekterar den faktiska Hemnet-URL du besöker.
          </p>
          <p>
            <strong>IP-adress:</strong> Din IP-adress skickas till{' '}
            <code>analytics.norric.io</code> som del av den vanliga HTTP-förfrågan.
            Plausible behandlar den server-sidan för att beräkna aggregerad
            land/region-statistik och lagrar den inte i händelseloggen.
          </p>
          <p>
            <strong>Välja bort:</strong> Öppna tilläggsinställningarna (högerklicka på
            Sigvik-ikonen → &quot;Inställningar&quot;) och avmarkera &quot;Hjälp oss förbättra Sigvik&quot;.
            När du valt bort skickas inga analyshändelser.
          </p>
        </SubSection>
      </Section>

      <Section title="Vilka uppgifter lagras lokalt?">
        <p>Tillägget lagrar två typer av data på din enhet. Ingen av dem skickas till någon server.</p>
        <div className="overflow-x-auto">
          <table>
            <thead>
              <tr>
                <th>Lagring</th>
                <th>Nyckel</th>
                <th>Innehåll</th>
                <th>TTL</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><code>chrome.storage.local</code></td>
                <td><code>brf:&lt;slug&gt;</code></td>
                <td>BRF-data från Hop 2</td>
                <td>24 h</td>
              </tr>
              <tr>
                <td><code>chrome.storage.session</code></td>
                <td><code>cooldown:&lt;hemnetUrl&gt;</code></td>
                <td>Tidsstämpel för senaste API-fel, för att förhindra snabba omförsök</td>
                <td>30 s</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          Inget av dessa innehåller personuppgifter. Inställningen för att välja bort
          statistik lagras i <code>chrome.storage.local</code> under nyckeln{' '}
          <code>telemetry_enabled</code>.
        </p>
      </Section>

      <Section title="Vilka behörigheter använder tillägget?">
        <div className="overflow-x-auto">
          <table>
            <thead>
              <tr>
                <th>Behörighet</th>
                <th>Varför</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><code>storage</code></td>
                <td>Cacha BRF-data lokalt (24 h) och spara inställning för statistik</td>
              </tr>
              <tr>
                <td><code>alarms</code></td>
                <td>Hålla bakgrundstjänsten aktiv via periodiska keepalive-alarm</td>
              </tr>
              <tr>
                <td><code>https://www.hemnet.se/*</code></td>
                <td>Läsa annonsdata från sidans DOM</td>
              </tr>
              <tr>
                <td><code>https://sigvik.com/*</code></td>
                <td>API-anrop för BRF-sökning, BRF-data och rapporter om okända BRF:er</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          Tillägget begär <strong>inte</strong> <code>tabs</code>, <code>cookies</code>,{' '}
          <code>webRequest</code>, <code>history</code>, <code>bookmarks</code> eller
          någon annan känslig behörighet. Det kan inte läsa din webbhistorik, komma åt
          andra flikar eller avlyssna nätverkstrafik från andra tillägg eller webbplatser.
        </p>
      </Section>

      <Section title="Spårar tillägget dig mellan webbplatser?">
        <p>
          Nej. Tilläggsskriptet aktiveras enbart på{' '}
          <code>https://www.hemnet.se/bostad/*</code>. Tillägget har ingen mekanism för
          att observera, registrera eller skicka din aktivitet på någon annan webbplats.
          Det spårar inte din webbhistorik, dina sökfrågor eller någon aktivitet utanför
          Hemnets lägenhetssidor.
        </p>
      </Section>

      <Section title="Vem tar emot dina uppgifter?">
        <div className="overflow-x-auto">
          <table>
            <thead>
              <tr>
                <th>Mottagare</th>
                <th>Uppgifter som tas emot</th>
                <th>Roll</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>sigvik.com</strong></td>
                <td>
                  BRF-sökfråga (namn, adress, postnummer, stad); slug i URL-sökväg;
                  rapport om okänd BRF (namn, adress, postnummer, stad, annons-URL)
                </td>
                <td>Drivs av Sigvik AB. Tillhandahåller BRF-databasen och analysen.</td>
              </tr>
              <tr>
                <td><strong>analytics.norric.io</strong></td>
                <td>
                  Anonyma användningshändelser med aggregerade egenskaper (score_band,
                  data_status, municipality); din IP-adress (behandlas server-sidan av
                  Plausible, lagras inte i händelseloggen)
                </td>
                <td>Egenhostad Plausible Analytics, drivs av Sigvik AB.</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          Inga uppgifter säljs eller delas med någon tredje part utöver de som anges
          ovan. Inga annonsnätverk, datamäklare eller externa analysleverantörer tar
          emot några uppgifter från detta tillägg.
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

function SubSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <h3 className="text-sm font-semibold mb-3 text-[#4A4438]">{title}</h3>
      {children}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-3 py-1 border-b border-[#EDE9E0] text-xs">
      <dt className="w-28 shrink-0 font-medium text-[#4A4438]">{label}</dt>
      <dd className="text-[#1A1A1A]">{value}</dd>
    </div>
  );
}
