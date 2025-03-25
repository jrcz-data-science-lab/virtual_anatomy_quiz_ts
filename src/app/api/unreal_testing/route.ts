import { NextResponse } from "next/server";
import dbConnect from "@/app/lib/dbConnect";
import UnrealTesting from "@/app/models/UnrealTesting";

console.log("API Route: /api/unreal_testing");

/**
 * Handles GET requests to retrieve all UnrealTesting documents from the database.
 *
 * @returns {Promise<NextResponse>} A promise that resolves with a JSON response
 * containing the list of UnrealTesting documents and a status code of 200 on success,
 * or an error message with a status code of 500 on failure.
 */
export async function GET(): Promise<NextResponse> {
  await dbConnect();
  try {
    const tests = await UnrealTesting.find({});
    return NextResponse.json(tests, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to get tests" }, { status: 500 });
  }
}

/**
 * Handles POST requests to create a new UnrealTesting document in the database.
 *
 * @param {Request} req - The request object containing the test data in the body.
 * @returns {Promise<NextResponse>} A promise that resolves with a JSON response
 * containing the created test document and a status code of 201 on success,
 * or an error message with a status code of 500 on failure.
 */
export async function POST(req: Request): Promise<NextResponse> {
  console.log("POST REQ received");
  await dbConnect();
  try {
    const body = await req.json();
    console.log("Request body: ", body);
    const test = await UnrealTesting.create(body);
    return NextResponse.json(test, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create test" },
      { status: 500 }
    );
  }
}
