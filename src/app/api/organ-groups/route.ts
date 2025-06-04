import { NextResponse } from "next/server";
import dbConnect from "@/app/lib/dbConnect";
import { OrganGroup } from "@/app/models/Quiz";

/**
 * Handles GET requests to retrieve organ groups from the database.
 *
 * The function connects to the database using the `dbConnect` function,
 * performs a `find` query on the `OrganGroup` model to retrieve all organ groups,
 * and returns them as plain JavaScript objects using the `lean` method.
 * If a search query is provided in the URL query string, the function
 * filters the results by searching for the query string in the `groupName`
 * field of the organ groups, using a case-insensitive regex search.
 * The function returns at most 50 organ groups.
 * In case of an error during the process, it logs the error message and returns
 * an error response with a status code of 500.
 *
 * @param {Request} req - The incoming HTTP request.
 * @returns {Promise<NextResponse>} A promise that resolves with the HTTP response.
 */
export async function GET(req: Request): Promise<NextResponse> {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const searchQuery = searchParams.get("search")?.trim();

    let filter = {};

    if (searchQuery) {
      filter = {
        groupName: { $regex: searchQuery, $options: "i" },
      };
    }

    const organGroups = await OrganGroup.find(filter).limit(50).lean();

    return NextResponse.json(organGroups, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch organ groups:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json(
      { error: "Failed to fetch organ groups", details: errorMessage },
      { status: 500 }
    );
  }
}
