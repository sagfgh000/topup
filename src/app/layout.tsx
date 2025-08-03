
import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from '@/contexts/AuthContext';
import { Gem } from 'lucide-react';

const siteUrl = 'https://dimondtopup.vercel.app';
const siteTitle = 'Dimond Topup - Fast & Secure Free Fire Diamond Top-Up BD';
const siteDescription = 'The fastest and most trusted platform in Bangladesh to top-up Garena Free Fire diamonds. Get instant FF diamond delivery using your UID. Secure payment and 24/7 support.';
const ogImage = 'https://i.ibb.co/p60sY0qv/download-2.jpg';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: siteTitle,
  description: siteDescription,
  keywords: [
    'Free Fire diamond topup', 
    'FF diamond top up', 
    'Garena top up',
    'Dimond Topup',
    'Free Fire Bangladesh',
    'FF diamond BD',
    'UID topup',
    'game topup bd',
    'free fire in-game purchase'
  ],
  openGraph: {
    type: 'website',
    url: siteUrl,
    title: siteTitle,
    description: siteDescription,
    images: [
        {
            url: ogImage,
            width: 1200,
            height: 630,
            alt: 'Free Fire Diamond Top-up Banner',
        },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: siteTitle,
    description: siteDescription,
    images: [ogImage],
  },
  icons: {
    icon: '/icon.svg',
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>💎</text></svg>" />
      </head>
      <body className="font-body antialiased">
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
