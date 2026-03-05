import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getPlanByShareToken } from "@/repositories/planRepository";
import {
  getCollaboratorByPlanAndUser,
  getCollaboratorByInviteToken,
  acceptCollaborator,
  createCollaborator,
} from "@/repositories/collaboratorRepository";
import { ok, err, notFound, unauthorized } from "@/lib/apiResponse";
import type { CollaboratorRole } from "@/domain/types/plan";

type Params = { params: Promise<{ token: string }> };

export async function GET(_req: Request, { params }: Params) {
  const { token } = await params;
  return NextResponse.redirect(new URL(`/plans/join/${token}`, process.env.NEXTAUTH_URL ?? "http://localhost:3000"));
}

export async function POST(_req: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) return unauthorized();

  const { token } = await params;

  // First check if this is a personal invite token
  const inviteCollab = await getCollaboratorByInviteToken(token);
  if (inviteCollab) {
    if (inviteCollab.acceptedAt) {
      return err("Invite already accepted", 400);
    }
    const accepted = await acceptCollaborator(inviteCollab.id, session.user.id);
    return ok(accepted, 200);
  }

  // Otherwise check if this is a plan share link
  const plan = await getPlanByShareToken(token);
  if (!plan || !plan.shareToken) return notFound("Invalid or expired share link");

  // Don't add owner as collaborator
  if (plan.userId === session.user.id) {
    return ok({ message: "You are the owner of this plan", planId: plan.id });
  }

  // Check if already a collaborator
  const existing = await getCollaboratorByPlanAndUser(plan.id, session.user.id);
  if (existing) {
    return ok({ message: "Already a collaborator", planId: plan.id });
  }

  // Create collaborator with the plan's share role
  const collab = await createCollaborator({
    planId: plan.id,
    userId: session.user.id,
    role: (plan.shareRole ?? "viewer") as CollaboratorRole,
  });
  return ok({ ...collab, planId: plan.id }, 201);
}
