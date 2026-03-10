import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";

import { Sidebar } from "@/components/layout/Sidebar";

/**
 * Dashboard layout with sidebar navigation.
 * All routes under /(dashboard)/ share this layout.
 * Protected — redirects to sign-in if not authenticated.
 */
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-background">
        {children}
      </main>
    </div>
  );
}
