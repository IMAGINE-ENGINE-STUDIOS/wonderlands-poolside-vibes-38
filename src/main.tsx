import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { DarkModeProvider } from "@/components/DarkModeProvider";
import App from "./App.tsx";
import "./styles/critical.css";
import "./styles/components.css";
import "./styles/animations.css";

// Error Boundary for debugging white screen issues
interface ErrorBoundaryState {
  hasError: boolean;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    console.error('ErrorBoundary caught an error:', error);
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary details:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <div style={{ 
        padding: '20px', 
        color: 'red', 
        fontFamily: 'Arial', 
        fontSize: '16px',
        background: 'white',
        minHeight: '100vh'
      }}>
        <h1>Something went wrong.</h1>
        <p>Please refresh the page. If the problem persists, check the console for errors.</p>
      </div>;
    }

    return this.props.children;
  }
}

const queryClient = new QueryClient();

// Register service worker for caching static assets (DISABLED - preventing white screen)
// Service worker disabled to prevent caching issues causing white screen
if (false && 'serviceWorker' in navigator && import.meta.env.PROD && import.meta.env.VITE_ENABLE_SW) {
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
    <ErrorBoundary>
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
    </ErrorBoundary>
  </StrictMode>
);