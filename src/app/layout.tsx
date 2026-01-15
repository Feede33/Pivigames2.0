import './globals.css';

// Root layout - Next.js requiere que el root layout tenga html/body
// pero delegamos el contenido real al locale layout
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
