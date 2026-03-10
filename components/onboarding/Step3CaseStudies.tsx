"use client"

import { useState } from "react"
import { useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Loader2, Plus, Trash2 } from "lucide-react"

interface CaseStudy {
  title: string
  problem: string
  solution: string
  skillsUsed: string[]
  result: string
}

interface Step3CaseStudiesProps {
  accountId: Id<"upworkAccounts">
  profile: any
  onNext: () => void
  onBack: () => void
}

export function Step3CaseStudies({ accountId, profile, onNext, onBack }: Step3CaseStudiesProps) {
  const upsertProfile = useMutation(api.profiles.upsert)

  const [isLoading, setIsLoading] = useState(false)
  
  // Track studies. Default to one empty if none exist.
  const [studies, setStudies] = useState<CaseStudy[]>(
    profile?.caseStudies?.length ? profile.caseStudies : [
      { title: "", problem: "", solution: "", skillsUsed: [], result: "" }
    ]
  )

  const handleUpdate = (index: number, field: keyof CaseStudy, value: string) => {
    const newStudies = [...studies]
    if (field === "skillsUsed") {
      newStudies[index][field] = value.split(",").map((s) => s.trim()).filter(Boolean)
    } else {
      newStudies[index][field] = value as any
    }
    setStudies(newStudies)
  }

  const addStudy = () => {
    setStudies([...studies, { title: "", problem: "", solution: "", skillsUsed: [], result: "" }])
  }

  const removeStudy = (index: number) => {
    const newStudies = [...studies]
    newStudies.splice(index, 1)
    setStudies(newStudies)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    // Filter out completely empty case studies to avoid garbage data
    const validStudies = studies.filter(s => s.title.trim().length > 0)
    
    try {
      await upsertProfile({
        upworkAccountId: accountId,
        bio: profile.bio || "",
        skills: profile.skills || [],
        hourlyRateMin: profile.hourlyRateMin || 0,
        hourlyRateMax: profile.hourlyRateMax || 0,
        tone: profile.tone || "professional",
        writingSamples: profile.writingSamples || [],
        caseStudies: validStudies,
      })
      onNext()
    } catch (error) {
      console.error("Failed to save case studies:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const isFormValid = studies.some(s => s.title && s.problem && s.solution && s.result)

  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-full space-y-6 overflow-hidden">
      <div className="space-y-2 shrink-0">
        <h2 className="text-2xl font-bold tracking-tight">Case Studies</h2>
        <p className="text-muted-foreground text-sm">
          Add at least one relevant project. The AI will inject the most relevant case study into your proposals to build credibility.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto space-y-8 pr-2 pb-4">
        {studies.map((study, idx) => (
          <div key={idx} className="p-4 rounded-lg border border-border bg-card/50 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-primary">Case Study {idx + 1}</h3>
              {studies.length > 1 && (
                <Button type="button" variant="ghost" size="icon" onClick={() => removeStudy(idx)} className="text-muted-foreground hover:text-destructive shrink-0">
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label>Project Title</Label>
                <Input 
                  placeholder="e.g. Migration from React to Next.js for E-commerce Client" 
                  value={study.title}
                  onChange={(e) => handleUpdate(idx, "title", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label>The Problem</Label>
                <Textarea 
                  placeholder="What was the client's core pain point or challenge?" 
                  rows={2}
                  value={study.problem}
                  onChange={(e) => handleUpdate(idx, "problem", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label>Your Solution</Label>
                <Textarea 
                  placeholder="How did you solve it? What was your approach?" 
                  rows={2}
                  value={study.solution}
                  onChange={(e) => handleUpdate(idx, "solution", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label>The Result (Include metrics if possible)</Label>
                <Input 
                  placeholder="e.g. Increased page load speed by 40%, boosting conversions." 
                  value={study.result}
                  onChange={(e) => handleUpdate(idx, "result", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label>Skills Used (comma separated)</Label>
                <Input 
                  placeholder="React, Next.js, Vercel" 
                  value={study.skillsUsed.join(", ")}
                  onChange={(e) => handleUpdate(idx, "skillsUsed", e.target.value)}
                  required
                />
              </div>
            </div>
          </div>
        ))}

        <Button type="button" variant="outline" onClick={addStudy} className="w-full border-dashed">
          <Plus className="w-4 h-4 mr-2" />
          Add Another Case Study
        </Button>
      </div>

      <div className="flex justify-between pt-4 border-t border-border shrink-0">
        <Button type="button" variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button type="submit" disabled={isLoading || !isFormValid}>
          {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          Continue
        </Button>
      </div>
    </form>
  )
}
