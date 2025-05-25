"use client";

import LoadingButton from "@/components/LoadingButton";
import { useState } from "react";
import { toast } from "sonner";
import { createCustomerPortalSession } from "./action";

const ManageSubscriptionButton = () => {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    try {
      setLoading(true);
      const redirectUrl = await createCustomerPortalSession();
      window.location.href = redirectUrl;
    } catch (error) {
      console.error(error);
      toast.error("Failed to manage subscription. Please try again later.");
    } finally {
      setLoading(false);
    }
  }
  return (
    <LoadingButton onClick={handleClick} loading={loading}>
      Manage Subscription
    </LoadingButton>
  );
};

export default ManageSubscriptionButton;
