import { FilterEditor } from "@/components/filters/FilterEditor"

export default function FiltersPage() {
  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Filters</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Configure how jobs are matched and filtered
        </p>
      </div>

      <FilterEditor />
    </div>
  )
}
