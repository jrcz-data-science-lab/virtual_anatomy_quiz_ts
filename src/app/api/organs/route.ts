import { NextResponse } from "next/server";
import dbConnect from "@/app/lib/dbConnect";
import { Organ } from "@/app/models/Quiz";

export async function POST(req: Request): Promise<NextResponse> {
  console.log("POST REQ received");
  await dbConnect();
  try {
    const body = await req.json();
    console.log("Request body: ", body);
    const organ = await Organ.create(body);
    return NextResponse.json(organ, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create organ" },
      { status: 500 }
    );
  }
}

export async function GET(): Promise<NextResponse> {
  await dbConnect();
  try {
    const organs = await Organ.find({});
    return NextResponse.json(organs, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to get organs" },
      { status: 500 }
    );
  }
}
