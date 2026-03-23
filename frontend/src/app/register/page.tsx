"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Zap, Loader2 } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();

  useEffect(() => {
    // Public registration is disabled. Only admins can create users via the dashboard.
    const timer = setTimeout(() => {
      router.replace("/login");
    }, 4000);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="text-center space-y-6 max-w-sm"
      >
        <div className="glow w-16 h-16 mx-auto rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
          <Zap className="w-8 h-8 text-primary" />
        </div>
        
        <div className="space-y-3">
          <h1 className="text-2xl font-black text-foreground tracking-tight">Registration Disabled</h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Taskpholio is an invite-only platform. Please ask your CEO or CTO to create an account for you from their Admin Dashboard.
          </p>
        </div>

        <div className="flex items-center justify-center gap-2 text-sm text-primary font-semibold mt-8 bg-primary/5 py-2 px-4 rounded-lg w-max mx-auto border border-primary/10">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Redirecting to login...</span>
        </div>
      </motion.div>
    </div>
  );
}
