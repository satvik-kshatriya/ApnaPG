import { Routes, Route } from "react-router-dom";
import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/clerk-react";

import { Navbar } from "./components/layout/Navbar";
import { Footer } from "./components/layout/Footer";
import { LandingPage } from "./pages/LandingPage";
import { SignInPage } from "./pages/SignInPage";
import { SignUpPage } from "./pages/SignUpPage";
import { TenantDashboard } from "./pages/TenantDashboard";
import { OwnerDashboard } from "./pages/OwnerDashboard";
import { DashboardRedirect } from "./components/auth/DashboardRedirect";

export default function App() {
  return (
    <div className="min-h-screen flex flex-col w-full bg-cream text-zinc-900 font-sans selection:bg-primary-100 selection:text-primary-900">
      <Navbar />

      {/* Strict Global Layout constraint to prevent ultrawide stretching */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 flex-grow flex flex-col">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/sign-in/*" element={<SignInPage />} />
          <Route path="/sign-up/*" element={<SignUpPage />} />

          {/* Unified Redirector Hub after Login */}
          <Route path="/dashboard" element={<DashboardRedirect />} />

          {/* Protected Tenant Routes */}
          <Route
            path="/tenant/*"
            element={
              <>
                <SignedIn>
                  <TenantDashboard />
                </SignedIn>
                <SignedOut>
                  <RedirectToSignIn redirectUrl={window.location.pathname} />
                </SignedOut>
              </>
            }
          />

          {/* Protected Owner Routes */}
          <Route
            path="/owner/*"
            element={
              <>
                <SignedIn>
                  <OwnerDashboard />
                </SignedIn>
                <SignedOut>
                  <RedirectToSignIn redirectUrl={window.location.pathname} />
                </SignedOut>
              </>
            }
          />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}
