import LoadingButton from "@/components/LoadingButton";
import { ResumeValues } from "@/lib/validation";
import { WandSparklesIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { generateSummary } from "./action";

interface GenerateSummaryButtonProps {
  resumeData: ResumeValues;
  onSummaryGenerated: (summary: string) => void;
}

const GenerateSummaryButton = ({
  resumeData,
  onSummaryGenerated,
}: GenerateSummaryButtonProps) => {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    //TODO : Block for non-premium users
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
