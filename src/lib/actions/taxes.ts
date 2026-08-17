"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

async function requireOwnedAccount(profileId: string, payAccountId: string) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const account = await prisma.payAccount.findFirst({
    where: { id: payAccountId, profileId, profile: { userId: session.user.id } },
  });
  if (!account) redirect("/dashboard");
  return account;
}

export async function upsertTaxSettings(
  profileId: string,
  payAccountId: string,
  formData: FormData,
) {
  await requireOwnedAccount(profileId, payAccountId);

  const state = String(formData.get("state") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim();
  if (!state) return;

  await prisma.taxSettings.upsert({
    where: { payAccountId },
    create: { payAccountId, state, city: city || null },
    update: { state, city: city || null },
  });

  revalidatePath(`/dashboard/${profileId}/${payAccountId}`);
}
