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
    prisma.user.findUnique({ where: { id: session!.user!.id }, select: { email: true } }),
  ]);

  const signOutForm = (
    <form
      action={async () => {
        "use server";
        await signOut({ redirectTo: "/" });
      }}
    >
      <button className="hover:text-accent transition-colors">Sign out</button>
    </form>
  );

  return (
    <DashboardShell
      profiles={profiles}
      userEmail={user?.email}
      signOutForm={signOutForm}
    >
      {children}
    </DashboardShell>
  );
}
