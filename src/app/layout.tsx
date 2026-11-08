import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Noto_Sans_Bengali } from "next/font/google";
import "./globals.css";
import { TransitionOverlay } from "@/components/transition/TransitionOverlay";
import { DetailTransitionOverlay } from "@/components/transition/DetailTransitionOverlay";
import { LocaleSync } from "@/components/ui/LocaleSync";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const notoSansBengali = Noto_Sans_Bengali({
  variable: "--font-bengali",
  subsets: ["bengali"],
});

export const metadata: Metadata = {
  title: "Bangladesh to Gaibandha — An Interactive Journey",
  description:
    "A cinematic, data-driven exploration of Bangladesh's 64 districts and the seven upazilas of Gaibandha.",
  applicationName: "Bangladesh Explore",
  keywords: ["Bangladesh", "Gaibandha", "maps", "districts", "upazilas", "geography"],
};

export const viewport: Viewport = {
  themeColor: "#02040c",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${notoSansBengali.variable} h-full antialiased`}
    >
      <body
        suppressHydrationWarning
        className="min-h-full bg-[#02040c] font-sans text-white"
      >
        {children}
        <TransitionOverlay />
        <DetailTransitionOverlay />
        <LocaleSync />
      </body>
    </html>
  );
}
