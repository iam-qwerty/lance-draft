"use client"

import { Id } from "@/convex/_generated/dataModel"
import { formatRelativeTime } from "@/lib/utils"

type TabType = "draft" | "sent" | "discarded"

interface ProposalListProps {
  proposals: any[]
  activeTab: TabType
  onTabChange: (tab: TabType) => void
  selectedId: Id<"proposals"> | null
  onSelect: (id: Id<"proposals">) => void
}

export function ProposalList({ proposals, activeTab, onTabChange, selectedId, onSelect }: ProposalListProps) {
  const TABS: { id: TabType; label: string }[] = [
    { id: "draft", label: "Drafts" },
    { id: "sent", label: "Sent" },
    { id: "discarded", label: "Discarded" },
  ]

  return (
    <div className="w-1/3 min-w-[300px] max-w-[400px] flex flex-col h-full bg-sidebar">
      {/* Tabs */}
      <div className="flex items-center p-2 border-b border-border gap-1 shrink-0">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors
              ${activeTab === tab.id 
                ? "bg-secondary text-foreground shadow-sm" 
                : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {proposals.map(proposal => {
          const isSelected = selectedId === proposal._id
          const isHigh = proposal.aiScore >= 8
          
          return (
            <button
              key={proposal._id}
              onClick={() => onSelect(proposal._id)}
              className={`w-full text-left p-3 rounded-lg transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
                ${isSelected 
                  ? "bg-primary/10 border-primary/20" 
                  : "hover:bg-secondary/60 border-transparent"} 
                border`}
            >
              <div className="flex items-start justify-between gap-2 mb-1">
                <span className={`text-xs font-bold px-1.5 py-0.5 rounded
                  ${isHigh ? "score-high" : "score-mid"}`}
                >
                  {proposal.aiScore}/10
                </span>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {formatRelativeTime(proposal._creationTime)}
                </span>
              </div>
              
              <h4 className={`text-sm font-medium line-clamp-2 leading-tight
                ${isSelected ? "text-primary" : "text-foreground"}`}
              >
                {proposal.jobDetails?.title || "Unknown Job"}
              </h4>
              
              <p className="text-xs text-muted-foreground mt-1.5 line-clamp-1">
                {proposal.jobDetails?.budgetType === "hourly" 
                  ? `Hourly: $${proposal.jobDetails.budgetMin || 0}-$${proposal.jobDetails.budgetMax || 0}`
                  : `Fixed: $${proposal.jobDetails?.budgetMin || 0}`}
              </p>
            </button>
          )
        })}
        
        {proposals.length === 0 && (
          <div className="text-center py-8 text-xs text-muted-foreground px-4">
            No {activeTab} proposals found.
          </div>
        )}
      </div>
    </div>
  )
}
