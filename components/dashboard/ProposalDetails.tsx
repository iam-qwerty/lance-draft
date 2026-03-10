"use client"

import { useState } from "react"
import { useMutation, useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ExternalLink, Loader2, Send, Trash2, Zap } from "lucide-react"

interface ProposalDetailsProps {
  proposal: any // using robust `any` MVP type since convex schema deeply infers it
  onDiscard: () => void
  onSent: () => void
}

export function ProposalDetails({ proposal, onDiscard, onSent }: ProposalDetailsProps) {
  const [content, setContent] = useState(proposal.content)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const updateContent = useMutation(api.proposals.updateContent)
  // Get tokens from the parent context indirectly, or fetch here
  
  const job = proposal.jobDetails

  const handleSaveDraft = async () => {
    await updateContent({ proposalId: proposal._id, content, isUserEdit: true })
  }

  const handleSend = async () => {
    // Phase 5 API Integration: We need to pull Upwork token from client's proxy.
    // Since Upwork API is server-side with strict CORS and no browser client is allowed,
    // we would call a Next.js API route that submits the proposal using the backend. 
    // For now, we simulate this per the spec note: "Requires Upwork API approval... users can copy/paste as fallback"
    setIsSubmitting(true)
    
    try {
      // Optimistic update — we'll treat it as successful copy/paste manual submission
      // or future API submission.
      await new Promise(resolve => setTimeout(resolve, 800))
      onSent()
    } catch (err) {
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header — Job Info */}
      <div className="p-6 border-b border-border bg-card/30 shrink-0">
        <div className="flex items-start justify-between gap-4 mb-4">
          <h2 className="text-xl font-bold leading-tight">{job?.title || "Job Title"}</h2>
          <Button variant="outline" size="sm" asChild className="shrink-0">
            <a href={job?.link} target="_blank" rel="noopener noreferrer">
              View on Upwork <ExternalLink className="w-3 h-3 ml-2" />
            </a>
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
          <div>
            <span className="font-semibold text-foreground">Budget:</span>{" "}
            {job?.budgetType === "hourly" 
              ? `$${job.budgetMin}-$${job.budgetMax}/hr`
              : `$${job?.budgetMin || "Negotiable"}`}
          </div>
          <div>
            <span className="font-semibold text-foreground">Posted:</span>{" "}
            {new Date(job?.postedAt || Date.now()).toLocaleString()}
          </div>
          {job?.skillsRequired && job.skillsRequired.length > 0 && (
            <div className="w-full mt-2 flex flex-wrap gap-1">
              {job.skillsRequired.map((s: string) => (
                <span key={s} className="px-2 py-0.5 bg-secondary text-secondary-foreground text-xs rounded border border-border">
                  {s}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* AI Score Badge */}
      <div className="px-6 py-3 border-b border-border bg-primary/5 flex items-center gap-3 shrink-0">
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/20 text-primary">
          <Zap className="w-4 h-4" />
        </div>
        <div>
          <div className="text-sm font-semibold text-foreground flex items-center gap-2">
            AI Relevance Score: {proposal.aiScore}/10
          </div>
          <div className="text-xs text-muted-foreground">
            {proposal.aiReason}
          </div>
        </div>
      </div>

      {/* Editor Area */}
      <div className="flex-1 p-6 flex flex-col min-h-0">
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-semibold">Drafted Proposal</label>
          {proposal.status === "draft" && content !== proposal.content && (
            <span className="text-xs text-muted-foreground italic">Unsaved changes</span>
          )}
        </div>
        
        <Textarea 
          className="flex-1 resize-none font-mono text-sm p-4 leading-relaxed tracking-wide bg-background focus-visible:ring-1"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onBlur={handleSaveDraft}
          disabled={proposal.status !== "draft"}
        />
      </div>

      {/* Actions Footer */}
      {proposal.status === "draft" && (
        <div className="p-4 border-t border-border bg-card/50 flex justify-between items-center shrink-0">
          <div className="flex gap-2">
            <Button variant="ghost" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={onDiscard}>
              <Trash2 className="w-4 h-4 mr-2" />
              Discard
            </Button>
            
            <Button variant="outline" onClick={() => console.log('Regenerate clicked')}>
              <Zap className="w-4 h-4 mr-2" />
              Regenerate
            </Button>
          </div>

          <Button size="lg" onClick={handleSend} disabled={isSubmitting} className="glow">
            {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
            Send to Upwork
          </Button>
        </div>
      )}
    </div>
  )
}
