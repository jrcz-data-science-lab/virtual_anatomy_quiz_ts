import { NextResponse } from "next/server";
import dbConnect from "@/app/lib/dbConnect";
import { MeshCatalogItem } from "@/app/models/Quiz";

/**
 * Handles GET requests to retrieve mesh catalog items from the database.
 * This function supports searching by displayName or meshName using a case-insensitive
 * regex and allows exact matching for a specific meshName.
 *
 * @param {Request} req - The incoming HTTP request.
 * @returns {Promise<NextResponse>} A promise that resolves with a JSON response containing
 * the list of mesh catalog items and a status code of 200 on success, or an error message
 * with a status code of 500 on failure.
 */
export async function GET(req: Request): Promise<NextResponse> {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const searchQuery = searchParams.get("search")?.trim();
    const meshNameQuery = searchParams.get("meshName")?.trim();

    let filter = {};

    if (searchQuery) {
      // Search by displayName or meshName using a case-insensitive regex
      filter = {
        ...filter,
        $or: [
          { displayName: { $regex: searchQuery, $options: "i" } },
          { meshName: { $regex: searchQuery, $options: "i" } },
        ],
      };
    }

    if (meshNameQuery) {
      // Exact match for a specific meshName, used by UE to get mesh _id
      filter = { ...filter, meshName: meshNameQuery };
    }

    const meshItems = await MeshCatalogItem.find(filter).limit(50).lean();

    return NextResponse.json(meshItems, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch mesh catalog items:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json(
      { error: "Failed to fetch mesh catalog items", details: errorMessage },
      { status: 500 }
    );
  }
}

/**
 * Handles POST requests to add a new MeshCatalogItem to the database.
 *
 * @param {Request} req - The request object containing the mesh catalog item data in the body.
 * @returns {Promise<NextResponse>} A promise that resolves with a JSON response containing
 * the created mesh catalog item and a status code of 201 on success, or an error message
 * with a status code of 500 on failure.
 */
export async function POST(req: Request): Promise<NextResponse> {
  try {
    const body = await req.json();
    const meshItem = await MeshCatalogItem.create(body);
    return NextResponse.json(meshItem, { status: 201 });
  } catch (error) {
    console.error("Failed to add mesh catalog item:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json(
      { error: "Failed to add mesh catalog item", details: errorMessage },
      { status: 500 }
    );
  }
}
