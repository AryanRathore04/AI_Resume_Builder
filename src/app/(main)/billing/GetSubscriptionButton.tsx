"use client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function GetSubscriptionButton() {
  const handleSubscribe = async () => {
    try {
      const res = await fetch("/api/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: 499 }),
      });
      const { id, amount, currency } = await res.json();

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
        amount,
        currency,
        name: "AI Resume Builder",
        description: "Premium Subscription",
        order_id: id,
        handler: () => {
          toast.success("Payment successful! Check webhook to confirm.");
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error(err);
      toast.error("Failed to start payment");
    }
  };

  return (
    <Button onClick={handleSubscribe} variant="premium">
      Get Premium Subscription
    </Button>
  );
}
