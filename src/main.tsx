import React from "react";
import ReactDOM from "react-dom/client";
import { Auth0Provider } from "@auth0/auth0-react";
import App from "./App";
import "./styles.css";

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/service-worker.js");
  });
}

const domain = import.meta.env.VITE_AUTH0_DOMAIN;
const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID;
const audience = import.meta.env.VITE_AUTH0_AUDIENCE;
const hasAuthConfig = Boolean(domain && clientId);

const root = ReactDOM.createRoot(document.getElementById("root")!);

if (!hasAuthConfig) {
  console.error(
    "Missing Auth0 configuration. Set VITE_AUTH0_DOMAIN and VITE_AUTH0_CLIENT_ID in .env."
  );
  root.render(
    <React.StrictMode>
      <div className="min-h-screen bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100">
        <div className="mx-auto max-w-2xl px-6 py-24">
          <h1 className="text-2xl font-semibold">Auth0 configuration missing</h1>
          <p className="mt-4 text-slate-600 dark:text-slate-300">
            Set <code>VITE_AUTH0_DOMAIN</code> and{" "}
            <code>VITE_AUTH0_CLIENT_ID</code> in your <code>.env</code> file,
            then restart the dev server.
          </p>
        </div>
      </div>
    </React.StrictMode>
  );
} else {
  root.render(
    <React.StrictMode>
      <Auth0Provider
        domain={domain}
        clientId={clientId}
        cacheLocation="localstorage"
        useRefreshTokens
        skipRedirectCallback={window.location.pathname === '/callback'}
        authorizationParams={{
          redirect_uri: window.location.origin,
          audience,
        }}
      >
        <App />
      </Auth0Provider>
    </React.StrictMode>
  );
}
