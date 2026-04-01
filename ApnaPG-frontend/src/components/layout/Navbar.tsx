import { Link } from "react-router-dom";
import { SignedIn, SignedOut, UserButton } from "@clerk/clerk-react";

export function Navbar() {
  return (
    <nav className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/80 backdrop-blur pb-px">
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left Side: Logo */}
          <Link to="/" className="flex items-center gap-2">
            <span className="font-extrabold text-2xl tracking-tight text-primary-600">
              Apna<span className="text-gray-900">PG</span>
            </span>
          </Link>

          {/* Right Side: Auth controls */}
          <div className="flex items-center gap-4">
            <SignedOut>
              <Link
                to="/sign-in"
                className="text-sm font-semibold text-gray-700 hover:text-gray-900 transition-colors bg-gray-100 hover:bg-gray-200 py-2 px-4 rounded-lg"
              >
                Log In
              </Link>
            </SignedOut>

            <SignedIn>
              <UserButton 
                afterSignOutUrl="/" 
                appearance={{
                  elements: {
                    userButtonAvatarBox: "w-10 h-10 border-2 border-primary-100"
                  }
                }} 
              />
            </SignedIn>
          </div>
        </div>
      </div>
    </nav>
  );
}
