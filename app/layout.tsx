import '@/app/ui/global.css'
import { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    template: '%s | zed-dashboard',
    default: 'zed-dashboard',
  },
  description: 'zed-dashboard',
  metadataBase: new URL('https://next-learn-dashboard.vercel.sh')
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={` antialiased`}>{children}</body>
    </html>
  );
}
