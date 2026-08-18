"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { PayFrequency } from "@/generated/prisma/enums";
import { parseDateInput } from "@/lib/format";

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

export async function upsertPaySettings(
  profileId: string,
  payAccountId: string,
  formData: FormData,
) {
  await requireOwnedAccount(profileId, payAccountId);

  const hourlyRate = num(formData, "hourlyRate");
  const defaultHoursPerWeek = num(formData, "defaultHoursPerWeek");
  const payFrequency = String(formData.get("payFrequency")) as PayFrequency;

  await prisma.paySettings.upsert({
    where: { payAccountId },
    create: { payAccountId, hourlyRate, defaultHoursPerWeek, payFrequency },
    update: { hourlyRate, defaultHoursPerWeek, payFrequency },
  });

  revalidatePath(`/dashboard/${profileId}/${payAccountId}`);
}

export async function upsertOvertimeRule(
  profileId: string,
  payAccountId: string,
  formData: FormData,
) {
  await requireOwnedAccount(profileId, payAccountId);

  const enabled = formData.get("enabled") === "on";

  if (!enabled) {
    await prisma.overtimeRule.deleteMany({ where: { payAccountId } });
    revalidatePath(`/dashboard/${profileId}/${payAccountId}`);
    return;
  }

  const thresholdHours = num(formData, "thresholdHours");
  const multiplier = num(formData, "multiplier");
  const tier2ThresholdHours = formData.get("tier2ThresholdHours")
    ? num(formData, "tier2ThresholdHours")
    : null;
  const tier2Multiplier = formData.get("tier2Multiplier")
    ? num(formData, "tier2Multiplier")
    : null;

  const rule = await prisma.overtimeRule.upsert({
    where: { payAccountId },
    create: { payAccountId, thresholdHours, multiplier },
    update: { thresholdHours, multiplier },
  });

  await prisma.overtimeTier.deleteMany({ where: { overtimeRuleId: rule.id } });
  if (tier2ThresholdHours && tier2Multiplier) {
    await prisma.overtimeTier.create({
      data: {
        overtimeRuleId: rule.id,
        thresholdHours: tier2ThresholdHours,
        multiplier: tier2Multiplier,
      },
    });
  }

  revalidatePath(`/dashboard/${profileId}/${payAccountId}`);
}

export async function createPayPeriodEntry(
  profileId: string,
  payAccountId: string,
  formData: FormData,
) {
  await requireOwnedAccount(profileId, payAccountId);

  const periodStart = parseDateInput(String(formData.get("periodStart")));
  const periodEnd = parseDateInput(String(formData.get("periodEnd")));
  const hoursWorked = num(formData, "hoursWorked");
  const hoursWorkedWeek2 = formData.get("hoursWorkedWeek2")
    ? num(formData, "hoursWorkedWeek2")
    : null;

  if (isNaN(periodStart.getTime()) || isNaN(periodEnd.getTime())) return;

  await prisma.payPeriodEntry.create({
    data: { payAccountId, periodStart, periodEnd, hoursWorked, hoursWorkedWeek2 },
  });

  revalidatePath(`/dashboard/${profileId}/${payAccountId}`);
}

export async function updatePayPeriodEntry(
  profileId: string,
  payAccountId: string,
  entryId: string,
  formData: FormData,
) {
  await requireOwnedAccount(profileId, payAccountId);

  const periodStart = parseDateInput(String(formData.get("periodStart")));
  const periodEnd = parseDateInput(String(formData.get("periodEnd")));
  const hoursWorked = num(formData, "hoursWorked");
  const hoursWorkedWeek2 = formData.get("hoursWorkedWeek2")
    ? num(formData, "hoursWorkedWeek2")
    : null;

  if (isNaN(periodStart.getTime()) || isNaN(periodEnd.getTime())) return;

  await prisma.payPeriodEntry.updateMany({
    where: { id: entryId, payAccountId },
    data: { periodStart, periodEnd, hoursWorked, hoursWorkedWeek2 },
  });

  revalidatePath(`/dashboard/${profileId}/${payAccountId}`);
}

export async function deletePayPeriodEntry(
  profileId: string,
  payAccountId: string,
  entryId: string,
) {
  await requireOwnedAccount(profileId, payAccountId);
  await prisma.payPeriodEntry.deleteMany({ where: { id: entryId, payAccountId } });
  revalidatePath(`/dashboard/${profileId}/${payAccountId}`);
}

export async function createExtraIncomeItem(
  profileId: string,
  payAccountId: string,
  formData: FormData,
) {
  await requireOwnedAccount(profileId, payAccountId);

  const name = String(formData.get("name") ?? "").trim();
  const amount = num(formData, "amount");
  const date = parseDateInput(String(formData.get("date")));
  if (!name || isNaN(date.getTime())) return;

  await prisma.extraIncomeItem.create({
    data: { payAccountId, name, amount, date },
  });

  revalidatePath(`/dashboard/${profileId}/${payAccountId}`);
}

export async function updateExtraIncomeItem(
  profileId: string,
  payAccountId: string,
  itemId: string,
  formData: FormData,
) {
  await requireOwnedAccount(profileId, payAccountId);

  const name = String(formData.get("name") ?? "").trim();
  const amount = num(formData, "amount");
  const date = parseDateInput(String(formData.get("date")));
  if (!name || isNaN(date.getTime())) return;

  await prisma.extraIncomeItem.updateMany({
    where: { id: itemId, payAccountId },
    data: { name, amount, date },
  });

  revalidatePath(`/dashboard/${profileId}/${payAccountId}`);
}

export async function deleteExtraIncomeItem(
  profileId: string,
  payAccountId: string,
  itemId: string,
) {
  await requireOwnedAccount(profileId, payAccountId);
  await prisma.extraIncomeItem.deleteMany({ where: { id: itemId, payAccountId } });
  revalidatePath(`/dashboard/${profileId}/${payAccountId}`);
}
