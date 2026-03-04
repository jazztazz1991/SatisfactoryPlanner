import { getAllItems } from "@/repositories/gameDataRepository";
import { ok, err } from "@/lib/apiResponse";

export async function GET() {
  try {
    const items = await getAllItems();
    return ok(items);
  } catch (e) {
    console.error(e);
    return err("Failed to fetch items", 500);
  }
}
