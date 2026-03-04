import { z } from "zod";
import bcrypt from "bcryptjs";
import { findUserByEmail, createUser } from "@/repositories/userRepository";
import { ok, err } from "@/lib/apiResponse";

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1).max(100).optional(),
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return err("Validation failed", 400, parsed.error.flatten());
  }

  const existing = await findUserByEmail(parsed.data.email);
  if (existing) {
    return err("Email already in use", 409);
  }

  try {
    const passwordHash = await bcrypt.hash(parsed.data.password, 12);
    const user = await createUser({
      email: parsed.data.email,
      name: parsed.data.name ?? null,
      passwordHash,
      provider: "credentials",
    });
    return ok({ id: user.id, email: user.email, name: user.name }, 201);
  } catch (e) {
    console.error(e);
    return err("Failed to create user", 500);
  }
}
