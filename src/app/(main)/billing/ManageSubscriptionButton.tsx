"use client";
import { useState } from "react";
import { toast } from "sonner";

export default function ManageSubscriptionButton() {
  const [loading, setLoading] = useState(false);

  const handleCancel = async () => {
    setLoading(true);
    try {
      await fetch("/api/razorpay/cancel-subscription", { method: "POST" });
      toast.success("Cancellation scheduled");
      window.location.reload();
    } catch {
      toast.error("Cancellation failed");
    } finally {
      setLoading(false);
    }
  };

  return <button onClick={handleCancel} disabled={loading}>Cancel Subscription</button>;
}