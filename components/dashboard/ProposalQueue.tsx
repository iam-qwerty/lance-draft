"use client"

import { useState } from "react"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { useUser } from "@clerk/nextjs"
import { Id } from "@/convex/_generated/dataModel"

import { ProposalList } from "./ProposalList"
import { ProposalDetails } from "./ProposalDetails"

type TabType = "draft" | "sent" | "discarded"

export function ProposalQueue() {
  const { user } = useUser()
  const clerkId = user?.id

  // Load User & Account
  const dbUser = useQuery(api.users.getByClerkId, clerkId ? { clerkId } : "skip")
  const accounts = useQuery(api.accounts.getByUser, dbUser?._id ? { userId: dbUser._id } : "skip")
  const primaryAccount = accounts?.[0]

  const [activeTab, setActiveTab] = useState<TabType>("draft")
  const [selectedId, setSelectedId] = useState<Id<"proposals"> | null>(null)

  // Query proposals for this account & status
  const proposals = useQuery(api.proposals.getByAccount,
    primaryAccount?._id ? { upworkAccountId: primaryAccount._id, status: activeTab } : "skip"
  )

  const updateStatus = useMutation(api.proposals.updateStatus)

  // Reset selected when tab changes
  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab)
    setSelectedId(null)
  }

  // Auto-select first item if none selected
  if (proposals && proposals.length > 0 && !selectedId) {
    setSelectedId(proposals[0]._id)
  }

  if (dbUser === undefined || accounts === undefined || proposals === undefined) {
    return (
      <div className="flex h-[calc(100vh-theme(spacing.16))] items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!primaryAccount) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        Please complete onboarding to connect your Upwork account.
      </div>
    )
  }

  const selectedProposal = proposals.find(p => p._id === selectedId)

  return (
    <div className="flex h-[calc(100vh-theme(spacing.16))] overflow-hidden border border-border rounded-xl bg-card">
      {/* Left Panel: List */}
      <ProposalList
        proposals={proposals}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        selectedId={selectedId}
        onSelect={setSelectedId}
      />

      {/* Right Panel: Details */}
      <div className="flex-1 border-l border-border bg-background overflow-y-auto">
        {selectedProposal ? (
          <ProposalDetails
            proposal={selectedProposal}
            onDiscard={() => {
              updateStatus({ proposalId: selectedProposal._id, status: "discarded" })
              setSelectedId(null)
            }}
            onSent={() => {
              // This relies on the Upwork API submission, so we just optimistically update status here.
              // The actual API call will happen inside ProposalDetails.
              updateStatus({ proposalId: selectedProposal._id, status: "sent" })
              setSelectedId(null)
            }}
          />
        ) : (
          <div className="h-full flex items-center justify-center text-muted-foreground p-6 text-center">
            {proposals.length === 0
              ? `No ${activeTab} proposals found. The AI will draft proposals automatically when jobs match your criteria.`
              : "Select a proposal to view details."}
          </div>
        )}
      </div>
    </div>
  )
}
