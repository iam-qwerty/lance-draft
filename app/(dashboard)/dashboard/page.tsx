import { ProposalQueue } from "@/components/dashboard/ProposalQueue"

export default function DashboardPage() {
  return (
    <div className="p-4 md:p-6 w-full h-full">
      <div className="mb-4">
        <h1 className="text-2xl font-bold tracking-tight">Proposals</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Review AI-drafted proposals and send them to Upwork
        </p>
      </div>

      <ProposalQueue />
    </div>
  )
}

