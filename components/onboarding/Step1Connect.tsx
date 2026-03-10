"use client"

import { Button } from "@/components/ui/button"
import { Info, CheckCircle2 } from "lucide-react"
import Link from "next/link"

interface Step1ConnectProps {
  isConnected: boolean
  onNext: () => void
}

export function Step1Connect({ isConnected, onNext }: Step1ConnectProps) {
  if (isConnected) {
    return (
      <div className="flex flex-col items-center justify-center text-center h-full space-y-4 py-12">
        <CheckCircle2 className="w-16 h-16 text-primary" />
        <h2 className="text-2xl font-bold tracking-tight">Account Connected</h2>
        <p className="text-muted-foreground">
          Your Upwork account is successfully linked.
        </p>
        <Button onClick={onNext} className="mt-6">Continue to Profile</Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold tracking-tight">Connect Upwork</h2>
        <p className="text-muted-foreground">
          Link your Upwork account so LanceDraft can submit proposals on your behalf.
        </p>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center py-8">
        <Button size="lg" asChild className="mb-6 glow">
          <Link href="/api/upwork/connect">
            Connect Upwork Account
          </Link>
        </Button>

        <div className="flex items-start gap-3 p-4 bg-secondary/50 rounded-lg border border-border max-w-md text-sm text-muted-foreground">
          <Info className="w-5 h-5 text-primary shrink-0" />
          <p>
            You will be redirected to Upwork to authorize standard read/write access. 
            We never store your Upwork password.
          </p>
        </div>
      </div>
    </div>
  )
}
