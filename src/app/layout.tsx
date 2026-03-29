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
      <body className="min-h-screen bg-background antialiased">
        {children}
      </body>
    </html>
  );
}
