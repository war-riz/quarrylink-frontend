"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { VerifyBrandPanel } from "@/sections/VerifyBrandPanel";
import { VerifyFormPanel } from "@/sections/VerifyFormPanel";
import type { VerifyChannel } from "@/constants/verifyConstants";

export default function VerifyPage() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";
  const phone = searchParams.get("phone") ?? "";

  const [channel, setChannel] = useState<VerifyChannel>(
    email ? "email" : "phone"
  );

  return (
    <div className="min-h-screen flex">
      <VerifyBrandPanel channel={channel} />
      <VerifyFormPanel
        email={email}
        phone={phone}
        channel={channel}
        onChannelChange={setChannel}
      />
    </div>
  );
}