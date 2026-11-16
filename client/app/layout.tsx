import type { Metadata } from "next";
import { Toaster } from "sonner";
import { LanguageProvider } from "@/providers/language-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "MercatoX | Enterprise Commerce Cloud",
  description: "Next-generation unified commerce platform and enterprise management portal.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className="h-full antialiased"
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var s=localStorage.getItem("mercatox-theme");var r=document.documentElement;r.classList.remove("light","dark","theme-light","theme-dark","theme-system");if(s==="light"){r.classList.add("light","theme-light");r.setAttribute("data-theme","light");r.style.colorScheme="light";}else if(s==="dark"){r.classList.add("dark","theme-dark");r.setAttribute("data-theme","dark");r.style.colorScheme="dark";}else{r.classList.add("dark","theme-system");r.setAttribute("data-theme","system");r.style.colorScheme="dark";}}catch(e){}})();(function(){try{var l=localStorage.getItem("mercatox-language");if(l){document.documentElement.lang=l;}}catch(e){}})();`,
          }}
        />
        <script src="https://accounts.google.com/gsi/client" async defer id="google-gsi-client"></script>
      </head>
      <body className="min-h-full flex flex-col bg-[#080b11] text-zinc-100 selection:bg-indigo-500/30 selection:text-indigo-200">
        <LanguageProvider>
          {children}
        </LanguageProvider>
        <Toaster
          richColors
          closeButton
          position="top-right"
          theme="dark"
          toastOptions={{
            style: {
              background: "rgba(15, 23, 42, 0.95)",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              color: "#f8fafc",
              backdropFilter: "blur(12px)",
            },
          }}
        />
      </body>
    </html>
  );
}
