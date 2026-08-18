"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function updateUserProfile(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  if (!email) return { error: "Email is required." };

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing && existing.id !== session.user.id) {
    return { error: "That email is already in use." };
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { name: name || null, email },
  });

  revalidatePath("/dashboard/settings");
  return { error: null };
}
