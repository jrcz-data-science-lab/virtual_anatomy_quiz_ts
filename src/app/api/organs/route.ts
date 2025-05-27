import { NextResponse } from "next/server";
import dbConnect from "@/app/lib/dbConnect";
import { OrganGroup } from "@/app/models/Quiz";
import formatMeshNameToDisplayName from "@/app/lib/formatMeshNameToDisplayName";

/**
 * Handles POST requests to create a new organ in the database.
 *
 * @param {Request} req - The request object containing the organ data in the body.
 * @returns {Promise<NextResponse>} A promise that resolves with a JSON response
 * containing the created organ document and a status code of 201 on success,
 * or an error message with a status code of 500 on failure.
 */
export async function POST(req: Request): Promise<NextResponse> {
  console.log("POST REQ received");
  await dbConnect();
  try {
    const body = await req.json();
    console.log("Request body: ", body);

    const { meshName } = body;
    const displayName = formatMeshNameToDisplayName(meshName);

    const organ = await OrganGroup.create({ meshName, displayName });
    return NextResponse.json(organ, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create organ" },
      { status: 500 }
    );
  }
}

/**
 * Handles GET requests to retrieve all organ documents from the database.
 *
 * @returns {Promise<NextResponse>} A promise that resolves with a JSON response
 * containing the list of organ documents and a status code of 200 on success,
 * or an error message with a status code of 500 on failure.
 */
export async function GET(): Promise<NextResponse> {
  await dbConnect();
  try {
    const organs = await OrganGroup.find({});
    return NextResponse.json(organs, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to get organs" },
      { status: 500 }
    );
  }
}
