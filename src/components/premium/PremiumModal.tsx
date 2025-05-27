"use client";

// Add Razorpay type to the window object
declare global {
  interface Window {
    Razorpay: any;
  }
}

import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Check } from "lucide-react";
import { Button } from "../ui/button";
import usePremiumModal from "@/hooks/usePremiumModal";
import { toast } from "sonner";
import { useUser } from "@clerk/nextjs"; // If using Clerk

const PremiumFeatures = ["AI Tool", "Upto 3 resumes"];
const PremiumPlusFeatures = ["Infinite resumes", "Design customizations"];

const PremiumModal = () => {
  const { open, setOpen } = usePremiumModal();
  const [loading, setLoading] = useState(false);
  const { user } = useUser(); // Optional, if you want email

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  const handleRazorpayCheckout = async (plan: "premium" | "premium-plus") => {
    try {
      setLoading(true);

      const res = await fetch("/api/razorpay/order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ plan }),
      });

      const data = await res.json();

      if (!data.id) {
        throw new Error("Invalid order ID");
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
        amount: data.amount,
        currency: data.currency,
        name: "Resume AI",
        description: `${plan === "premium" ? "Premium" : "Premium Plus"} Subscription`,
        order_id: data.id,
        handler: function (response: any) {
          toast.success("Payment successful!");
          console.log("Razorpay response:", response);
          // Optionally call your backend to confirm payment
        },
        prefill: {
          email: user?.primaryEmailAddress?.emailAddress || "",
        },
        theme: {
          color: "#10b981",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error("Error during Razorpay checkout:", error);
      toast.error("Payment failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        if (!loading) {
          setOpen(open);
        }
      }}
    >
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Resume Builder AI Premium</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <p>Get a premium subscription to unlock more features.</p>
          <div className="flex">
            <div className="flex w-1/2 flex-col space-y-5">
              <h3 className="text-center text-lg font-bold">Premium</h3>
              <ul className="list-inside space-y-2">
                {PremiumFeatures.map((feature) => (
                  <li key={feature} className="flex items-center gap-2">
                    <Check className="size-4 text-green-500" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Button
                onClick={() => handleRazorpayCheckout("premium")}
                disabled={loading}
              >
                Get Premium
              </Button>
            </div>
            <div className="mx-6 border-l" />
            <div className="flex w-1/2 flex-col space-y-5">
              <h3 className="bg-gradient-to-r from-green-600 to-green-400 bg-clip-text text-center text-lg font-bold text-transparent">
                Premium Plus
              </h3>
              <ul className="list-inside space-y-2">
                {PremiumPlusFeatures.map((feature) => (
                  <li key={feature} className="flex items-center gap-2">
                    <Check className="size-4 text-green-500" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Button
                variant="premium"
                onClick={() => handleRazorpayCheckout("premium-plus")}
                disabled={loading}
              >
                Get Premium Plus
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PremiumModal;
