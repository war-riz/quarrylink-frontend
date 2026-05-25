"use client";

/**
 * VerifyPageInner
 * ─────────────────────────────────────────────────────────────────
 * Reads the contact to verify from:
 *   1. URL search params  ?email=...  (set explicitly by some flows)
 *   2. sessionStorage key "ql_pending_login"  (set by register + login 403)
 *
 * This means the page works whether the user lands via:
 *   /verify?email=user@example.com
 *   /verify  (after registration redirects here)
 * ─────────────────────────────────────────────────────────────────
 */

"use client";

import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { VerifyBrandPanel } from "@/sections/VerifyBrandPanel";
import { VerifyFormPanel } from "@/sections/VerifyFormPanel";
import type { VerifyChannel } from "@/constants/verifyConstants";

export function VerifyPageInner() {
  const searchParams = useSearchParams();

  // Prefer explicit URL params; fall back to sessionStorage
  const [email, setEmailState] = useState(searchParams.get("email") ?? "");
  const [phone, setPhoneState] = useState(searchParams.get("phone") ?? "");

  useEffect(() => {
    // Only run on client where sessionStorage is available
    if (!email && !phone) {
      const pending = sessionStorage.getItem("ql_pending_login") ?? "";
      // Determine if it looks like a phone number or email
      if (/^\+?\d[\d\s]{8,}$/.test(pending)) {
        setPhoneState(pending);
      } else if (pending) {
        setEmailState(pending);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [channel, setChannel] = useState<VerifyChannel>(
    email ? "email" : "phone"
  );

  // Re-evaluate default channel once sessionStorage values are resolved
  useEffect(() => {
    setChannel(email ? "email" : "phone");
  }, [email]);

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