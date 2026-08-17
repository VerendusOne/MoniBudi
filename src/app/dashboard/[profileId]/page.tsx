import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ profileId: string }>;
}) {
  const { profileId } = await params;
  const session = await auth();

  const profile = await prisma.profile.findFirst({
    where: { id: profileId, userId: session!.user!.id },
    include: { payAccounts: { orderBy: { createdAt: "asc" }, take: 1 } },
  });

  if (!profile) notFound();

  if (profile.payAccounts[0]) {
    redirect(`/dashboard/${profile.id}/${profile.payAccounts[0].id}`);
  }

  return (
    <div className="h-full flex items-center justify-center text-center">
      <div className="max-w-sm">
        <h1 className="text-xl font-semibold mb-2">{profile.name}</h1>
        <p className="text-muted-foreground text-sm">
          No accounts yet. Add one from the sidebar to get started.
        </p>
      </div>
    </div>
  );
}
