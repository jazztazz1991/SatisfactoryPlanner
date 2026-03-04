import { getAllBuildings } from "@/repositories/gameDataRepository";
import { ok, err } from "@/lib/apiResponse";

export async function GET() {
  try {
    const buildings = await getAllBuildings();
    return ok(buildings);
  } catch (e) {
    console.error(e);
    return err("Failed to fetch buildings", 500);
  }
}
