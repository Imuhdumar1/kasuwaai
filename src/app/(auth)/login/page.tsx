import { Suspense } from "react";
import { AuthNotice } from "@/components/auth/auth-notice";
import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <>
      <Suspense fallback={null}>
        <AuthNotice />
      </Suspense>
      <LoginForm />
    </>
  );
}
