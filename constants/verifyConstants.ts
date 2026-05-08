export type VerifyChannel = "email" | "phone";

export const VERIFY_COPY = {
  badge: "Verify your account",
  heading: "One step",
  headingHighlight: "away.",

  email: {
    icon: "📧",
    label: "Email",
    heading: "Verify your email",
    headingHighlight: "address",
    subtext: (email: string) =>
      `We sent a 6-digit code to ${email}. Enter it below to activate your account.`,
    subtextFallback:
      "We sent a 6-digit code to your email address. Enter it below to activate your account.",
    resendPrompt: "Didn't receive it?",
    tip: "Check your spam or junk folder if you can't find it.",
  },

  phone: {
    icon: "📱",
    label: "SMS",
    heading: "Verify your phone",
    headingHighlight: "number",
    subtext: (phone: string) =>
      `We sent a 6-digit OTP via SMS to ${phone}. Enter it below to activate your account.`,
    subtextFallback:
      "We sent a 6-digit OTP via SMS to your phone number. Enter it below to activate your account.",
    resendPrompt: "Didn't receive the SMS?",
    tip: "Make sure your phone has a signal and can receive SMS messages.",
  },

  submitLabel: "Verify & Continue",
  submittingLabel: "Verifying...",
  resendLabel: "Resend code",
  resendingLabel: "Sending...",
  backLabel: "Back to sign up",
  backHref: "/register",
  successHeading: "Verified!",
  successSubtext: "Your account is ready. Redirecting you to identity verification...",
  codeLength: 6,
  resendCooldown: 30,

  switchTo: {
    email: "Verify with email instead",
    phone: "Verify with SMS instead",
  },
} as const;