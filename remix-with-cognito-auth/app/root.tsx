import type { MetaFunction } from "@remix-run/node";
import styles from "./styles/app.css"
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import { Toaster } from "react-hot-toast";

export const meta: MetaFunction = () => ({
  charset: "utf-8",
  title: "itsmarkodonnell | Remix with Cognito Auth",
  viewport: "width=device-width,initial-scale=1",
});
export function links() {
  return [{ rel: "stylesheet", href: styles }]
}

export default function App() {
  return (
    <html lang="en" className="h-full bg-gray-100 ">
      <head>
        <Meta />
        <Links />
      </head>
      <body className="h-full">
        <Toaster toastOptions={{}} />
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
