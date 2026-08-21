import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { deleteProfile } from "@/lib/actions/profiles";
import { DangerZone } from "@/components/dashboard/DangerZone";

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ profileId: string }>;
}) {
  const { profileId } = await params;
  const session = await auth();

  const profile = await prisma.profile.findFirst({
    where: { id: profileId, userId: session!.user!.id },
    include: { payAccounts: { orderBy: { createdAt: "asc" } } },
  });

  if (!profile) notFound();

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">{profile.name}</h1>

      <section className="bg-card border border-border/60 rounded-2xl card-shadow p-6 flex flex-col gap-3">
        <h2 className="text-base font-semibold">Jobs</h2>
        <div className="flex flex-col gap-2">
          {profile.payAccounts.map((account) => (
            <a
              key={account.id}
              href={`/dashboard/${profile.id}/${account.id}`}
              className="text-sm px-4 py-2.5 rounded-xl bg-background border border-border hover:border-accent transition-colors"
            >
              {account.name}
            </a>
          ))}
          {profile.payAccounts.length === 0 && (
            <p className="text-muted-foreground text-sm">
              No jobs yet. Add one from the sidebar to get started.
            </p>
          )}
        </div>
      </section>

      <DangerZone
        label="profile"
        itemName={profile.name}
        onDelete={deleteProfile.bind(null, profile.id)}
        redirectTo="/dashboard"
      />
    </div>
  );
}
