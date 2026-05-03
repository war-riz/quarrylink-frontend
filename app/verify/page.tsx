import { VerifyBrandPanel } from "@/sections/VerifyBrandPanel";
import { VerifyFormPanel } from "@/sections/VerifyFormPanel";

interface VerifyPageProps {
  searchParams: { email?: string };
}

export default function VerifyPage({ searchParams }: VerifyPageProps) {
  const email = searchParams.email ?? "";

  return (
    <div className="min-h-screen flex">
      <VerifyBrandPanel />
      <VerifyFormPanel email={email} />
    </div>
  );
}
