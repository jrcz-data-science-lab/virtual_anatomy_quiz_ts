import { NextResponse } from "next/server";
import dbConnect from "@/app/lib/dbConnect";
import UnrealTesting from "@/app/models/UnrealTesting";

/**
 * Handles GET requests to retrieve an UnrealTesting document by id from the database.
 *
 * @param {Request} req - The request object.
 * @param {{ params: { id: string } }} params - The params object containing the id of the document to retrieve.
 * @returns {Promise<NextResponse>} A promise that resolves with a JSON response containing
 * the test entry and a status code of 200 on success, a status code of 404 if the test
 * entry is not found, or a status code of 500 on failure.
 */
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  await dbConnect();
  try {
    const testEntry = await UnrealTesting.findById(params.id);
    if (!testEntry) {
      return NextResponse.json({ error: "Test not found" }, { status: 404 });
    }
    return NextResponse.json(testEntry, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to get entry" }, { status: 500 });
  }
}

/**
 * Handles PUT requests to update an existing UnrealTesting document by id.
 *
 * @param {Request} req - The request object containing the updated test data in the body.
 * @param {{ params: { id: string } }} params - The params object containing the id of the document to update.
 * @returns {Promise<NextResponse>} A promise that resolves with a JSON response containing
 * the updated test entry and a status code of 200 on success, a status code of 404 if the test
 * entry is not found, or a status code of 500 on failure.
 */
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  await dbConnect();
  try {
    const { name, value } = await req.json();
    const updatedTestEntry = await UnrealTesting.findByIdAndUpdate(
      params.id,
      { name, value },
      { new: true }
    );
    if (!updatedTestEntry) {
      return NextResponse.json({ error: "Test not found" }, { status: 404 });
    }
    return NextResponse.json(updatedTestEntry, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update entry" },
      { status: 500 }
    );
  }
}

// Delete function later
