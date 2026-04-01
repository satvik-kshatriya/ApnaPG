import { Link, useNavigate } from "react-router-dom";
import { User, Home } from "lucide-react";
import { useUser } from "@clerk/clerk-react";
import { useEffect } from "react";

export function LandingPage() {
  const { isLoaded, isSignedIn, user } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoaded && isSignedIn && user) {
      const role = (user.publicMetadata as any)?.role || (user.unsafeMetadata as any)?.role || "tenant";
      if (role === "owner") {
        navigate("/owner");
      } else {
        navigate("/tenant");
      }
    }
  }, [isLoaded, isSignedIn, user, navigate]);

  if (!isLoaded) return null;

  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 md:py-32">
      <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-gray-900 text-center mb-6">
        Find Your Perfect PG, <span className="text-primary-600">Minus the Broker.</span>
      </h1>
      <p className="text-xl text-gray-600 max-w-2xl text-center mb-16">
        ApnaPG connects verified property owners with student tenants. 
        Zero brokers, transparent reviews, and a better living experience.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
        {/* Tenant Card */}
        <Link 
          to="/sign-up?role=tenant"
          className="group relative flex flex-col items-center p-10 bg-white border-2 border-gray-100 rounded-2xl shadow-sm hover:border-primary-500 hover:shadow-md transition-all duration-200"
        >
          <div className="h-16 w-16 bg-primary-50 text-primary-600 rounded-full flex items-center justify-center mb-6 group-hover:bg-primary-600 group-hover:text-white transition-colors duration-200">
            <User size={32} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">I'm a Student/Tenant</h2>
          <p className="text-gray-500 text-center">
            Looking for a PG or rental property with transparent rules and genuine reviews.
          </p>
        </Link>

        {/* Owner Card */}
        <Link 
          to="/sign-up?role=owner"
          className="group relative flex flex-col items-center p-10 bg-white border-2 border-gray-100 rounded-2xl shadow-sm hover:border-primary-500 hover:shadow-md transition-all duration-200"
        >
          <div className="h-16 w-16 bg-primary-50 text-primary-600 rounded-full flex items-center justify-center mb-6 group-hover:bg-primary-600 group-hover:text-white transition-colors duration-200">
            <Home size={32} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">I'm a Property Owner</h2>
          <p className="text-gray-500 text-center">
            Looking for verified student tenants to fill empty rooms safely and securely.
          </p>
        </Link>
      </div>
    </div>
  );
}
