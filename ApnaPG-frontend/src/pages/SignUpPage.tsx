import { SignUp } from "@clerk/clerk-react";
import { useSearchParams } from "react-router-dom";

export function SignUpPage() {
  const [searchParams] = useSearchParams();
  const role = searchParams.get("role") || "tenant";
  
  // Predict the destination dashboard based on the selected role
  const fallbackRedirectUrl = `/${role}/dashboard`;

  return (
    <div className="flex h-full w-full items-center justify-center py-16">
      <SignUp 
        routing="path" 
        path="/sign-up" 
        signInUrl={`/sign-in?role=${role}`}
        fallbackRedirectUrl={fallbackRedirectUrl}
      />
    </div>
  );
}
