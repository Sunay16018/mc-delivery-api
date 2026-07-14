export const metadata = {
  title: "MC Delivery API",
  description: "Minecraft komut kuyrugu API'si",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  );
}
