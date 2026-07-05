import { ResetForm } from "@/components/auth/reset-form";

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg p-6">
      <div className="w-full max-w-sm">
        <ResetForm />
      </div>
    </div>
  );
}
