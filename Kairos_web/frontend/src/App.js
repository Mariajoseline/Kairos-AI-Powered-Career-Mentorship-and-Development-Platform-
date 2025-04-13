import React, { useEffect } from "react";
import { Toaster } from "./components/ui/toaster.tsx";
import { Toaster as Sonner } from "./components/ui/sonner.tsx";
import { TooltipProvider } from "./components/ui/tooltip.tsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createBrowserRouter, RouterProvider, useNavigate } from "react-router-dom";
import { useAuth } from "./hooks/useAuth.ts";
import LandingPage from "./pages/LandingPage.js";
import SignUp from "./pages/SignUp.js";
import SignIn from "./pages/SignIn.js";
import Dashboard from "./pages/Dashboard.jsx";
import Roadmap from "./pages/Roadmap.js";
import Chatbot from "./pages/Chatbot.js";
import NotFound from "./pages/NotFound.jsx";

// Create query client with default options
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5 // 5 minutes
    }
  }
});

// Authentication wrapper component
const AuthWrapper = ({ children }) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/signin");
    }
  }, [user, loading, navigate]);

  return children;
};

// Route configuration
const router = createBrowserRouter([
  {
    path: "/",
    element: React.createElement(LandingPage),
    errorElement: React.createElement(NotFound)
  },
  {
    path: "/signup",
    element: React.createElement(SignUp)
  },
  {
    path: "/signin",
    element: React.createElement(SignIn)
  },
  {
    path: "/dashboard",
    element: React.createElement(AuthWrapper, null, React.createElement(Dashboard)),
    children: [
      {
        index: true,
        element: React.createElement(Dashboard)
      },
      {
        path: "roadmap",
        element: React.createElement(Roadmap)
      },
      {
        path: "chatbot",
        element: React.createElement(Chatbot)
      }
    ]
  },
  {
    path: "*",
    element: React.createElement(NotFound)
  }
]);

// Main App component
const App = () => {
  // Initialize API connection
  useEffect(() => {
    // Test backend connection on app load
    fetch("/api/health")
      .then(res => {
        if (!res.ok) throw new Error("Backend not responding");
        return res.json();
      })
      .then(data => console.log("Backend connection:", data.status))
      .catch(err => console.error("Backend connection error:", err));
  }, []);

  return React.createElement(
    QueryClientProvider,
    { client: queryClient },
    React.createElement(
      TooltipProvider,
      { delayDuration: 300 },
      [
        React.createElement(Toaster, { position: "top-right", key: "toaster" }),
        React.createElement(Sonner, { position: "bottom-right", richColors: true, key: "sonner" }),
        React.createElement(
          RouterProvider,
          {
            router: router,
            fallbackElement: React.createElement(
              "div",
              { className: "flex items-center justify-center h-screen" },
              "Loading..." // Replace with your loading component
            ),
            key: "router"
          }
        )
      ]
    )
  );
};

export default App;