import dynamic from "next/dynamic";
import Head from "next/head";

const AppWithNoSSR = dynamic(() => import("../App"), {
  ssr: false,
});

export default function Home() {
  return (
    <>
      <Head>
        <title>ZefirCraft | Towny Sunucusu Resmi Web Sitesi</title>
        <meta name="description" content="ZefirCraft Minecraft Towny sunucusunun resmi web sitesidir. Giriş yap, marketi incele, çarkı çevir ve maceraya katıl!" />
        
        {/* Open Graph / Facebook / Discord / WhatsApp */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://zefircraft.mcsh.io" />
        <meta property="og:title" content="ZefirCraft | Towny Sunucusu" />
        <meta property="og:description" content="ZefirCraft Minecraft Towny sunucusunun resmi web sitesidir. 1.16.5 - 1.26.2 sürümleriyle hemen katıl!" />
        <meta property="og:image" content="/logo.png" />
        <meta property="og:site_name" content="ZefirCraft" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="ZefirCraft | Towny Sunucusu" />
        <meta name="twitter:description" content="ZefirCraft Minecraft Towny sunucusunun resmi web sitesidir. 1.16.5 - 1.26.2 sürümleriyle hemen katıl!" />
        <meta name="twitter:image" content="/logo.png" />

        {/* Discord/WhatsApp Embed Customize */}
        <meta name="theme-color" content="#0ea5e9" />
      </Head>
      <AppWithNoSSR />
    </>
  );
}
