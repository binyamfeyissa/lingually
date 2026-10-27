import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Lingually — Open-Source AI Writing Workbench",
  description: "Write clearly. Rewrite confidently. A private, open-source AI writing assistant with Bring Your Own Key (BYOK) architecture.",
  keywords: ["AI writing assistant", "grammar checker", "paraphraser", "BYOK", "open source", "local-first writing", "tiptap editor"],
  authors: [{ name: "Lingually Contributors" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>✨</text></svg>" />
      </head>
      <body className="min-h-screen bg-background text-foreground antialiased selection:bg-brand-500/20 selection:text-brand-900 dark:selection:text-brand-100">
        {children}
      </body>
    </html>
  );
}
