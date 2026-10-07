"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function SupplierRegisterRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/register?role=SUPPLIER");
  }, [router]);

  return (
    <div className="min-h-screen bg-[#070a12] flex flex-col items-center justify-center text-white">
      <Loader2 className="h-8 w-8 animate-spin text-emerald-400 mb-3" />
      <p className="text-sm text-zinc-400 font-medium">
        Redirecting to Supplier Registration Portal...
      </p>
    </div>
  );
}
