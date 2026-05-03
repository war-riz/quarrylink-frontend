export const VERIFY_COPY = {
  badge: "Check your email",
  heading: "Verify your",
  headingHighlight: "email address",
  subtext: (email: string) =>
    `We sent a 6-digit verification code to ${email}. Enter it below to activate your account.`,
  subtextFallback:
    "We sent a 6-digit verification code to your email. Enter it below to activate your account.",
  submitLabel: "Verify Email",
  submittingLabel: "Verifying...",
  resendLabel: "Resend code",
  resendingLabel: "Sending...",
  resendPrompt: "Didn't receive it?",
  backLabel: "Back to sign up",
  backHref: "/register",
  successHeading: "Email Verified!",
  successSubtext: "Your account is ready. Redirecting you to your dashboard...",
  codeLength: 6,
  resendCooldown: 30, // seconds
} as const;
