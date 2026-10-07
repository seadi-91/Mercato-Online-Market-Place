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
  Sparkles,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

export default function ForgotPasswordPage() {
  const router = useRouter();

  // Multi-step: 1 = Request Code, 2 = Verify Code & Set Password, 3 = Success
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Step 1 state
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Step 2 state
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const otpInputsRef = useRef<(HTMLInputElement | null)[]>([]);
  const [countdown, setCountdown] = useState(45);
  const [canResend, setCanResend] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [step2Errors, setStep2Errors] = useState<Record<string, string>>({});

  // Step 3 state
  const [redirectCount, setRedirectCount] = useState(4);

  // Resend countdown timer effect for Step 2
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === 2 && countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else if (step === 2 && countdown === 0) {
      setCanResend(true);
    }
    return () => clearTimeout(timer);
  }, [step, countdown]);

  // Auto redirect timer for Step 3
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === 3 && redirectCount > 0) {
      timer = setTimeout(() => setRedirectCount(redirectCount - 1), 1000);
    } else if (step === 3 && redirectCount === 0) {
      router.push("/login");
    }
    return () => clearTimeout(timer);
  }, [step, redirectCount, router]);

  // Handle OTP digit entry
  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    // Take the last character typed
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    // Auto-advance
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
      otpInputsRef.current[Math.min(digits.length, 5)]?.focus();
    }
  };

  const handleQuickFillEmail = () => {
    setEmail("admin@mercatox.enterprise");
    setEmailError("");
    toast.info("Demo corporate email loaded.");
  };

  const handleQuickFillOtp = () => {
    setOtp(["8", "4", "2", "9", "1", "0"]);
    toast.success("Security code filled: 842910");
  };

  // Step 1 Submission
  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError("");

    if (!email.trim()) {
      setEmailError("Corporate email address is required");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setEmailError("Please enter a valid work email format");
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setStep(2);
      setCountdown(45);
      setCanResend(false);
      toast.success("Security passcode dispatched!", {
        description: `A 6-digit recovery code was sent to ${email}`,
      });
    }, 850);
  };

  // Resend code handler
  const handleResendCode = () => {
    if (!canResend) return;
    setCountdown(45);
    setCanResend(false);
    toast.info("New passcode dispatched to your email");
  };

  // Step 2 Submission
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};

    const fullCode = otp.join("");
    if (fullCode.length < 6) {
      errs.otp = "Please enter the complete 6-digit code";
    }

    if (!newPassword) {
      errs.newPassword = "New password is required";
    } else if (newPassword.length < 8) {
      errs.newPassword = "Password must be at least 8 characters";
    }

    if (!confirmPassword) {
      errs.confirmPassword = "Confirm your new password";
    } else if (confirmPassword !== newPassword) {
      errs.confirmPassword = "Passwords do not match";
    }

    setStep2Errors(errs);
    if (Object.keys(errs).length > 0) return;

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setStep(3);
      toast.success("Password reset successful!", {
        description: "Your enterprise credentials have been safely renewed.",
      });
    }, 1000);
  };

  return (
    <div className="relative rounded-2xl border border-white/10 bg-[#0d121f]/90 p-5 sm:p-7 shadow-2xl shadow-indigo-950/40 backdrop-blur-xl transition-all">
      {/* Subtle top glow highlight */}
      <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-indigo-500/80 to-transparent" />

      {/* STEP 1: Request Reset Code */}
      {step === 1 && (
        <div>
          {/* Header Icon */}
          <div className="mb-4 flex flex-col items-center text-center">
            <div className="mb-2.5 flex h-10 w-10 items-center justify-center rounded-xl border border-indigo-500/30 bg-indigo-500/10 text-indigo-400 shadow-inner">
              <KeyRound className="h-5 w-5" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
              Reset Password
            </h1>
            <p className="mt-1 text-xs text-zinc-400 max-w-[280px]">
              Enter your corporate email to receive a secure recovery code.
            </p>
          </div>

          {/* Quick Demo Autofill */}
          <div className="mb-4 rounded-xl border border-white/[0.06] bg-white/[0.02] p-2.5">
            <div className="flex items-center justify-between text-[11px]">
              <span className="flex items-center gap-1 font-medium text-zinc-400">
                <Sparkles className="h-3 w-3 text-indigo-400" />
                Quick Test
              </span>
              <button
                type="button"
                onClick={handleQuickFillEmail}
                className="text-[10px] text-indigo-400 hover:text-indigo-300 font-medium underline"
              >
                Autofill demo email
              </button>
            </div>
          </div>

          <form onSubmit={handleRequestCode} className="space-y-3.5">
            <div>
              <label
                htmlFor="email"
                className="mb-1 block text-[12px] font-medium text-zinc-300"
              >
                Corporate Email Address
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
                  placeholder="admin@mercatox.enterprise"
                  className={`w-full rounded-xl border bg-black/40 py-2 pl-9 pr-3 text-xs text-white placeholder-zinc-500 outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 ${emailError
                      ? "border-rose-500/60 ring-2 ring-rose-500/20"
                      : "border-white/10 hover:border-white/20"
                    }`}
                />
              </div>
              {emailError && (
                <p className="mt-1 flex items-center gap-1 text-[11px] text-rose-400">
                  <AlertCircle className="h-3 w-3" />
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
                  <span>Dispatching security code...</span>
                </>
              ) : (
                <>
                  <span>Send Recovery Code</span>
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-4 pt-3 border-t border-white/[0.06] text-center">
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

      {/* STEP 2: Verify Code & Set New Password */}
      {step === 2 && (
        <div>
          <div className="mb-4 text-center">
            <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl border border-indigo-500/30 bg-indigo-500/10 text-indigo-400 shadow-inner">
              <ShieldCheck className="h-5 w-5 text-indigo-400" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
              Enter Passcode
            </h1>
            <p className="mt-1 text-xs text-zinc-400">
              Code sent to <span className="font-semibold text-zinc-200">{email}</span>
            </p>
          </div>

          {/* Quick OTP test fill button */}
          <div className="mb-3 flex justify-end">
            <button
              type="button"
              onClick={handleQuickFillOtp}
              className="flex items-center gap-1 text-[10px] text-indigo-400 hover:text-indigo-300 font-medium"
            >
              <Sparkles className="h-2.5 w-2.5" /> Auto-fill code (842910)
            </button>
          </div>

          <form onSubmit={handleResetPassword} className="space-y-3.5">
            {/* 6 Digit Box Inputs */}
            <div>
              <label className="mb-1.5 block text-center text-[11px] font-medium text-zinc-300">
                6-Digit Security Code
              </label>
              <div className="flex justify-center gap-1.5 sm:gap-2">
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
                    className="h-10 w-9 sm:w-10 rounded-xl border border-white/10 bg-black/50 text-center text-sm font-bold text-white outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                  />
                ))}
              </div>
              {step2Errors.otp && (
                <p className="mt-1 text-center text-[11px] text-rose-400">
                  {step2Errors.otp}
                </p>
              )}

              {/* Resend Timer */}
              <div className="mt-2 text-center text-[11px] text-zinc-400">
                {canResend ? (
                  <button
                    type="button"
                    onClick={handleResendCode}
                    className="inline-flex items-center gap-1 font-medium text-indigo-400 hover:text-indigo-300"
                  >
                    <RotateCw className="h-3 w-3" /> Resend code now
                  </button>
                ) : (
                  <span>
                    Resend passcode in{" "}
                    <span className="font-semibold text-zinc-300">
                      {countdown}s
                    </span>
                  </span>
                )}
              </div>
            </div>

            {/* New Password */}
            <div>
              <label
                htmlFor="newPassword"
                className="mb-1 block text-[11px] font-medium text-zinc-300"
              >
                New Enterprise Password
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Lock className="h-3.5 w-3.5 text-zinc-400" />
                </div>
                <input
                  id="newPassword"
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    if (step2Errors.newPassword)
                      setStep2Errors((prev) => ({ ...prev, newPassword: "" }));
                  }}
                  placeholder="Minimum 8 characters"
                  className={`w-full rounded-xl border bg-black/40 py-1.5 pl-8 pr-8 text-xs text-white placeholder-zinc-500 outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 ${step2Errors.newPassword
                      ? "border-rose-500/60 ring-1 ring-rose-500/20"
                      : "border-white/10 hover:border-white/20"
                    }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-2.5 text-zinc-400 hover:text-zinc-200"
                >
                  {showPassword ? (
                    <EyeOff className="h-3.5 w-3.5" />
                  ) : (
                    <Eye className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>
              {step2Errors.newPassword && (
                <p className="mt-0.5 text-[10px] text-rose-400">
                  {step2Errors.newPassword}
                </p>
              )}
            </div>

            {/* Confirm New Password */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="mb-1 block text-[11px] font-medium text-zinc-300"
              >
                Confirm New Password
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Lock className="h-3.5 w-3.5 text-zinc-400" />
                </div>
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (step2Errors.confirmPassword)
                      setStep2Errors((prev) => ({
                        ...prev,
                        confirmPassword: "",
                      }));
                  }}
                  placeholder="Re-enter password"
                  className={`w-full rounded-xl border bg-black/40 py-1.5 pl-8 pr-8 text-xs text-white placeholder-zinc-500 outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 ${step2Errors.confirmPassword
                      ? "border-rose-500/60 ring-1 ring-rose-500/20"
                      : "border-white/10 hover:border-white/20"
                    }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-2.5 text-zinc-400 hover:text-zinc-200"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-3.5 w-3.5" />
                  ) : (
                    <Eye className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>
              {step2Errors.confirmPassword && (
                <p className="mt-0.5 text-[10px] text-rose-400">
                  {step2Errors.confirmPassword}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="group relative flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 via-indigo-600 to-cyan-500 py-2.5 text-xs font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:brightness-110 active:scale-[0.99] disabled:opacity-60 disabled:pointer-events-none cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-white" />
                  <span>Validating & Updating Credentials...</span>
                </>
              ) : (
                <>
                  <span>Confirm & Update Password</span>
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-4 pt-3 border-t border-white/[0.06] text-center">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Change email address</span>
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Success Confirmation State */}
      {step === 3 && (
        <div className="py-2 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-500/40 bg-emerald-500/10 text-emerald-400 shadow-lg shadow-emerald-500/20">
            <CheckCircle2 className="h-6 w-6" />
          </div>

          <h2 className="text-xl font-bold tracking-tight text-white">
            Password Reset Successful
          </h2>
          <p className="mt-1 text-xs text-zinc-400 max-w-[280px] mx-auto">
            Your enterprise access credentials have been renewed. You can now log into your console.
          </p>

          <div className="mt-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-2.5 text-[11px] text-emerald-300">
            Auto-redirecting to sign in portal in{" "}
            <span className="font-bold text-white">{redirectCount}s</span>...
          </div>

          <div className="mt-4">
            <Link
              href="/login"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-indigo-600 py-2.5 text-xs font-semibold text-white shadow-lg shadow-emerald-500/20 transition-all hover:brightness-110 active:scale-[0.99]"
            >
              <span>Proceed to Sign In Now</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
