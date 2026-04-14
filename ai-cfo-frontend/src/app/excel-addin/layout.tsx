import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CFOlytics Excel Add-in",
};

// Isolated layout — no dashboard chrome, loads Office.js via Script tag
export default function ExcelAddinLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Office.js SDK — required for all Excel Add-ins */}
        <script
          src="https://appsforoffice.microsoft.com/lib/1/hosted/office.js"
          type="text/javascript"
        />
      </head>
      <body style={{ margin: 0, padding: 0, background: "#0a0d14", color: "white", fontFamily: "Inter, system-ui, sans-serif" }}>
        {children}
      </body>
    </html>
  );
}
