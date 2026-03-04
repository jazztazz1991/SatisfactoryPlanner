import { getAllRecipes } from "@/repositories/gameDataRepository";
import { ok, err } from "@/lib/apiResponse";

export async function GET() {
  try {
    const recipes = await getAllRecipes();
    return ok(recipes);
  } catch (e) {
    console.error(e);
    return err("Failed to fetch recipes", 500);
  }
}
