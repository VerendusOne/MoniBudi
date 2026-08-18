"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { auth, signOut } from "@/auth";
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

  revalidatePath("/dashboard");
  return { error: null };
}

export async function changePassword(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const currentPassword = String(formData.get("currentPassword") ?? "");
  const newPassword = String(formData.get("newPassword") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (newPassword.length < 8) {
    return { error: "New password must be at least 8 characters." };
  }
  if (newPassword !== confirmPassword) {
    return { error: "New passwords do not match." };
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user?.password) return { error: "Could not verify current password." };

  const valid = await bcrypt.compare(currentPassword, user.password);
  if (!valid) return { error: "Current password is incorrect." };

  const hashed = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({
    where: { id: session.user.id },
    data: { password: hashed },
  });

  return { error: null, success: true };
}

export async function deleteUserAccount() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  await prisma.user.delete({ where: { id: session.user.id } });
  await signOut({ redirectTo: "/" });
}
