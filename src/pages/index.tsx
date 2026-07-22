import dynamic from "next/dynamic";
import Head from "next/head";

const AppWithNoSSR = dynamic(() => import("../App"), {
  ssr: false,
});

export default function Home() {
  return (
    <>
      <Head>
        <title>ZefirCraft Web Sitesi</title>
        <meta name="description" content="ZefirCraft Minecraft sunucusu için resmi web sitesi ve oyuncu portalı" />
      </Head>
      <AppWithNoSSR />
    </>
  );
}
