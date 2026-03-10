"use client"

import { useState, FormEvent } from "react"
import { useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"

interface Step2ProfileProps {
  accountId: Id<"upworkAccounts">
  profile: any // simplified type for MVP
  onNext: () => void
  onBack: () => void
}

export function Step2Profile({ accountId, profile, onNext, onBack }: Step2ProfileProps) {
  const upsertProfile = useMutation(api.profiles.upsert)

  const [isLoading, setIsLoading] = useState(false)
  const [bio, setBio] = useState(profile?.bio || "")
  const [skillsRaw, setSkillsRaw] = useState((profile?.skills || []).join(", "))
  const [hourlyRateMin, setHourlyRateMin] = useState(profile?.hourlyRateMin || 20)
  const [hourlyRateMax, setHourlyRateMax] = useState(profile?.hourlyRateMax || 50)
  const [tone, setTone] = useState<"conversational" | "professional" | "technical">(
    profile?.tone || "professional"
  )

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      await upsertProfile({
        upworkAccountId: accountId,
        bio,
        skills: skillsRaw.split(",").map((s: string) => s.trim()).filter(Boolean),
        hourlyRateMin: Number(hourlyRateMin),
        hourlyRateMax: Number(hourlyRateMax),
        tone: tone,
        caseStudies: profile?.caseStudies || [],
        writingSamples: profile?.writingSamples || [],
      })
      onNext()
    } catch (error) {
      console.error("Failed to save profile:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-full space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold tracking-tight">Your Profile</h2>
        <p className="text-muted-foreground">
          This context helps the AI draft highly personalized proposals.
        </p>
      </div>

      <div className="space-y-4 flex-1">
        <div className="space-y-2">
          <Label htmlFor="bio">Professional Bio</Label>
          <Textarea
            id="bio"
            placeholder="I am a senior frontend engineer with 5 years of experience..."
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            required
            minLength={50}
            rows={4}
          />
          <p className="text-xs text-muted-foreground">Minimum 50 characters.</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="skills">Core Skills (comma separated)</Label>
          <Input
            id="skills"
            placeholder="React, Next.js, TypeScript, TailwindCSS"
            value={skillsRaw}
            onChange={(e) => setSkillsRaw(e.target.value)}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="minRate">Min Rate ($/hr)</Label>
            <Input
              id="minRate"
              type="number"
              min={5}
              value={hourlyRateMin}
              onChange={(e) => setHourlyRateMin(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="maxRate">Max Rate ($/hr)</Label>
            <Input
              id="maxRate"
              type="number"
              min={Number(hourlyRateMin) || 5}
              value={hourlyRateMax}
              onChange={(e) => setHourlyRateMax(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="tone">Preferred Writing Tone</Label>
          <select
            id="tone"
            value={tone}
            onChange={(e) => setTone(e.target.value as any)}
            className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="conversational">Conversational & Friendly</option>
            <option value="professional">Professional & Direct</option>
            <option value="technical">Technical & Detailed</option>
          </select>
        </div>
      </div>

      <div className="flex justify-between pt-4 border-t border-border">
        <Button type="button" variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          Continue
        </Button>
      </div>
    </form>
  )
}
