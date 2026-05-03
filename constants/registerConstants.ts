export const REGISTER_COPY = {
  badge: "Join QuarryLink",
  heading: ["Build smarter,", "source", "faster."],
  highlightLine: 1,
  subtext:
    "Join hundreds of contractors, suppliers, and logistics providers already transforming Nigeria's construction supply chain.",
  formHeading: "Create your account",
  formSub: "Already have an account?",
  formSubLink: "Sign in",
  formSubLinkHref: "/login",
  submitLabel: "Create Account",
  submittingLabel: "Creating account...",
  termsText: "By creating an account, you agree to our",
  termsLink: "Terms of Service",
  termsHref: "/terms",
  privacyLink: "Privacy Policy",
  privacyHref: "/privacy",
  dividerText: "or sign up with email",
} as const;

export const REGISTER_STATS = [
  { value: "500+", label: "Verified Suppliers" },
  { value: "12k+", label: "Orders Delivered" },
  { value: "₦2B+", label: "Secured Payments" },
] as const;

export const ACCOUNT_TYPES = [
  { value: "contractor", label: "Contractor / Developer" },
  { value: "supplier", label: "Quarry Supplier" },
  { value: "logistics", label: "Logistics Provider" },
  { value: "financial", label: "Financial Institution" },
] as const;

export type AccountType = (typeof ACCOUNT_TYPES)[number]["value"];
