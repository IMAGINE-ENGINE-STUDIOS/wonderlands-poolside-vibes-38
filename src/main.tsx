import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { DarkModeProvider } from "@/components/DarkModeProvider";
import App from "./App.tsx";
import "./styles/critical.css";

const queryClient = new QueryClient();

// Register service worker for caching static assets (disabled by default)
if ('serviceWorker' in navigator && import.meta.env.PROD && import.meta.env.VITE_ENABLE_SW) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW registered: ', registration);
      })
      .catch((registrationError) => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <DarkModeProvider>
          <BrowserRouter>
            <App />
            <Toaster />
            <Sonner position="top-right" duration={3000} />
          </BrowserRouter>
        </DarkModeProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </StrictMode>
);