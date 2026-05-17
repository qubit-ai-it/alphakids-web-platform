// app/page.tsx
import { LoginForm } from "@/shared/components/auth/LoginForm";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      {/* This renders just the modal card form in a clean, centered layout */}
      <LoginForm />
    </main>
  );
}