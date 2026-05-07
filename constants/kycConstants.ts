export type KycStep =
  | "identity"     // NIN / BVN entry
  | "document"     // Upload govt ID
  | "facial"       // Camera facial scan
  | "liveness"     // Liveness challenge
  | "review"       // Summary before submit
  | "success";     // Done

export const KYC_STEPS: { id: KycStep; label: string }[] = [
  { id: "identity", label: "ID Number" },
  { id: "document", label: "Document" },
  { id: "facial",   label: "Face Scan" },
  { id: "liveness", label: "Liveness" },
  { id: "review",   label: "Review" },
];

export const KYC_COPY = {
  badge: "Identity Verification",
  heading: ["Verify your", "identity,", "securely."],
  highlightLine: 1,
  subtext:
    "QuarryLink is regulated under CBN guidelines. We need to verify your identity before you can access the platform.",
  perks: [
    "256-bit AES encrypted data storage",
    "Compliant with NDPR & CBN KYC rules",
    "Your data is never sold to third parties",
    "Verified badge unlocks full platform access",
  ],
  steps: {
    identity: {
      heading: "Enter your ID number",
      sub: "Provide your NIN or BVN. This is used solely to verify your identity.",
    },
    document: {
      heading: "Upload a government ID",
      sub: "Upload a clear photo of your National ID, Driver's Licence, or International Passport.",
    },
    facial: {
      heading: "Facial scan",
      sub: "Position your face within the frame. Make sure your face is well-lit and clearly visible.",
    },
    liveness: {
      heading: "Liveness check",
      sub: "Follow the on-screen prompts to confirm you're a real person.",
    },
    review: {
      heading: "Review & submit",
      sub: "Check your information before final submission. This cannot be changed after submission.",
    },
    success: {
      heading: "Verification submitted!",
      sub: "We'll review your information and notify you within 24 hours. You can still explore the platform in the meantime.",
    },
  },
} as const;

export const ID_TYPES = [
  { value: "nin", label: "National Identification Number (NIN)" },
  { value: "bvn", label: "Bank Verification Number (BVN)" },
] as const;

export type IdType = (typeof ID_TYPES)[number]["value"];

export const DOC_TYPES = [
  { value: "national_id", label: "National ID Card" },
  { value: "drivers_licence", label: "Driver's Licence" },
  { value: "passport", label: "International Passport" },
  { value: "voters_card", label: "Voter's Card" },
] as const;

export type DocType = (typeof DOC_TYPES)[number]["value"];

export const LIVENESS_CHALLENGES = [
  { id: "blink", instruction: "Blink twice slowly" },
  { id: "turn_left", instruction: "Turn your head slightly to the left" },
  { id: "turn_right", instruction: "Turn your head slightly to the right" },
  { id: "smile", instruction: "Give a natural smile" },
] as const;