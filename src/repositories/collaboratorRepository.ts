import "@/models";
import { Op } from "sequelize";
import { PlanCollaborator } from "@/models/PlanCollaborator";
import { Plan } from "@/models/Plan";
import { User } from "@/models/User";
import type { IPlanCollaborator, CollaboratorRole } from "@/domain/types/plan";

export interface NotificationDTO {
  id: string;
  type: "invite" | "shared";
  planId: string;
  planName: string;
  role: CollaboratorRole;
  createdAt: string;
}

export async function getCollaboratorsByPlan(planId: string): Promise<IPlanCollaborator[]> {
  const rows = await PlanCollaborator.findAll({
    where: { planId },
    order: [["createdAt", "ASC"]],
  });
  return rows.map(toDTO);
}

export async function getCollaboratorById(id: string): Promise<IPlanCollaborator | null> {
  const row = await PlanCollaborator.findByPk(id);
  return row ? toDTO(row) : null;
}

export async function getCollaboratorByPlanAndUser(
  planId: string,
  userId: string
): Promise<IPlanCollaborator | null> {
  const row = await PlanCollaborator.findOne({
    where: { planId, userId },
  });
  return row ? toDTO(row) : null;
}

export async function getCollaboratorByInviteToken(
  token: string
): Promise<IPlanCollaborator | null> {
  const row = await PlanCollaborator.findOne({
    where: { inviteToken: token },
  });
  return row ? toDTO(row) : null;
}

export async function createCollaborator(input: {
  planId: string;
  userId?: string;
  email?: string;
  role: CollaboratorRole;
}): Promise<IPlanCollaborator> {
  const row = await PlanCollaborator.create({
    planId: input.planId,
    userId: input.userId ?? null,
    email: input.email ?? null,
    role: input.role,
    acceptedAt: input.userId ? new Date() : null,
  });
  return toDTO(row);
}

export async function acceptCollaborator(
  id: string,
  userId: string
): Promise<IPlanCollaborator | null> {
  const row = await PlanCollaborator.findByPk(id);
  if (!row) return null;
  await row.update({ userId, acceptedAt: new Date() });
  return toDTO(row);
}

export async function updateCollaboratorRole(
  id: string,
  role: CollaboratorRole
): Promise<IPlanCollaborator | null> {
  const row = await PlanCollaborator.findByPk(id);
  if (!row) return null;
  await row.update({ role });
  return toDTO(row);
}

export async function deleteCollaborator(id: string): Promise<boolean> {
  const count = await PlanCollaborator.destroy({ where: { id } });
  return count > 0;
}

export async function findUserByEmail(email: string): Promise<{ id: string; name: string | null; email: string } | null> {
  const user = await User.findOne({ where: { email } });
  if (!user) return null;
  return { id: user.id, name: user.name, email: user.email };
}

/**
 * Finds pending email invites where the user has since registered.
 * Matches by email where acceptedAt is null and userId is null.
 */
export async function getPendingInvitesByEmail(email: string): Promise<NotificationDTO[]> {
  const rows = await PlanCollaborator.findAll({
    where: { email, acceptedAt: null, userId: null },
    include: [{ model: Plan, attributes: ["id", "name"] }],
    order: [["createdAt", "DESC"]],
  }) as Array<PlanCollaborator & { plan: Plan }>;

  return rows.map((row) => ({
    id: row.id,
    type: "invite" as const,
    planId: row.planId,
    planName: row.plan?.name ?? "Unknown Plan",
    role: row.role,
    createdAt: row.createdAt.toISOString(),
  }));
}

/**
 * Finds plans recently shared with a user (accepted in the last 7 days).
 * These are collaborations the user may not have seen yet.
 */
export async function getRecentSharesForUser(userId: string): Promise<NotificationDTO[]> {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const rows = await PlanCollaborator.findAll({
    where: {
      userId,
      acceptedAt: { [Op.not]: null, [Op.gte]: sevenDaysAgo },
    },
    include: [{ model: Plan, attributes: ["id", "name"] }],
    order: [["createdAt", "DESC"]],
  }) as Array<PlanCollaborator & { plan: Plan }>;

  return rows.map((row) => ({
    id: row.id,
    type: "shared" as const,
    planId: row.planId,
    planName: row.plan?.name ?? "Unknown Plan",
    role: row.role,
    createdAt: row.createdAt.toISOString(),
  }));
}

function toDTO(row: PlanCollaborator): IPlanCollaborator {
  return {
    id: row.id,
    planId: row.planId,
    userId: row.userId,
    email: row.email,
    role: row.role,
    inviteToken: row.inviteToken,
    acceptedAt: row.acceptedAt?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}
