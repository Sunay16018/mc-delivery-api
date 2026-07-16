import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { MagazaClient } from "@/components/shop/MagazaClient";

export default function MagazaPage() {
  return (
    <>
      <Nav />
      <MagazaClient />
      <Footer />
    </>
  );
}
