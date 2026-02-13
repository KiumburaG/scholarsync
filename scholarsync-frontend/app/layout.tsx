import type { Metadata } from "next";
import "./globals.css";
import { ApolloProviderWrapper } from "@/components/providers/apollo-provider";
import { ThemeProvider } from "@/contexts/theme-context";

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
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors">
        <ThemeProvider>
          <ApolloProviderWrapper>
            {children}
          </ApolloProviderWrapper>
        </ThemeProvider>
      </body>
    </html>
  );
}
