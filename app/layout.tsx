// app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Shoe Designer",
  description: "Upload inputs, add a prompt, then generate.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {/* Background + app frame (driven by globals.css theme tokens) */}
        <div className="appShell">
          <div className="appGlow" />
          <div className="appFrame">
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}