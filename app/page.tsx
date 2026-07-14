export default function Home() {
  return (
    <main style={{ fontFamily: "system-ui", padding: "2rem" }}>
      <h1>MC Delivery API</h1>
      <p>Bu API, Minecraft sunucusu icin komut kuyrugu servisidir.</p>
      <ul>
        <li>
          <code>GET /api/queue</code> - Bekleyen komutlari ceker (Bearer token
          gerekli)
        </li>
        <li>
          <code>POST /api/queue/complete</code> - Komut sonuclarini bildirir
          (Bearer token gerekli)
        </li>
      </ul>
    </main>
  );
}
