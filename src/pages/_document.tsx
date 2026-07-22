import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="tr">
      <Head>
        <meta charSet="UTF-8" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/logo.png" />
        <meta name="theme-color" content="#0ea5e9" />
        
        {/* Google Sitelinks & Organization Schema (JSON-LD) */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "WebSite",
                  "@id": "https://zefircraft.mcsh.io/#website",
                  "url": "https://zefircraft.mcsh.io/",
                  "name": "ZefirCraft",
                  "description": "ZefirCraft Minecraft Towny sunucusunun resmi web sitesidir. Giriş yap, marketi incele, çarkı çevir ve maceraya katıl!",
                  "potentialAction": {
                    "@type": "SearchAction",
                    "target": {
                      "@type": "EntryPoint",
                      "urlTemplate": "https://zefircraft.mcsh.io/?q={search_term_string}"
                    },
                    "query-input": "required name=search_term_string"
                  }
                },
                {
                  "@type": "Organization",
                  "@id": "https://zefircraft.mcsh.io/#organization",
                  "name": "ZefirCraft",
                  "url": "https://zefircraft.mcsh.io/",
                  "logo": "https://zefircraft.mcsh.io/logo.png",
                  "sameAs": [
                    "https://discord.gg/zefircraft"
                  ],
                  "contactPoint": {
                    "@type": "ContactPoint",
                    "contactType": "customer support",
                    "email": "sunayseyidli01@gmail.com"
                  }
                },
                {
                  "@type": "ItemList",
                  "@id": "https://zefircraft.mcsh.io/#sitelinks",
                  "name": "ZefirCraft Hızlı Bağlantılar",
                  "itemListElement": [
                    {
                      "@type": "SiteNavigationElement",
                      "position": 1,
                      "name": "Ana Sayfa",
                      "url": "https://zefircraft.mcsh.io/#home"
                    },
                    {
                      "@type": "SiteNavigationElement",
                      "position": 2,
                      "name": "Mağaza",
                      "url": "https://zefircraft.mcsh.io/#store"
                    },
                    {
                      "@type": "SiteNavigationElement",
                      "position": 3,
                      "name": "Web Sandığı",
                      "url": "https://zefircraft.mcsh.io/#chest"
                    },
                    {
                      "@type": "SiteNavigationElement",
                      "position": 4,
                      "name": "Çarkıfelek",
                      "url": "https://zefircraft.mcsh.io/#wheel"
                    },
                    {
                      "@type": "SiteNavigationElement",
                      "position": 5,
                      "name": "Sıralama",
                      "url": "https://zefircraft.mcsh.io/#rankings"
                    },
                    {
                      "@type": "SiteNavigationElement",
                      "position": 6,
                      "name": "Destek",
                      "url": "https://zefircraft.mcsh.io/#support"
                    },
                    {
                      "@type": "SiteNavigationElement",
                      "position": 7,
                      "name": "Kurallar",
                      "url": "https://zefircraft.mcsh.io/#rules"
                    },
                    {
                      "@type": "SiteNavigationElement",
                      "position": 8,
                      "name": "Başvuru",
                      "url": "https://zefircraft.mcsh.io/#apply"
                    }
                  ]
                }
              ]
            })
          }}
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
