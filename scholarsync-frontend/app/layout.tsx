import type { Metadata } from "next";
import "./globals.css";
import { ApolloProviderWrapper } from "@/components/providers/apollo-provider";

export const metadata: Metadata = {
  title: "ScholarSync - AI-Powered Scholarship Applications",
  description: "Apply to scholarships faster with AI-powered essay generation and smart matching",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <ApolloProviderWrapper>
          {children}
        </ApolloProviderWrapper>
      </body>
    </html>
  );
}
