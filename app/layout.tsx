import type { Metadata } from "next";
import { Geist, Geist_Mono, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/theme-provider";
import { SmoothScroll } from "@/components/shared/SmoothScroll";
import AnalyticsTracker from "@/components/AnalyticsTracker";

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.awscloudclub.mnnit.ac.in"),
  title: {
    default: "AWS Cloud Club MNNIT | Student Developer Community",
    template: "%s | AWS Cloud Club MNNIT",
  },
  description: "The official student-led AWS Cloud Club at MNNIT Allahabad. Learn. Build. Grow. Connecting students with cloud technologies, hands-on workshops, and industry-ready projects.",
  keywords: ["AWS", "AWS Cloud Club", "MNNIT Allahabad", "Cloud Computing", "Student Developer Community", "Tech Events", "Hackathons"],
  authors: [{ name: "AWS Cloud Club MNNIT" }],
  creator: "AWS Cloud Club MNNIT",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://www.awscloudclub.mnnit.ac.in",
    title: "AWS Cloud Club MNNIT | Student Developer Community",
    description: "The official student-led AWS Cloud Club at MNNIT Allahabad. Learn. Build. Grow. Connecting students with cloud technologies, hands-on workshops, and industry-ready projects.",
    siteName: "AWS Cloud Club MNNIT",
    images: [
      {
        url: "/club-logo.png",
        width: 1200,
        height: 630,
        alt: "AWS Cloud Club MNNIT",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AWS Cloud Club MNNIT | Student Developer Community",
    description: "The official student-led AWS Cloud Club at MNNIT Allahabad.",
    images: ["/og-image.jpg"],
  },
  alternates: {
    canonical: "/",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "AWS Cloud Club MNNIT",
  url: "https://www.awscloudclub.mnnit.ac.in",
  logo: "https://www.awscloudclub.mnnit.ac.in/logo.png",
  description: "The official student-led AWS Cloud Club at MNNIT Allahabad.",
  sameAs: [
    "https://www.linkedin.com/company/aws-cloud-club-mnnit-allahabad",
    "https://www.instagram.com/awscloudclubmnnit",
    "https://www.github.com/AWS-Cloud-Club-MNNIT",
    "https://www.meetup.com/aws-cloud-club-at-nit-allahabad"
  ]
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn(
        "h-full",
        "antialiased",
        geistSans.variable,
        geistMono.variable,
        "font-mono",
        jetbrainsMono.variable,
      )}
      suppressHydrationWarning
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col relative overflow-x-hidden">
        <AnalyticsTracker />
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <SmoothScroll>
            {children}
          </SmoothScroll>
        </ThemeProvider>
      </body>
    </html>
  );
}
