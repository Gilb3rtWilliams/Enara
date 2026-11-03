import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "@fontsource/dm-sans/400.css";
import "@fontsource/dm-sans/500.css";
import "@fontsource/dm-sans/600.css";
import "@fontsource/dm-sans/700.css";
import "@fontsource/fraunces/600.css";
import App from "./App";
import { SessionProvider } from "./lib/session";
import { StoreProvider } from "./lib/store";
import "./site.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <StoreProvider>
        <SessionProvider>
          <App />
        </SessionProvider>
      </StoreProvider>
    </BrowserRouter>
  </StrictMode>
);
