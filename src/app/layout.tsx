import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pegasusgames - Stream Your Favorite Games",
  description: "Unlimited games, netflix style",
};

// Root layout - estructura HTML básica
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html suppressHydrationWarning>
      <body className="antialiased" style={{ fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }}>
        {children}
      </body>
    </html>
  );
}
