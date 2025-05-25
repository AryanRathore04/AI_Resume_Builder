"use client";

import { Button } from "@/components/ui/button";
import usePremiumModal from "@/hooks/usePremiumModal";

const GetSubscriptionButton = () => {
    const premiumModal = usePremiumModal()
  return (
   <Button onClick={() => premiumModal.setOpen(true)} variant="premium">
    Get Premium Subscription
   </Button>
  )
}

export default GetSubscriptionButton
