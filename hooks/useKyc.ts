"use client";

/**
 * useKyc
 * ─────────────────────────────────────────────────────────────────
 * Wired to:
 *   POST /api/users/kyc/submit/    → submit KYC documents
 *   GET  /api/users/kyc/status/    → check review status
 *
 * IMPORTANT — Cloudinary flow:
 *   The backend stores Cloudinary URLs, not raw file blobs.
 *   So the flow is:
 *     1. User picks file in the UI (FileReader preview already works)
 *     2. On submit, upload file to Cloudinary → get back a URL
 *     3. Send that URL to /api/users/kyc/submit/
 *
 *   Until you add the real Cloudinary SDK, this hook sends the
 *   file as a multipart/form-data upload which Django will handle
 *   via its ImageField (Cloudinary storage is configured in settings).
 *   Switch to direct Cloudinary upload later for better performance.
 *
 * Backend request shape (multipart):
 *   document_type   — "NIN" | "VOTERS_CARD" | "DRIVERS_LICENSE" | "PASSPORT" | "BVN"
 *   document_number — string
 *   document_front  — File
 *   document_back   — File (optional)
 *   selfie_image    — File
 *
 * Backend response (GET status):
 * {
 *   data: {
 *     status: "PENDING" | "APPROVED" | "REJECTED",
 *     rejection_reason: string | null,
 *     submitted_at: string,
 *     reviewed_at: string | null,
 *     expires_at: string | null,
 *     is_verified: boolean
 *   }
 * }
 * ─────────────────────────────────────────────────────────────────
 */

import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";

// ── Types ──────────────────────────────────────────────────────────

export type KycDocType =
  | "NIN"
  | "VOTERS_CARD"
  | "DRIVERS_LICENSE"
  | "PASSPORT"
  | "BVN";

export interface KycStatus {
  status:           "PENDING" | "APPROVED" | "REJECTED" | "EXPIRED";
  rejection_reason: string | null;
  submitted_at:     string;
  reviewed_at:      string | null;
  expires_at:       string | null;
  is_verified:      boolean;
}

export interface KycSubmitPayload {
  documentType:   KycDocType;
  documentNumber: string;
  documentFront:  File;
  documentBack?:  File | null;
  selfieImage:    File;
}

// ── Hook ───────────────────────────────────────────────────────────

export function useKyc() {
  const [status,      setStatus]      = useState<KycStatus | null>(null);
  const [statusLoad,  setStatusLoad]  = useState(true);
  const [submitLoad,  setSubmitLoad]  = useState(false);
  const [error,       setError]       = useState<string | null>(null);
  const [submitted,   setSubmitted]   = useState(false);

  // ── Fetch current KYC status on mount ─────────────────────────

  const fetchStatus = useCallback(async () => {
    setStatusLoad(true);
    try {
      const res  = await api("/users/kyc/status/");
      const data = await res.json();

      if (res.status === 404) {
        // Not submitted yet — that's fine
        setStatus(null);
      } else if (res.ok && data?.data) {
        setStatus(data.data as KycStatus);
      } else {
        setError(data?.message ?? "Failed to load KYC status.");
      }
    } catch {
      setError("Network error loading KYC status.");
    } finally {
      setStatusLoad(false);
    }
  }, []);

  useEffect(() => { fetchStatus(); }, [fetchStatus]);

  // ── Submit KYC ────────────────────────────────────────────────

  async function submit(payload: KycSubmitPayload) {
    setError(null);
    setSubmitLoad(true);

    try {
      // Build multipart form — Django's ImageField handles the upload
      // to Cloudinary via the configured DEFAULT_FILE_STORAGE backend.
      const form = new FormData();
      form.append("document_type",   payload.documentType);
      form.append("document_number", payload.documentNumber);
      form.append("document_front",  payload.documentFront);
      form.append("selfie_image",    payload.selfieImage);
      if (payload.documentBack) {
        form.append("document_back", payload.documentBack);
      }

      // Note: do NOT set Content-Type manually — the browser sets
      // multipart/form-data with the correct boundary automatically.
      const res = await api("/users/kyc/submit/", {
        method:  "POST",
        headers: {},   // override the default "application/json"
        body:    form,
      });

      const data = await res.json();

      if (res.status === 201 && data?.data) {
        setStatus(data.data as KycStatus);
        setSubmitted(true);
        return true;
      }

      if (res.status === 400 && data?.message === "KYC already submitted") {
        setError("You have already submitted KYC documents.");
        await fetchStatus(); // refresh to show current status
        return false;
      }

      if (data?.errors) {
        const first = Object.values(data.errors as Record<string, string[]>)
          .flat()[0];
        setError(first ?? "KYC submission failed.");
      } else {
        setError(data?.message ?? "KYC submission failed.");
      }
      return false;
    } catch {
      setError("Network error submitting KYC.");
      return false;
    } finally {
      setSubmitLoad(false);
    }
  }

  return {
    /** Current KYC status from backend, null = not submitted */
    status,
    statusLoad,
    submitLoad,
    error,
    /** True immediately after a successful submit call */
    submitted,
    submit,
    refresh: fetchStatus,
  };
}