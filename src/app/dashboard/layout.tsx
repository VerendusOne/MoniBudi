import { auth, signOut } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Sidebar } from "@/components/dashboard/Sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  const profiles = await prisma.profile.findMany({
    where: { userId: session!.user!.id },
    include: { payAccounts: { orderBy: { createdAt: "asc" }, select: { id: true, name: true } } },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="flex-1 flex flex-col">
      <header className="border-b border-border px-6 py-4 flex items-center justify-between">
        <a href="/dashboard" className="font-semibold">
          Budget App
        </a>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>{session?.user?.email}</span>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/" });
            }}
          >
            <button className="hover:text-accent transition-colors">
              Sign out
            </button>
          </form>
        </div>
      </header>
      <div className="flex-1 flex min-h-0">
        <Sidebar profiles={profiles} />
        <div className="flex-1 p-6 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
