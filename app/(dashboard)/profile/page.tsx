import { ProfileEditor } from "@/components/profile/ProfileEditor"

export default function ProfilePage() {
  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Profile</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your freelancer profile and case studies
        </p>
      </div>

      <ProfileEditor />
    </div>
  )
}
