"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { RecurrenceFrequency, SavingsAmountType } from "@/generated/prisma/enums";

async function requireOwnedAccount(profileId: string, payAccountId: string) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const account = await prisma.payAccount.findFirst({
    where: { id: payAccountId, profileId, profile: { userId: session.user.id } },
  });
  if (!account) redirect("/dashboard");
  return account;
}

function num(formData: FormData, key: string): number {
  return Number(formData.get(key) ?? 0);
}

// --- Categories ---------------------------------------------------------

export async function createExpenseCategory(
  profileId: string,
  payAccountId: string,
  formData: FormData,
) {
  await requireOwnedAccount(profileId, payAccountId);

  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;

  await prisma.expenseCategory.upsert({
    where: { payAccountId_name: { payAccountId, name } },
    create: { payAccountId, name, isPreset: false },
    update: {},
  });

  revalidatePath(`/dashboard/${profileId}/${payAccountId}`);
}

export async function deleteExpenseCategory(
  profileId: string,
  payAccountId: string,
  categoryId: string,
) {
  await requireOwnedAccount(profileId, payAccountId);

  const inUse = await prisma.expenseItem.count({ where: { categoryId, payAccountId } });
  if (inUse > 0) {
    throw new Error(
      `Cannot delete — ${inUse} expense${inUse === 1 ? " uses" : "s use"} this category. Move ${inUse === 1 ? "it" : "them"} to another category first.`,
    );
  }

  const category = await prisma.expenseCategory.findUnique({ where: { id: categoryId } });
  if (!category) return;

  if (category.payAccountId === payAccountId) {
    // Custom category scoped to this account — safe to delete outright.
    await prisma.expenseCategory.delete({ where: { id: categoryId } });
  } else if (category.payAccountId === null) {
    // Shared preset — hide it for this account instead of deleting the
    // shared row, which would remove it for every other account too.
    await prisma.hiddenExpenseCategory.upsert({
      where: { payAccountId_categoryId: { payAccountId, categoryId } },
      create: { payAccountId, categoryId },
      update: {},
    });
  }

  revalidatePath(`/dashboard/${profileId}/${payAccountId}`);
}

// --- Expense Items --------------------------------------------------------

export async function createExpenseItem(
  profileId: string,
  payAccountId: string,
  formData: FormData,
) {
  await requireOwnedAccount(profileId, payAccountId);

  const name = String(formData.get("name") ?? "").trim();
  const amount = num(formData, "amount");
  const frequency = String(formData.get("frequency")) as RecurrenceFrequency;
  const categoryId = String(formData.get("categoryId") ?? "");
  if (!name) throw new Error("Name is required.");
  if (!categoryId) throw new Error("Please select a category.");

  await prisma.expenseItem.create({
    data: { payAccountId, name, amount, frequency, categoryId },
  });

  revalidatePath(`/dashboard/${profileId}/${payAccountId}`);
}

export async function updateExpenseItem(
  profileId: string,
  payAccountId: string,
  itemId: string,
  formData: FormData,
) {
  await requireOwnedAccount(profileId, payAccountId);

  const name = String(formData.get("name") ?? "").trim();
  const amount = num(formData, "amount");
  const frequency = String(formData.get("frequency")) as RecurrenceFrequency;
  const categoryId = String(formData.get("categoryId") ?? "");
  if (!name) throw new Error("Name is required.");
  if (!categoryId) throw new Error("Please select a category.");

  await prisma.expenseItem.updateMany({
    where: { id: itemId, payAccountId },
    data: { name, amount, frequency, categoryId },
  });

  revalidatePath(`/dashboard/${profileId}/${payAccountId}`);
}

export async function deleteExpenseItem(
  profileId: string,
  payAccountId: string,
  itemId: string,
) {
  await requireOwnedAccount(profileId, payAccountId);
  await prisma.expenseItem.deleteMany({ where: { id: itemId, payAccountId } });
  revalidatePath(`/dashboard/${profileId}/${payAccountId}`);
}

// --- Savings Items --------------------------------------------------------

function parseSavingsFields(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const amountType = String(formData.get("amountType")) as SavingsAmountType;
  const frequency = String(formData.get("frequency")) as RecurrenceFrequency;
  const flatAmount = amountType === "FLAT" ? num(formData, "flatAmount") : null;
  const percent = amountType === "PERCENT_OF_GROSS" ? num(formData, "percent") : null;
  return { name, amountType, frequency, flatAmount, percent };
}

export async function createSavingsItem(
  profileId: string,
  payAccountId: string,
  formData: FormData,
) {
  await requireOwnedAccount(profileId, payAccountId);
  const fields = parseSavingsFields(formData);
  if (!fields.name) return;

  await prisma.savingsItem.create({ data: { payAccountId, ...fields } });
  revalidatePath(`/dashboard/${profileId}/${payAccountId}`);
}

export async function updateSavingsItem(
  profileId: string,
  payAccountId: string,
  itemId: string,
  formData: FormData,
) {
  await requireOwnedAccount(profileId, payAccountId);
  const fields = parseSavingsFields(formData);
  if (!fields.name) return;

  await prisma.savingsItem.updateMany({
    where: { id: itemId, payAccountId },
    data: fields,
  });
  revalidatePath(`/dashboard/${profileId}/${payAccountId}`);
}

export async function deleteSavingsItem(
  profileId: string,
  payAccountId: string,
  itemId: string,
) {
  await requireOwnedAccount(profileId, payAccountId);
  await prisma.savingsItem.deleteMany({ where: { id: itemId, payAccountId } });
  revalidatePath(`/dashboard/${profileId}/${payAccountId}`);
}
