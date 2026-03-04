import { z } from "zod";
import { auth } from "@/auth";
import { findUserById, updateUser } from "@/repositories/userRepository";
import { ok, err, notFound, unauthorized } from "@/lib/apiResponse";

const updateMeSchema = z.object({
  name: z.string().min(1).max(100).nullable().optional(),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return unauthorized();

  try {
    const user = await findUserById(session.user.id);
    if (!user) return notFound();
    return ok(user);
  } catch (e) {
    console.error(e);
    return err("Failed to fetch user", 500);
  }
}

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return unauthorized();

  const body = await request.json().catch(() => null);
  const parsed = updateMeSchema.safeParse(body);
  if (!parsed.success) {
    return err("Validation failed", 400, parsed.error.flatten());
  }

  try {
    const updated = await updateUser(session.user.id, {
      ...(parsed.data.name !== undefined && { name: parsed.data.name }),
    });
    if (!updated) return notFound();
    return ok(updated);
  } catch (e) {
    console.error(e);
    return err("Failed to update user", 500);
  }
}
