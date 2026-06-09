import type { Metadata } from "next";
import { QueryProvider } from "@/components/providers/query-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Senior Frontend Job Finder",
  description:
    "Dashboard to find Senior Frontend Engineer hiring posts with contact emails",
};

const themeInitScript = `(function(){try{var t=localStorage.getItem('jf-theme');if(t!=='light'&&t!=='dark'){t='dark';}var d=document.documentElement;d.classList.toggle('dark',t!=='light');d.classList.toggle('light',t==='light');d.style.colorScheme=t;}catch(e){}})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="antialiased">
        <ThemeProvider>
          <QueryProvider>{children}</QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
