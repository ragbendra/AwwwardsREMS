import type { Metadata, Viewport } from "next";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "Meridian Capital | Real Estate Portfolio",
  description: "An immersive digital experience showcasing premium real estate portfolio management. A cinematic journey through spatial architecture and data visualization.",
  keywords: ["real estate", "portfolio", "investment", "property management", "immersive experience"],
  authors: [{ name: "Meridian Capital" }],
  openGraph: {
    title: "Meridian Capital Portfolio",
    description: "Experience real estate investment through an immersive digital exhibition",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Meridian Capital Portfolio",
    description: "Experience real estate investment through an immersive digital exhibition",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#000000",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500&family=JetBrains+Mono:wght@400;500&family=Outfit:wght@100;200;300;400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
