export default function DashboardPage() {
  return (
    <div className="h-full flex items-center justify-center text-center">
      <div className="max-w-sm">
        <h1 className="text-xl font-semibold mb-2">Welcome</h1>
        <p className="text-muted-foreground text-sm">
          Select a profile and account from the sidebar, or create a new
          profile to get started.
        </p>
      </div>
    </div>
  );
}
