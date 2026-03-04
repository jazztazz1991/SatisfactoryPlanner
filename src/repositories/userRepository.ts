import "@/models";
import { User } from "@/models/User";

export interface UserDTO {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  provider: string | null;
  createdAt: string;
}

export interface CreateUserInput {
  email: string;
  name?: string | null;
  image?: string | null;
  provider?: string | null;
  providerId?: string | null;
  passwordHash?: string | null;
}

export async function findUserById(id: string): Promise<UserDTO | null> {
  const row = await User.findByPk(id);
  return row ? userToDTO(row) : null;
}

export async function findUserByEmail(email: string): Promise<User | null> {
  return User.findOne({ where: { email } });
}

export async function findUserByProvider(
  provider: string,
  providerId: string
): Promise<User | null> {
  return User.findOne({ where: { provider, providerId } });
}

export async function createUser(input: CreateUserInput): Promise<User> {
  return User.create({
    email: input.email,
    name: input.name ?? null,
    image: input.image ?? null,
    provider: input.provider ?? null,
    providerId: input.providerId ?? null,
    passwordHash: input.passwordHash ?? null,
  });
}

export async function updateUser(
  id: string,
  fields: { name?: string | null; image?: string | null }
): Promise<UserDTO | null> {
  const row = await User.findByPk(id);
  if (!row) return null;
  await row.update(fields);
  return userToDTO(row);
}

function userToDTO(row: User): UserDTO {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    image: row.image,
    provider: row.provider,
    createdAt: row.createdAt.toISOString(),
  };
}
