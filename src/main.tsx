import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { DarkModeProvider } from "@/components/DarkModeProvider";
import App from "./App.tsx";
import "./index.css";

const queryClient = new QueryClient();

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