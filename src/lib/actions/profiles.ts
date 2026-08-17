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

export async function createProfile(formData: FormData) {
  const userId = await requireUserId();
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;

  await prisma.profile.create({ data: { name, userId } });
  revalidatePath("/dashboard");
}

export async function renameProfile(profileId: string, formData: FormData) {
  const userId = await requireUserId();
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;

  await prisma.profile.updateMany({
    where: { id: profileId, userId },
    data: { name },
  });
  revalidatePath("/dashboard");
}

export async function deleteProfile(profileId: string) {
  const userId = await requireUserId();
  await prisma.profile.deleteMany({ where: { id: profileId, userId } });
  revalidatePath("/dashboard");
}
