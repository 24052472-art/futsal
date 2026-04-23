import type { Metadata } from "next";
import { AuthProvider } from "@/components/auth/AuthContext";
import "./globals.css";

export const metadata: Metadata = {
  title: "GameHaru — Premium Sports & Gaming Arena Management",
  description:
    "The all-in-one platform for sports arena owners. Manage bookings, accept payments, and grow your business online. Trusted by 200+ arenas across India & Nepal.",
  keywords: "futsal booking, sports arena management, arena booking software, turf booking system, gaming arena",
  openGraph: {
    title: "GameHaru — Sports & Gaming Arena Management",
    description: "Get your arena online in 10 minutes. Manage bookings, payments & analytics.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Outfit:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
