"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

async function requireUserId() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  return session.user.id;
}

async function requireOwnedProfile(profileId: string, userId: string) {
  const profile = await prisma.profile.findFirst({
    where: { id: profileId, userId },
  });
  if (!profile) redirect("/dashboard");
  return profile;
}

export async function createPayAccount(profileId: string, formData: FormData) {
  const userId = await requireUserId();
  await requireOwnedProfile(profileId, userId);

  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;

  await prisma.payAccount.create({ data: { name, profileId } });
  revalidatePath(`/dashboard/${profileId}`);
}

export async function renamePayAccount(
  profileId: string,
  payAccountId: string,
  formData: FormData,
) {
  const userId = await requireUserId();
  await requireOwnedProfile(profileId, userId);

  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;

  await prisma.payAccount.updateMany({
    where: { id: payAccountId, profileId },
    data: { name },
  });
  revalidatePath(`/dashboard/${profileId}`);
  revalidatePath(`/dashboard/${profileId}/${payAccountId}`);
}

export async function deletePayAccount(profileId: string, payAccountId: string) {
  const userId = await requireUserId();
  await requireOwnedProfile(profileId, userId);

  await prisma.payAccount.deleteMany({
    where: { id: payAccountId, profileId },
  });
  revalidatePath(`/dashboard/${profileId}`);
}
