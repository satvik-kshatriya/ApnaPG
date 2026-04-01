import { SignIn } from "@clerk/clerk-react";
import { useSearchParams } from "react-router-dom";

export function SignInPage() {
  const [searchParams] = useSearchParams();
  const role = searchParams.get("role") || "tenant";
  
  // While returning users have implicit roles in our DB, defining the redirect ensures 
  // they land gracefully into their expected dashboard.
  const fallbackRedirectUrl = `/${role}/dashboard`;

  return (
    <div className="flex h-full w-full items-center justify-center py-16">
      <SignIn 
        routing="path" 
        path="/sign-in" 
        signUpUrl={`/sign-up?role=${role}`}
        fallbackRedirectUrl={fallbackRedirectUrl}
      />
    </div>
  );
}
