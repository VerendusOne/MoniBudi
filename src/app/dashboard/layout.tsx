import { auth, signOut } from "@/auth";
import { prisma } from "@/lib/prisma";
import { DashboardShell } from "@/components/dashboard/DashboardShell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  const [profiles, user] = await Promise.all([
    prisma.profile.findMany({
      where: { userId: session!.user!.id },
      include: { payAccounts: { orderBy: { createdAt: "asc" }, select: { id: true, name: true } } },
      orderBy: { createdAt: "asc" },
    }),
    prisma.user.findUnique({
      where: { id: session!.user!.id },
      select: { name: true, email: true, image: true },
    }),
  ]);

  const signOutForm = (
    <form
      action={async () => {
        "use server";
        await signOut({ redirectTo: "/" });
      }}
    >
      <button className="w-full px-4 py-2.5 rounded-full text-sm font-medium border border-border hover:border-accent hover:text-accent transition-colors">
        Sign out
      </button>
    </form>
  );

  return (
    <DashboardShell
      profiles={profiles}
      userName={user?.name}
      userEmail={user?.email}
      avatarUrl={user?.image ?? null}
      signOutForm={signOutForm}
    >
      {children}
    </DashboardShell>
  );
}
