"use client"

import { useState } from "react"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { useUser } from "@clerk/nextjs"

import { Step2Profile } from "@/components/onboarding/Step2Profile"
import { Step3CaseStudies } from "@/components/onboarding/Step3CaseStudies"

export function ProfileEditor() {
  const { user } = useUser()
  const clerkId = user?.id

  const dbUser = useQuery(api.users.getByClerkId, clerkId ? { clerkId } : "skip")
  const accounts = useQuery(api.accounts.getByUser, dbUser?._id ? { userId: dbUser._id } : "skip")
  const primaryAccount = accounts?.[0]

  const profile = useQuery(api.profiles.getByAccount, primaryAccount?._id ? { upworkAccountId: primaryAccount._id } : "skip")

  const [activeTab, setActiveTab] = useState<"basics" | "case_studies">("basics")

  if (dbUser === undefined || accounts === undefined || profile === undefined) {
    return (
      <div className="flex justify-center items-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!primaryAccount || !profile) {
    return (
      <div className="flex h-48 items-center justify-center text-muted-foreground border border-dashed border-border rounded-xl">
        Please complete onboarding first to set up your profile.
      </div>
    )
  }

  return (
    <div className="max-w-3xl border border-border bg-card rounded-xl shadow-sm overflow-hidden flex flex-col min-h-[600px]">
      <div className="flex border-b border-border bg-sidebar/50 shrink-0">
        <button
          onClick={() => setActiveTab("basics")}
          className={`flex-1 py-3 text-sm font-semibold transition-colors ${activeTab === "basics" ? "border-b-2 border-primary text-foreground" : "text-muted-foreground hover:text-foreground"}`}
        >
          Basic Info & Rates
        </button>
        <button
          onClick={() => setActiveTab("case_studies")}
          className={`flex-1 py-3 text-sm font-semibold transition-colors ${activeTab === "case_studies" ? "border-b-2 border-primary text-foreground" : "text-muted-foreground hover:text-foreground"}`}
        >
          Case Studies
        </button>
      </div>

      <div className="p-6 flex-1 overflow-auto">
        {activeTab === "basics" ? (
          <Step2Profile 
            accountId={primaryAccount._id} 
            profile={profile}
            onNext={() => setActiveTab("case_studies")} // Act as 'Save & Continue'
            onBack={() => {}} // Disabled visually or handled in a different way, but Step2 requires it.
          />
        ) : (
          <Step3CaseStudies 
            accountId={primaryAccount._id} 
            profile={profile}
            onNext={() => {
              // Just saved
              alert("Case studies saved successfully!")
            }}
            onBack={() => setActiveTab("basics")}
          />
        )}
      </div>
    </div>
  )
}
