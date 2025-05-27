"use client";
import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Check } from "lucide-react";
import { Button } from "../ui/button";
import usePremiumModal from "@/hooks/usePremiumModal";
import { toast } from "sonner";
import { useUser } from "@clerk/nextjs";

const PremiumModal = () => {
  const { open, setOpen } = usePremiumModal();
  const [loading, setLoading] = useState(false);
  const { user } = useUser();

  useEffect(() => {
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.async = true;
    document.body.appendChild(s);
  }, []);

  const checkout = async (plan: "premium" | "premium-plus") => {
    setLoading(true);
    try {
      const res = await fetch("/api/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const { id, amount, currency } = await res.json();
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
        amount,
        currency,
        name: "AI Resume Builder",
        description: plan === "premium" ? "Premium Plan" : "Premium Plus Plan",
        order_id: id,
        prefill: { email: user?.primaryEmailAddress?.emailAddress || "" },
        handler: () => toast.success("Payment successful!"),
        theme: { color: "#10b981" },
      };
      new (window as any).Razorpay(options).open();
    } catch {
      toast.error("Payment initiation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !loading && setOpen(o)}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Upgrade to Premium</DialogTitle>
        </DialogHeader>
        {/* … your feature lists … */}
        <Button onClick={() => checkout("premium")} disabled={loading}>
          Get Premium
        </Button>
        <Button
          variant="premium"
          onClick={() => checkout("premium-plus")}
          disabled={loading}
        >
          Get Premium Plus
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default PremiumModal;
