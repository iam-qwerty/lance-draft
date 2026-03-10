import { OnboardingWizard } from "@/components/onboarding/OnboardingWizard"

export default function OnboardingPage() {
  return (
    <div className="p-6 md:p-10 w-full min-h-[calc(100vh-theme(spacing.16))]">
      <OnboardingWizard />
    </div>
  )
}

