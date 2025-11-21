import * as React from "react";
const { StrictMode, Component } = React;
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
import "./styles/print.css";

// Error Boundary for debugging white screen issues
interface ErrorBoundaryState {
  hasError: boolean;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
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
      return (
        <div style={{ 
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 9999,
          backgroundColor: 'rgba(0,0,0,0.9)',
          color: 'white',
          padding: '20px', 
          fontFamily: 'Arial', 
          fontSize: '16px',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <div style={{
            backgroundColor: '#1a1a1a',
            border: '2px solid #ff4444',
            borderRadius: '8px',
            padding: '30px',
            maxWidth: '600px',
            width: '100%'
          }}>
            <h2 style={{ color: '#ff4444', marginBottom: '15px' }}>Runtime Error Detected</h2>
            <p style={{ marginBottom: '20px' }}>An error occurred while rendering the page. This debugging overlay helps identify white screen issues.</p>
            <button 
              onClick={() => window.location.reload()} 
              style={{ 
                marginTop: '10px', 
                padding: '12px 24px', 
                backgroundColor: '#007bff', 
                color: 'white', 
                border: 'none', 
                borderRadius: '6px', 
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
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