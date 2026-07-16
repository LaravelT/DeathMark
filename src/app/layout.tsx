import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import "./landing.css";
import { Providers } from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LegacyBridge | Private Family Wealth Info Vault & Asset Roadmap",
  description: "Secure your family's future with LegacyBridge. Record assets in an encrypted vault stored in your Google Drive for your nominee's discovery.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-T42CMB5P');` }} />
      </head>
      <body className="antialiased">
        <noscript dangerouslySetInnerHTML={{
          __html: `<!-- Google Tag Manager (noscript) -->
<iframe src="https://www.googletagmanager.com/ns.html?id=GTM-T42CMB5P"
height="0" width="0" style="display:none;visibility:hidden"></iframe>
<!-- End Google Tag Manager (noscript) -->` }} />
        <Providers>
          {children}
          {/* Floating WhatsApp Button */}
          <a
            href="https://wa.me/918104664284"
            target="_blank"
            rel="noopener noreferrer"
            title="Chat on WhatsApp"
            className="whatsapp-float-btn"
          >
            <svg viewBox="0 0 24 24" fill="#FFF">
              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.66.986 3.296 1.48 4.905 1.485 5.272.002 9.566-4.29 9.569-9.566.002-2.557-.993-4.962-2.8-6.77-1.808-1.808-4.215-2.801-6.772-2.802-5.28 0-9.58 4.293-9.583 9.57-.001 1.706.469 3.376 1.358 4.887l-.993 3.626 3.72-.976zm10.254-4.856c-.256-.127-1.514-.747-1.747-.831-.233-.085-.403-.127-.572.127-.17.254-.656.831-.805 1.001-.149.17-.297.19-.553.063-1.054-.51-1.812-.863-2.529-1.484-.593-.513-.974-1.127-1.09-1.328-.117-.202-.013-.31.089-.41.092-.091.203-.238.305-.357.102-.119.136-.203.204-.339.068-.136.034-.254-.017-.381-.051-.127-.403-.972-.553-1.334-.146-.352-.294-.304-.403-.31-.104-.005-.224-.006-.343-.006-.12 0-.314.045-.478.223-.164.178-.627.613-.627 1.496s.642 1.735.732 1.857c.09.122 1.262 1.926 3.058 2.699.428.184.761.293 1.02.375.43.136.82.117 1.129.07.345-.052 1.514-.618 1.727-1.216.212-.597.212-1.111.149-1.216-.063-.105-.233-.146-.49-.273z" />
            </svg>
          </a>
        </Providers>
      </body>
    </html>
  );
}
