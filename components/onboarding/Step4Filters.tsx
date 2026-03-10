"use client"

import { useState } from "react"
import { useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Plus, X } from "lucide-react"

interface Step4FiltersProps {
  accountId: Id<"upworkAccounts">
  filters: any // simplified type for MVP
  onBack: () => void
  onFinish: () => void
}

export function Step4Filters({ accountId, filters, onBack, onFinish }: Step4FiltersProps) {
  const upsertFilters = useMutation(api.filters.upsert)

  const [isLoading, setIsLoading] = useState(false)
  const [minBudget, setMinBudget] = useState(filters?.minBudget || 100)
  const [minClientRating, setMinClientRating] = useState(filters?.minClientRating || 4.0)
  const [requirePaymentVerified, setRequirePaymentVerified] = useState(
    filters?.requirePaymentVerified ?? true
  )
  const [maxProposalsPerDay, setMaxProposalsPerDay] = useState(filters?.maxProposalsPerDay || 5)

  // Keyword array state
  const [requiredKeywords, setRequiredKeywords] = useState<string[]>(filters?.requiredKeywords || [])
  const [excludedKeywords, setExcludedKeywords] = useState<string[]>(filters?.excludedKeywords || [])

  // Input state for adding new keywords
  const [reqInput, setReqInput] = useState("")
  const [excInput, setExcInput] = useState("")

  const addKeyword = (type: "required" | "excluded", e?: React.KeyboardEvent | React.MouseEvent) => {
    if (e && 'key' in e && e.key !== 'Enter') return
    if (e) e.preventDefault()

    if (type === "required" && reqInput.trim()) {
      if (!requiredKeywords.includes(reqInput.trim())) {
        setRequiredKeywords([...requiredKeywords, reqInput.trim()])
      }
      setReqInput("")
    } else if (type === "excluded" && excInput.trim()) {
      if (!excludedKeywords.includes(excInput.trim())) {
        setExcludedKeywords([...excludedKeywords, excInput.trim()])
      }
      setExcInput("")
    }
  }

  const removeKeyword = (type: "required" | "excluded", word: string) => {
    if (type === "required") {
      setRequiredKeywords(requiredKeywords.filter((k) => k !== word))
    } else {
      setExcludedKeywords(excludedKeywords.filter((k) => k !== word))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await upsertFilters({
        upworkAccountId: accountId,
        minBudget: Number(minBudget),
        jobTypes: ["fixed", "hourly"], // Support both by default
        requiredKeywords,
        excludedKeywords,
        requirePaymentVerified: Boolean(requirePaymentVerified),
        minClientRating: Number(minClientRating),
        maxProposalsPerDay: Number(maxProposalsPerDay),
      })
      onFinish() // Will unlock "Go Live"
    } catch (error) {
      console.error("Failed to save filters:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-full space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold tracking-tight">Filter Rules</h2>
        <p className="text-muted-foreground text-sm">
          Set strictly enforced boundaries. The system will ONLY process jobs matching these criteria.
        </p>
      </div>

      <div className="space-y-6 flex-1 overflow-y-auto pr-2 pb-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="minBudget">Minimum Fixed Budget ($)</Label>
            <Input
              id="minBudget"
              type="number"
              min={0}
              value={minBudget}
              onChange={(e) => setMinBudget(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="minClientRating">Min Client Rating (0-5)</Label>
            <Input
              id="minClientRating"
              type="number"
              step="0.1"
              min={0}
              max={5}
              value={minClientRating}
              onChange={(e) => setMinClientRating(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="space-y-3">
          <Label>Required Keywords (ALL must be present)</Label>
          <div className="flex gap-2">
            <Input
              placeholder="e.g. Next.js"
              value={reqInput}
              onChange={(e) => setReqInput(e.target.value)}
              onKeyDown={(e) => addKeyword("required", e)}
            />
            <Button type="button" variant="secondary" onClick={(e) => addKeyword("required", e)}>
              Add
            </Button>
          </div>
          {requiredKeywords.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {requiredKeywords.map((word) => (
                <div key={word} className="flex items-center gap-1 bg-secondary text-secondary-foreground px-2 py-1 rounded-md text-sm border border-border">
                  {word}
                  <button type="button" onClick={() => removeKeyword("required", word)} className="hover:text-destructive text-muted-foreground transition-colors">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-3">
          <Label>Excluded Keywords (ANY presence skips job)</Label>
          <div className="flex gap-2">
            <Input
              placeholder="e.g. equity, rev share, low budget"
              value={excInput}
              onChange={(e) => setExcInput(e.target.value)}
              onKeyDown={(e) => addKeyword("excluded", e)}
            />
            <Button type="button" variant="secondary" onClick={(e) => addKeyword("excluded", e)}>
              Add
            </Button>
          </div>
          {excludedKeywords.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {excludedKeywords.map((word) => (
                <div key={word} className="flex items-center gap-1 bg-destructive/10 text-destructive-foreground px-2 py-1 rounded-md text-sm border border-destructive/20">
                  {word}
                  <button type="button" onClick={() => removeKeyword("excluded", word)} className="hover:text-destructive opacity-80 hover:opacity-100 transition-colors">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4 pt-4 border-t border-border">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={requirePaymentVerified}
              onChange={(e) => setRequirePaymentVerified(e.target.checked)}
              className="w-4 h-4 rounded border-border text-primary accent-primary bg-background"
            />
            <span className="text-sm font-medium">Require Payment Verified Client</span>
          </label>
          
          <div className="space-y-2 max-w-[200px]">
            <Label htmlFor="maxProposals">Daily Proposal Draft Cap</Label>
            <Input
              id="maxProposals"
              type="number"
              min={1}
              max={15}
              value={maxProposalsPerDay}
              onChange={(e) => setMaxProposalsPerDay(e.target.value)}
              required
            />
            <p className="text-xs text-muted-foreground whitespace-nowrap">Hard limit: 15 per day.</p>
          </div>
        </div>
      </div>

      <div className="flex justify-between pt-4 border-t border-border shrink-0">
        <Button type="button" variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          Save Filters
        </Button>
      </div>
    </form>
  )
}
