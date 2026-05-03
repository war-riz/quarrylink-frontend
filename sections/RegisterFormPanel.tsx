"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { REGISTER_COPY } from "@/constants/registerConstants";
import { siteConfig } from "@/constants/navigation";
import { useRegisterForm } from "@/hooks/useRegisterForm";
import { RegisterSocialButtons } from "@/sections/RegisterSocialButtons";
import { RegisterFormFields } from "@/sections/RegisterFormFields";
import { RegisterSubmitButton } from "@/components/ui/RegisterSubmitButton";
import { LoginErrorBanner } from "@/components/ui/LoginErrorBanner";

export function RegisterFormPanel() {
  const {
    firstName, lastName, email, phone,
    password, confirmPassword, accountType,
    showPassword, showConfirmPassword,
    isLoading, error,
    setFirstName, setLastName, setEmail, setPhone,
    setPassword, setConfirmPassword, setAccountType,
    toggleShowPassword, toggleShowConfirmPassword,
    handleSubmit,
  } = useRegisterForm();

  return (
    <div className="flex-1 bg-white flex flex-col min-h-screen overflow-y-auto">

      {/* Mobile logo */}
      <div className="lg:hidden px-7 pt-8 pb-2">
        <Link href="/" className="flex items-center gap-3 w-fit">
          <div className="relative flex items-center justify-center w-[52px] h-8 rounded-[6px] bg-[#ffc107] overflow-hidden">
            <Image src="/images/logo.png" alt={siteConfig.name} fill sizes="52px" className="object-contain p-1" />
          </div>
          <span className="font-bold text-[18px] text-[#121212]">{siteConfig.name}</span>
        </Link>
      </div>

      {/* Centered form */}
      <div className="flex-1 flex items-center justify-center px-7 py-10 lg:py-8">
        <motion.div
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.45, delay: 0.1 }}
          className="w-full max-w-[440px]"
        >
          {/* Heading */}
          <div className="mb-6">
            <h2 className="font-extrabold text-[30px] text-[#121212] leading-tight mb-1.5">
              {REGISTER_COPY.formHeading}
            </h2>
            <p className="text-[14px] font-normal text-zinc-500">
              {REGISTER_COPY.formSub}{" "}
              <Link
                href={REGISTER_COPY.formSubLinkHref}
                className="text-[#121212] font-bold underline underline-offset-2 hover:text-[#ffc107] transition-colors"
              >
                {REGISTER_COPY.formSubLink}
              </Link>
            </p>
          </div>

          {/* Error */}
          {error && <LoginErrorBanner message={error} />}

          {/* Social + divider */}
          <RegisterSocialButtons />

          {/* Main form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-5 mt-1">
            <RegisterFormFields
              firstName={firstName}
              lastName={lastName}
              email={email}
              phone={phone}
              password={password}
              confirmPassword={confirmPassword}
              accountType={accountType}
              showPassword={showPassword}
              showConfirmPassword={showConfirmPassword}
              onFirstNameChange={setFirstName}
              onLastNameChange={setLastName}
              onEmailChange={setEmail}
              onPhoneChange={setPhone}
              onPasswordChange={setPassword}
              onConfirmPasswordChange={setConfirmPassword}
              onAccountTypeChange={setAccountType}
              onToggleShowPassword={toggleShowPassword}
              onToggleShowConfirmPassword={toggleShowConfirmPassword}
            />
            <RegisterSubmitButton isLoading={isLoading} />
          </form>

          {/* Terms */}
          <p className="mt-5 text-center text-[12px] text-zinc-400 leading-relaxed">
            {REGISTER_COPY.termsText}{" "}
            <Link href={REGISTER_COPY.termsHref} className="text-zinc-500 font-semibold hover:text-[#ffc107] transition-colors">
              {REGISTER_COPY.termsLink}
            </Link>{" "}
            and{" "}
            <Link href={REGISTER_COPY.privacyHref} className="text-zinc-500 font-semibold hover:text-[#ffc107] transition-colors">
              {REGISTER_COPY.privacyLink}
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
