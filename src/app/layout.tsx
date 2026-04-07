import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ekush WML - Investor Portal",
  description: "Ekush Wealth Management Ltd - Your Investment Dashboard",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link
          rel="preconnect"
          href="https://fonts.googleapis.com"
        />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&family=Rajdhani:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-page-bg antialiased font-poppins">
        {children}
      </body>
    </html>
  );
}
