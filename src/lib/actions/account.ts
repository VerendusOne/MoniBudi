"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { head, del } from "@vercel/blob";
import { auth, signOut } from "@/auth";
import { prisma } from "@/lib/prisma";

import { ALLOWED_AVATAR_TYPES, MAX_AVATAR_BYTES } from "@/lib/avatar";

export async function updateAvatar(pathname: string) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const prefix = `avatars/${session.user.id}/`;
  if (!pathname.startsWith(prefix) || pathname.slice(prefix.length).includes("/")) {
    return { error: "Unable to save photo." };
  }
  const blob = await head(pathname);
  if (blob.size === 0 || blob.size > MAX_AVATAR_BYTES || !ALLOWED_AVATAR_TYPES.includes(blob.contentType)) {
    return { error: "Please choose a valid image up to 5 MB." };
  }

  const previous = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { image: true },
  });

  await prisma.user.update({
    where: { id: session.user.id },
    data: { image: blob.url },
  });

  // Best-effort cleanup of the old file — a failure here shouldn't block
  // the new avatar from taking effect.
  if (previous?.image && previous.image !== blob.url) {
    await del(previous.image).catch(() => {});
  }

  revalidatePath("/dashboard");
  return { error: null };
}

export async function removeAvatar() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { image: true },
  });

  await prisma.user.update({
    where: { id: session.user.id },
    data: { image: null },
  });

  if (user?.image) {
    await del(user.image).catch(() => {});
  }

  revalidatePath("/dashboard");
}

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
