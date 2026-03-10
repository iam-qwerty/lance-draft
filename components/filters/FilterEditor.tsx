"use client"

import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { useUser } from "@clerk/nextjs"

import { Step4Filters } from "@/components/onboarding/Step4Filters"

export function FilterEditor() {
  const { user } = useUser()
  const clerkId = user?.id

  const dbUser = useQuery(api.users.getByClerkId, clerkId ? { clerkId } : "skip")
  const accounts = useQuery(api.accounts.getByUser, dbUser?._id ? { userId: dbUser._id } : "skip")
  const primaryAccount = accounts?.[0]

  const filters = useQuery(api.filters.getByAccount, primaryAccount?._id ? { upworkAccountId: primaryAccount._id } : "skip")

  if (dbUser === undefined || accounts === undefined || filters === undefined) {
    return (
      <div className="flex justify-center items-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!primaryAccount) {
    return (
      <div className="flex h-48 items-center justify-center text-muted-foreground border border-dashed border-border rounded-xl">
        Please complete onboarding first to set up your filter rules.
      </div>
    )
  }

  return (
    <div className="max-w-2xl border border-border bg-card rounded-xl shadow-sm overflow-hidden flex flex-col p-6 min-h-[500px]">
      <Step4Filters 
        accountId={primaryAccount._id} 
        filters={filters || null}
        onBack={() => {}} // Disabled visually or handled in a different way, but Step4 requires it.
        onFinish={() => {
          alert("Filter rules saved successfully!")
        }}
      />
    </div>
  )
}
