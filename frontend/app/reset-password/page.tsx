// app/reset-password/page.tsx
import { Suspense } from "react";
import ResetPasswordComponent from "@/components/ResetPasswordComponent";

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPasswordComponent />
    </Suspense>
  );
}
