"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Mail,
  Lock,
  KeyRound,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  ShieldCheck,
  RotateCw,
  AlertCircle,
  Clock,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import { API_CONFIG } from "@/config/api.config";

export default function ForgotPasswordPage() {
  const router = useRouter();

  // Multi-step flow:
  // 1 = Enter Email
  // 2 = Enter & Verify 6-digit OTP (30 min validity)
  // 3 = Enter New Password & Confirm
  // 4 = Success & Redirect
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Step 1 state
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Step 2 state
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const otpInputsRef = useRef<(HTMLInputElement | null)[]>([]);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [otpError, setOtpError] = useState("");

  // Step 3 state
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [step3Errors, setStep3Errors] = useState<{
    newPassword?: string;
    confirmPassword?: string;
  }>({});

  // Step 4 state
  const [redirectCount, setRedirectCount] = useState(4);

  // Resend countdown timer for Step 2
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === 2 && countdown > 0) {
      timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    } else if (step === 2 && countdown === 0) {
      setCanResend(true);
    }
    return () => clearTimeout(timer);
  }, [step, countdown]);

  // Auto redirect timer for Step 4
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === 4 && redirectCount > 0) {
      timer = setTimeout(() => setRedirectCount((c) => c - 1), 1000);
    } else if (step === 4 && redirectCount === 0) {
      router.push("/login");
    }
    return () => clearTimeout(timer);
  }, [step, redirectCount, router]);

  // Handle OTP digit entry
  const handleOtpChange = (index: number, value: string) => {
    // Only allow numeric input
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (otpError) setOtpError("");

    // Auto-advance to next input if filled
    if (value && index < 5) {
      otpInputsRef.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpInputsRef.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim().slice(0, 6);
    if (/^\d+$/.test(pastedData)) {
      const digits = pastedData.split("");
      const newOtp = [...otp];
      digits.forEach((d, i) => {
        if (i < 6) newOtp[i] = d;
      });
      setOtp(newOtp);
      if (otpError) setOtpError("");
      const nextIdx = Math.min(digits.length, 5);
      otpInputsRef.current[nextIdx]?.focus();
    }
  };

  // ─────────────────────────────────────────────────────────────
  // STEP 1: Request 6-digit OTP code to email
  // ─────────────────────────────────────────────────────────────
  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError("");

    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail) {
      setEmailError("Please enter your account email address.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setEmailError("Please enter a valid email address format.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch(`${API_CONFIG.baseURL}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmedEmail }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const errorMsg =
          data?.message && Array.isArray(data.message)
            ? data.message.join(", ")
            : data?.message || "Failed to send verification code. Please try again.";
        setEmailError(errorMsg);
        toast.error("Failed to send code", { description: errorMsg });
        setIsLoading(false);
        return;
      }

      setStep(2);
      setCountdown(60);
      setCanResend(false);
      setOtp(["", "", "", "", "", ""]);
      setOtpError("");
      toast.success("Security Passcode Dispatched!", {
        description: `A 6-digit code was sent to ${trimmedEmail}. It expires in 30 minutes.`,
      });
      setTimeout(() => otpInputsRef.current[0]?.focus(), 150);
    } catch {
      setEmailError("Network error. Unable to connect to authentication server.");
      toast.error("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // ─────────────────────────────────────────────────────────────
  // Resend OTP handler
  // ─────────────────────────────────────────────────────────────
  const handleResendCode = async () => {
    if (!canResend || isLoading) return;

    setIsLoading(true);
    setOtpError("");

    try {
      const res = await fetch(`${API_CONFIG.baseURL}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const errorMsg =
          data?.message && Array.isArray(data.message)
            ? data.message.join(", ")
            : data?.message || "Failed to resend code.";
        toast.error("Resend failed", { description: errorMsg });
        setIsLoading(false);
        return;
      }

      setCountdown(60);
      setCanResend(false);
      toast.success("New passcode dispatched!", {
        description: `A fresh 6-digit code was sent to ${email.trim()}`,
      });
      otpInputsRef.current[0]?.focus();
    } catch {
      toast.error("Network error while resending passcode.");
    } finally {
      setIsLoading(false);
    }
  };

  // ─────────────────────────────────────────────────────────────
  // STEP 2: Verify 6-digit OTP code (must be valid and < 30 mins)
  // ─────────────────────────────────────────────────────────────
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setOtpError("");

    const fullCode = otp.join("");
    if (fullCode.length < 6) {
      setOtpError("Please enter all 6 digits of the verification code.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch(`${API_CONFIG.baseURL}/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          otp: fullCode,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const errorMsg =
          data?.message && Array.isArray(data.message)
            ? data.message.join(", ")
            : data?.message || "Invalid or expired verification code.";
        setOtpError(errorMsg);
        toast.error("Verification Failed", { description: errorMsg });
        setIsLoading(false);
        return;
      }

      toast.success("Code verified successfully!", {
        description: "Please enter and confirm your new password.",
      });
      setStep(3);
    } catch {
      setOtpError("Network error while verifying passcode. Please try again.");
      toast.error("Network error");
    } finally {
      setIsLoading(false);
    }
  };

  // ─────────────────────────────────────────────────────────────
  // STEP 3: Submit New Password & Confirm Password
  // ─────────────────────────────────────────────────────────────
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: { newPassword?: string; confirmPassword?: string } = {};

    if (!newPassword) {
      errors.newPassword = "New password is required.";
    } else if (newPassword.length < 8) {
      errors.newPassword = "Password must be at least 8 characters long.";
    }

    if (!confirmPassword) {
      errors.confirmPassword = "Please confirm your new password.";
    } else if (confirmPassword !== newPassword) {
      errors.confirmPassword = "Passwords do not match.";
    }

    setStep3Errors(errors);
    if (Object.keys(errors).length > 0) return;

    setIsLoading(true);

    try {
      const res = await fetch(`${API_CONFIG.baseURL}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          otp: otp.join(""),
          newPassword,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const errorMsg =
          data?.message && Array.isArray(data.message)
            ? data.message.join(", ")
            : data?.message || "Failed to reset password. Please try again.";
        setStep3Errors({ newPassword: errorMsg });
        toast.error("Reset Failed", { description: errorMsg });
        setIsLoading(false);
        return;
      }

      setStep(4);
      toast.success("Password updated successfully!", {
        description: "Your credentials have been securely updated.",
      });
    } catch {
      toast.error("Network error while resetting password.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative rounded-2xl border border-white/10 bg-[#0d121f]/95 p-6 sm:p-8 shadow-2xl shadow-indigo-950/40 backdrop-blur-xl transition-all">
      {/* Subtle top glow highlight */}
      <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-indigo-500/80 to-transparent" />

      {/* Progress Steps Indicator */}
      {step !== 4 && (
        <div className="mb-6 flex items-center justify-center gap-2">
          <div
            className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold transition-all ${
              step === 1
                ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/40"
                : "bg-white/5 text-zinc-400"
            }`}
          >
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-indigo-500/30 text-[10px]">
              {step > 1 ? <Check className="h-2.5 w-2.5" /> : "1"}
            </span>
            <span>Email</span>
          </div>

          <div className="h-[1px] w-4 bg-white/10" />

          <div
            className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold transition-all ${
              step === 2
                ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/40"
                : "bg-white/5 text-zinc-400"
            }`}
          >
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-indigo-500/30 text-[10px]">
              {step > 2 ? <Check className="h-2.5 w-2.5" /> : "2"}
            </span>
            <span>Verify OTP</span>
          </div>

          <div className="h-[1px] w-4 bg-white/10" />

          <div
            className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold transition-all ${
              step === 3
                ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/40"
                : "bg-white/5 text-zinc-400"
            }`}
          >
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-indigo-500/30 text-[10px]">
              3
            </span>
            <span>New Password</span>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          STEP 1: Request Reset Code via Email
      ───────────────────────────────────────────────────────────── */}
      {step === 1 && (
        <div>
          <div className="mb-5 flex flex-col items-center text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl border border-indigo-500/30 bg-indigo-500/10 text-indigo-400 shadow-inner shadow-indigo-500/10">
              <KeyRound className="h-6 w-6" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
              Forgot Password
            </h1>
            <p className="mt-1.5 text-xs text-zinc-400 max-w-[300px]">
              Enter the email associated with your MercatoX account. We will send you a 6-digit verification code.
            </p>
          </div>

          <form onSubmit={handleRequestCode} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block text-xs font-medium text-zinc-300"
              >
                Account Email Address
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Mail className="h-4 w-4 text-zinc-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (emailError) setEmailError("");
                  }}
                  placeholder="name@example.com"
                  className={`w-full rounded-xl border bg-black/40 py-2.5 pl-9 pr-3 text-xs text-white placeholder-zinc-500 outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 ${
                    emailError
                      ? "border-rose-500/60 ring-2 ring-rose-500/20"
                      : "border-white/10 hover:border-white/20"
                  }`}
                />
              </div>
              {emailError && (
                <p className="mt-1.5 flex items-center gap-1.5 text-xs text-rose-400">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                  {emailError}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="group relative flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 via-indigo-600 to-cyan-500 py-2.5 text-xs font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:brightness-110 active:scale-[0.99] disabled:opacity-60 disabled:pointer-events-none cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-white" />
                  <span>Sending Verification Code...</span>
                </>
              ) : (
                <>
                  <span>Send 6-Digit Code</span>
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-5 pt-3.5 border-t border-white/[0.06] text-center">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Sign In</span>
            </Link>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          STEP 2: Enter & Verify 6-digit OTP (30 min expiration)
      ───────────────────────────────────────────────────────────── */}
      {step === 2 && (
        <div>
          <div className="mb-4 text-center">
            <div className="mx-auto mb-2.5 flex h-12 w-12 items-center justify-center rounded-2xl border border-indigo-500/30 bg-indigo-500/10 text-indigo-400 shadow-inner">
              <ShieldCheck className="h-6 w-6 text-indigo-400" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
              Enter Verification Code
            </h1>
            <p className="mt-1 text-xs text-zinc-400">
              A 6-digit code was sent to{" "}
              <span className="font-semibold text-zinc-200">{email}</span>
            </p>

            {/* 30-minute validity notification */}
            <div className="mt-2.5 inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-[11px] font-medium text-amber-300">
              <Clock className="h-3 w-3" />
              <span>Valid for 30 minutes</span>
            </div>
          </div>

          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div>
              <label className="mb-2 block text-center text-xs font-medium text-zinc-300">
                Enter the 6-digit security code
              </label>

              {/* 6 Individual Digit Boxes */}
              <div className="flex justify-center gap-2 sm:gap-2.5">
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => {
                      otpInputsRef.current[i] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                    onPaste={handleOtpPaste}
                    className={`h-12 w-10 sm:w-12 rounded-xl border bg-black/60 text-center text-lg font-bold text-white outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 ${
                      otpError
                        ? "border-rose-500/60 ring-2 ring-rose-500/20"
                        : "border-white/10 hover:border-white/25"
                    }`}
                  />
                ))}
              </div>

              {otpError && (
                <div className="mt-2.5 flex items-center justify-center gap-1.5 text-center text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-lg p-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{otpError}</span>
                </div>
              )}

              {/* Resend Timer / Action */}
              <div className="mt-3 text-center text-xs text-zinc-400">
                {canResend ? (
                  <button
                    type="button"
                    onClick={handleResendCode}
                    disabled={isLoading}
                    className="inline-flex items-center gap-1.5 font-medium text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer"
                  >
                    <RotateCw className="h-3.5 w-3.5" />
                    <span>Resend code now</span>
                  </button>
                ) : (
                  <span>
                    Resend available in{" "}
                    <span className="font-semibold text-zinc-200">
                      {countdown}s
                    </span>
                  </span>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || otp.join("").length < 6}
              className="group relative flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 via-indigo-600 to-cyan-500 py-2.5 text-xs font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:brightness-110 active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-white" />
                  <span>Verifying Code...</span>
                </>
              ) : (
                <>
                  <span>Verify Code</span>
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-5 pt-3.5 border-t border-white/[0.06] flex items-center justify-between text-xs">
            <button
              type="button"
              onClick={() => {
                setStep(1);
                setOtpError("");
              }}
              className="inline-flex items-center gap-1.5 text-zinc-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Change email</span>
            </button>

            <Link
              href="/login"
              className="text-zinc-400 hover:text-white transition-colors"
            >
              Back to Sign In
            </Link>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          STEP 3: Enter New Password & Confirm Password
      ───────────────────────────────────────────────────────────── */}
      {step === 3 && (
        <div>
          <div className="mb-5 text-center">
            <div className="mx-auto mb-2.5 flex h-12 w-12 items-center justify-center rounded-2xl border border-indigo-500/30 bg-indigo-500/10 text-indigo-400 shadow-inner">
              <Lock className="h-6 w-6 text-indigo-400" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
              Create New Password
            </h1>
            <p className="mt-1 text-xs text-zinc-400">
              Identity verified for{" "}
              <span className="font-semibold text-zinc-200">{email}</span>. Please enter your new password.
            </p>
          </div>

          <form onSubmit={handleResetPassword} className="space-y-4">
            {/* New Password */}
            <div>
              <label
                htmlFor="newPassword"
                className="mb-1.5 block text-xs font-medium text-zinc-300"
              >
                New Password
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Lock className="h-4 w-4 text-zinc-400" />
                </div>
                <input
                  id="newPassword"
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    if (step3Errors.newPassword)
                      setStep3Errors((prev) => ({ ...prev, newPassword: "" }));
                  }}
                  placeholder="At least 8 characters"
                  className={`w-full rounded-xl border bg-black/40 py-2 pl-9 pr-9 text-xs text-white placeholder-zinc-500 outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 ${
                    step3Errors.newPassword
                      ? "border-rose-500/60 ring-2 ring-rose-500/20"
                      : "border-white/10 hover:border-white/20"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-zinc-400 hover:text-zinc-200"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {step3Errors.newPassword && (
                <p className="mt-1.5 flex items-center gap-1 text-xs text-rose-400">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                  {step3Errors.newPassword}
                </p>
              )}
            </div>

            {/* Confirm New Password */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="mb-1.5 block text-xs font-medium text-zinc-300"
              >
                Confirm New Password
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Lock className="h-4 w-4 text-zinc-400" />
                </div>
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (step3Errors.confirmPassword)
                      setStep3Errors((prev) => ({
                        ...prev,
                        confirmPassword: "",
                      }));
                  }}
                  placeholder="Re-enter your new password"
                  className={`w-full rounded-xl border bg-black/40 py-2 pl-9 pr-9 text-xs text-white placeholder-zinc-500 outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 ${
                    step3Errors.confirmPassword
                      ? "border-rose-500/60 ring-2 ring-rose-500/20"
                      : "border-white/10 hover:border-white/20"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-zinc-400 hover:text-zinc-200"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {step3Errors.confirmPassword && (
                <p className="mt-1.5 flex items-center gap-1 text-xs text-rose-400">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                  {step3Errors.confirmPassword}
                </p>
              )}
            </div>

            {/* Password Requirement Guidelines */}
            <div className="rounded-xl border border-white/5 bg-white/[0.02] p-2.5 text-[11px] text-zinc-400 space-y-1">
              <div className="flex items-center gap-1.5">
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    newPassword.length >= 8 ? "bg-emerald-400" : "bg-zinc-600"
                  }`}
                />
                <span
                  className={
                    newPassword.length >= 8 ? "text-emerald-300" : "text-zinc-400"
                  }
                >
                  At least 8 characters
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    newPassword && confirmPassword && newPassword === confirmPassword
                      ? "bg-emerald-400"
                      : "bg-zinc-600"
                  }`}
                />
                <span
                  className={
                    newPassword && confirmPassword && newPassword === confirmPassword
                      ? "text-emerald-300"
                      : "text-zinc-400"
                  }
                >
                  Passwords match
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="group relative flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 via-indigo-600 to-cyan-500 py-2.5 text-xs font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:brightness-110 active:scale-[0.99] disabled:opacity-60 disabled:pointer-events-none cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-white" />
                  <span>Updating Password...</span>
                </>
              ) : (
                <>
                  <span>Change Password</span>
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-5 pt-3.5 border-t border-white/[0.06] text-center">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Passcode Verification</span>
            </button>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          STEP 4: Success Confirmation & Auto Redirect
      ───────────────────────────────────────────────────────────── */}
      {step === 4 && (
        <div className="py-3 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-500/40 bg-emerald-500/10 text-emerald-400 shadow-lg shadow-emerald-500/20">
            <CheckCircle2 className="h-7 w-7" />
          </div>

          <h2 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
            Password Changed Successfully!
          </h2>
          <p className="mt-1.5 text-xs text-zinc-400 max-w-[300px] mx-auto">
            Your MercatoX account password has been updated. You can now sign in using your new credentials.
          </p>

          <div className="mt-5 rounded-xl border border-emerald-500/25 bg-emerald-500/10 p-3 text-xs text-emerald-300">
            Auto-redirecting to sign-in portal in{" "}
            <span className="font-bold text-white text-sm">{redirectCount}s</span>...
          </div>

          <div className="mt-5">
            <Link
              href="/login"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-indigo-600 py-2.5 text-xs font-semibold text-white shadow-lg shadow-emerald-500/20 transition-all hover:brightness-110 active:scale-[0.99]"
            >
              <span>Sign In Now</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
