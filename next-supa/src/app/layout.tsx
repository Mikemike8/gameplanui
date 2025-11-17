import React from "react";
import { Auth0Provider } from "@auth0/nextjs-auth0/client";
import "./globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
        <head>
        <script
          async
          crossOrigin="anonymous"
          src="https://tweakcn.com/live-preview.min.js"
        />
      </head>
      <body>
        <Auth0Provider>{children}</Auth0Provider>
      </body>
    </html>
  );
}
