"use client"

import { useState, useEffect } from "react"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { useUser } from "@clerk/nextjs"
import { useRouter } from "next/navigation"

import { Step1Connect } from "./Step1Connect"
import { Step2Profile } from "./Step2Profile"
import { Step3CaseStudies } from "./Step3CaseStudies"
import { Step4Filters } from "./Step4Filters"
import { Button } from "@/components/ui/button"

const STEPS = [
  { id: 1, title: "Connect Upwork" },
  { id: 2, title: "Your Profile" },
  { id: 3, title: "Case Studies" },
  { id: 4, title: "Filter Rules" },
]

export function OnboardingWizard() {
  const router = useRouter()
  const { user } = useUser()
  const clerkId = user?.id

  // 1. Fetch DB user
  const dbUser = useQuery(api.users.getByClerkId, clerkId ? { clerkId } : "skip")

  // 2. Fetch Accounts
  const accounts = useQuery(api.accounts.getByUser, dbUser?._id ? { userId: dbUser._id } : "skip")
  const primaryAccount = accounts?.[0]

  // 3. Fetch Profile & Filters
  const profile = useQuery(api.profiles.getByAccount, primaryAccount?._id ? { upworkAccountId: primaryAccount._id } : "skip")
  const filters = useQuery(api.filters.getByAccount, primaryAccount?._id ? { upworkAccountId: primaryAccount._id } : "skip")

  const [currentStep, setCurrentStep] = useState(1)

  // Auto-advance step 1 if connected
  useEffect(() => {
    if (primaryAccount && currentStep === 1) {
      setCurrentStep(2)
    }
  }, [primaryAccount, currentStep])

  if (dbUser === undefined || accounts === undefined) {
    return (
      <div className="flex justify-center items-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  const isComplete = profile?.isComplete && filters?.minBudget !== undefined

  const handleGoLive = () => {
    if (isComplete) {
      router.push("/dashboard")
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress Header */}
      <div className="flex items-center justify-between mb-8 relative">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-[2px] bg-secondary border-b border-border -z-10" />
        
        {STEPS.map((step) => {
          const isActive = step.id === currentStep
          const isPast = step.id < currentStep
          
          return (
            <button
              key={step.id}
              onClick={() => step.id < currentStep && setCurrentStep(step.id)}
              disabled={step.id > currentStep}
              className="flex flex-col items-center gap-2 group bg-background px-2"
            >
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full border-2 text-sm font-semibold transition-colors ${
                  isActive ? "border-primary bg-primary text-primary-foreground" : 
                  isPast ? "border-primary bg-primary/20 text-primary" : 
                  "border-border bg-secondary text-muted-foreground"
                }`}
              >
                {step.id}
              </div>
              <span className={`text-xs font-medium ${isActive || isPast ? "text-foreground" : "text-muted-foreground"}`}>
                {step.title}
              </span>
            </button>
          )
        })}
      </div>

      {/* Step Content */}
      <div className="bg-card border border-border rounded-xl p-6 shadow-sm min-h-[400px]">
        {currentStep === 1 && (
          <Step1Connect 
            isConnected={!!primaryAccount} 
            onNext={() => setCurrentStep(2)} 
          />
        )}
        
        {currentStep === 2 && primaryAccount && (
          <Step2Profile 
            accountId={primaryAccount._id} 
            profile={profile || null}
            onNext={() => setCurrentStep(3)} 
            onBack={() => setCurrentStep(1)}
          />
        )}
        
        {currentStep === 3 && primaryAccount && (
          <Step3CaseStudies 
            accountId={primaryAccount._id} 
            profile={profile || null}
            onNext={() => setCurrentStep(4)} 
            onBack={() => setCurrentStep(2)}
          />
        )}
        
        {currentStep === 4 && primaryAccount && (
          <Step4Filters 
            accountId={primaryAccount._id} 
            filters={filters || null}
            onBack={() => setCurrentStep(3)}
            onFinish={() => {
              // Stay on step 4, let user click Go Live below
            }}
          />
        )}
      </div>

      {/* Go Live Button */}
      <div className="mt-8 flex justify-end">
        <Button 
          size="lg" 
          disabled={!isComplete} 
          onClick={handleGoLive}
          className={`${isComplete ? "glow animate-pulse" : ""}`}
        >
          Go Live — Start Drafting
        </Button>
      </div>
    </div>
  )
}

