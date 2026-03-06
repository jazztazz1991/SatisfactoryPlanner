import { auth } from "@/auth";
import { findUserById } from "@/repositories/userRepository";
import {
  getPendingInvitesByEmail,
  getRecentSharesForUser,
  acceptCollaborator,
  getCollaboratorById,
} from "@/repositories/collaboratorRepository";
import { ok, err, unauthorized } from "@/lib/apiResponse";
import { z } from "zod";

const acceptSchema = z.object({
  collaboratorId: z.string().uuid(),
});

/** GET /api/notifications — returns pending invites + recent shares */
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return unauthorized();

  try {
    const user = await findUserById(session.user.id);
    if (!user) return unauthorized();

    const [invites, shares] = await Promise.all([
      getPendingInvitesByEmail(user.email),
      getRecentSharesForUser(session.user.id),
    ]);

    return ok([...invites, ...shares]);
  } catch (e) {
    console.error(e);
    return err("Failed to fetch notifications", 500);
  }
}

/** POST /api/notifications — accept a pending invite */
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return unauthorized();

  const body = await request.json().catch(() => null);
  const parsed = acceptSchema.safeParse(body);
  if (!parsed.success) {
    return err("Validation failed", 400);
  }

  try {
    // Verify the collaborator exists and belongs to this user's email
    const collab = await getCollaboratorById(parsed.data.collaboratorId);
    if (!collab) return err("Invite not found", 404);

    const user = await findUserById(session.user.id);
    if (!user) return unauthorized();

    // Only allow accepting if the invite email matches the user's email
    if (collab.email !== user.email) {
      return err("Invite not found", 404);
    }

    // Only allow accepting if not already accepted
    if (collab.acceptedAt) {
      return err("Invite already accepted", 400);
    }

    const updated = await acceptCollaborator(collab.id, session.user.id);
    return ok(updated);
  } catch (e) {
    console.error(e);
    return err("Failed to accept invite", 500);
  }
}
