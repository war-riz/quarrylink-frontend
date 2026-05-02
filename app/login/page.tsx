import { LoginBrandPanel } from "@/sections/LoginBrandPanel";
import { LoginFormPanel } from "@/sections/LoginFormPanel";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex">
      {/* Left — dark brand panel, desktop only */}
      <LoginBrandPanel />

      {/* Right — form */}
      <LoginFormPanel />
    </div>
  );
}
