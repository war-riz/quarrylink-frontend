import { RegisterBrandPanel } from "@/sections/RegisterBrandPanel";
import { RegisterFormPanel } from "@/sections/RegisterFormPanel";

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex">
      {/* Left — dark brand panel, desktop only */}
      <RegisterBrandPanel />

      {/* Right — form */}
      <RegisterFormPanel />
    </div>
  );
}
