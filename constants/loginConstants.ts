export const LOGIN_STATS = [
  { value: "500+", label: "Verified Suppliers" },
  { value: "12k+", label: "Orders Delivered" },
  { value: "₦2B+", label: "Secured Payments" },
] as const;

export const LOGIN_COPY = {
  badge: "Welcome back",
  heading: ["Your quarry", "operations", "await."],
  highlightLine: 1, // index of the line to colour amber
  subtext:
    "Sign in to manage orders, track deliveries in real-time, and connect with Nigeria's largest verified supplier network.",
  formHeading: "Sign in",
  formSub: "No account?",
  formSubLink: "Create free Account",
  formSubLinkHref: "/register",
  rememberLabel: "Remember me for 30 days",
  submitLabel: "Sign in",
  submittingLabel: "Signing in...",
  forgotLabel: "Forgot password?",
  forgotHref: "/forgot-password",
  termsText: "By continuing, you agree to our",
  termsLink: "Terms of Service",
  termsHref: "/terms",
  privacyLink: "Privacy Policy",
  privacyHref: "/privacy",
  dividerText: "or continue with email",
} as const;
