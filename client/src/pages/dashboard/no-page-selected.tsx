export function NoPageSelected() {
  return (
    <div className="rounded-lg border border-dashed border-neutral-300 bg-white px-6 py-16 text-center text-neutral-600">
      <p className="text-lg font-medium text-neutral-800">Select a page</p>
      <p className="mt-2 text-sm">Pick a page in the sidebar or create a new one.</p>
    </div>
  );
}
