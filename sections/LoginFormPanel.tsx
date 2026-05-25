"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { LOGIN_COPY } from "@/constants/loginConstants";
import { siteConfig } from "@/constants/navigation";
import { useLoginForm } from "@/hooks/useLoginForm";
import { LoginSocialButtons } from "@/sections/LoginSocialButtons";
import { LoginFormFields } from "@/sections/LoginFormFields";
import { LoginSubmitButton } from "@/components/ui/LoginSubmitButton";
import { LoginErrorBanner } from "@/components/ui/LoginErrorBanner";

export function LoginFormPanel() {
  const {
    login,
    setLogin,
    password,
    setPassword,
    remember,
    showPassword,
    loading,
    error,
    clearError,
    toggleRemember,
    toggleShowPassword,
    handleSubmit,
  } = useLoginForm();

  return (
    <div className="flex-1 bg-white flex flex-col min-h-screen overflow-y-auto">

      {/* Mobile logo — hidden on lg+ (brand panel takes over) */}
      <div className="lg:hidden px-7 pt-8 pb-2">
        <Link href="/" className="flex items-center gap-3 w-fit">
          <div className="relative flex items-center justify-center w-[52px] h-8 rounded-[6px] bg-[#ffc107] overflow-hidden">
            <Image src="/images/logo.png" alt={siteConfig.name} fill sizes="52px" className="object-contain p-1" />
          </div>
          <span className="font-bold text-[18px] text-[#121212]">{siteConfig.name}</span>
        </Link>
      </div>

      {/* Centered form */}
      <div className="flex-1 flex items-center justify-center px-7 py-12 lg:py-0">
        <motion.div
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.45, delay: 0.1 }}
          className="w-full max-w-[420px]"
        >
          {/* Heading */}
          <div className="mb-8">
            <h2 className="font-extrabold text-[34px] text-[#121212] leading-tight mb-1.5">
              {LOGIN_COPY.formHeading}
            </h2>
            <p className="text-[14px] font-normal text-zinc-500">
              {LOGIN_COPY.formSub}{" "}
              <Link
                href={LOGIN_COPY.formSubLinkHref}
                className="text-[#121212] font-bold underline underline-offset-2 hover:text-[#ffc107] transition-colors"
              >
                {LOGIN_COPY.formSubLink}
              </Link>
            </p>
          </div>

          {/* Error */}
          {error && <LoginErrorBanner message={error} />}

          {/* Social + divider */}
          <LoginSocialButtons />

          {/* Main form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-5 mt-1">
            <LoginFormFields
              login={login}
              password={password}
              remember={remember}
              showPassword={showPassword}
              onLoginChange={(v) => { setLogin(v); clearError(); }}
              onPasswordChange={(v) => { setPassword(v); clearError(); }}
              onToggleRemember={toggleRemember}
              onToggleShowPassword={toggleShowPassword}
            />
            <LoginSubmitButton isLoading={loading} />
          </form>

          {/* Terms */}
          <p className="mt-6 text-center text-[12px] text-zinc-400 leading-relaxed">
            {LOGIN_COPY.termsText}{" "}
            <Link href={LOGIN_COPY.termsHref} className="text-zinc-500 font-semibold hover:text-[#ffc107] transition-colors">
              {LOGIN_COPY.termsLink}
            </Link>{" "}
            and{" "}
            <Link href={LOGIN_COPY.privacyHref} className="text-zinc-500 font-semibold hover:text-[#ffc107] transition-colors">
              {LOGIN_COPY.privacyLink}
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}