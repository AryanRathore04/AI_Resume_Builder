import LoadingButton from "@/components/LoadingButton";
import { ResumeValues } from "@/lib/validation";
import { WandSparklesIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { generateSummary } from "./action";
import usePremiumModal from "@/hooks/usePremiumModal";
import { useSubscriptionLevel } from "../../SubscriptionLevelProvider";
import { canUseAITools } from "@/lib/permissions";

interface GenerateSummaryButtonProps {
  resumeData: ResumeValues;
  onSummaryGenerated: (summary: string) => void;
}

const GenerateSummaryButton = ({
  resumeData,
  onSummaryGenerated,
}: GenerateSummaryButtonProps) => {
   const subscriptionLevel = useSubscriptionLevel();

  const premiumModal = usePremiumModal();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
     if (!canUseAITools(subscriptionLevel)) {
                premiumModal.setOpen(true);
                return;
              }
    try {
        setLoading(true);
        const aiResponse = await generateSummary(resumeData);
        onSummaryGenerated(aiResponse);
    } catch (error) {
        console.error("Error generating summary:", error);
        toast.error("Failed to generate summary. Please try again.");
    } finally {
        setLoading(false);
    }
  }

  return (
    <LoadingButton
      variant="outline"
      type="button"
      onClick={handleClick}
      loading={loading}
    >
      <WandSparklesIcon className="size-4" />
      Generate (AI)
    </LoadingButton>
  );
};

export default GenerateSummaryButton;
