import type { Metadata } from "next";
import { Space_Grotesk, Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-headline",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "TS-1 // Thermo Shelter | Passive Solar Extreme Alpine Architecture",
  description: "High-precision physics-based passive solar engineering for extreme high-altitude alpine climates.",
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
      className={`${spaceGrotesk.variable} ${plusJakartaSans.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
(function() {
  var origError = console.error;
  console.error = function() {
    var args = Array.prototype.slice.call(arguments);
    var str = args.map(function(a) {
      try {
        return typeof a === 'object' ? JSON.stringify(a) : String(a);
      } catch(e) {
        return String(a);
      }
    }).join(' ');

    if (str.indexOf('bis_skin_checked') !== -1 || (str.indexOf('hydrated') !== -1 && str.indexOf('didn') !== -1 && str.indexOf('attributes') !== -1)) {
      return;
    }
    origError.apply(console, args);
  };

  function clean(el) {
    if (el && el.removeAttribute) {
      el.removeAttribute('bis_skin_checked');
      var children = el.querySelectorAll ? el.querySelectorAll('[bis_skin_checked]') : [];
      for (var i = 0; i < children.length; i++) {
        children[i].removeAttribute('bis_skin_checked');
      }
    }
  }

  var observer = new MutationObserver(function(mutations) {
    for (var i = 0; i < mutations.length; i++) {
      var m = mutations[i];
      if (m.type === 'attributes' && m.attributeName === 'bis_skin_checked') {
        m.target.removeAttribute('bis_skin_checked');
      } else if (m.type === 'childList') {
        for (var j = 0; j < m.addedNodes.length; j++) {
          clean(m.addedNodes[j]);
        }
      }
    }
  });

  if (document.documentElement) {
    observer.observe(document.documentElement, {
      attributes: true,
      subtree: true,
      attributeFilter: ['bis_skin_checked'],
      childList: true
    });
  }
})();
            `,
          }}
        />
      </head>
      <body suppressHydrationWarning className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
