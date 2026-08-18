import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ThemeSelector } from "@/components/settings/ThemeSelector";
import { AccountForm } from "@/components/settings/AccountForm";

export default async function SettingsPage() {
  const session = await auth();
  // Read the User record directly rather than trusting the JWT session,
  // so an edit made below shows up immediately instead of waiting for the
  // session token to be reissued on next login.
  const user = await prisma.user.findUnique({
    where: { id: session!.user!.id },
    select: { name: true, email: true },
  });

  return (
    <div className="max-w-2xl flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Settings</h1>

      <section className="bg-card border border-border rounded-2xl p-6 flex flex-col gap-4">
        <h2 className="font-medium">Appearance</h2>
        <ThemeSelector />
      </section>

      <section className="bg-card border border-border rounded-2xl p-6 flex flex-col gap-4">
        <h2 className="font-medium">Your Account</h2>
        <AccountForm name={user?.name ?? null} email={user?.email ?? null} />
      </section>
    </div>
  );
}
