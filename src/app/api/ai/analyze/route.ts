import { NextResponse } from "next/server";
import { requireApiSession } from "@/lib/api-auth";
import { generateBusinessAnalysis } from "@/actions/ai";

export async function POST() {
  const { response } = await requireApiSession();
  if (response) return response;

  const analysis = await generateBusinessAnalysis();
  return NextResponse.json({ success: true, data: analysis });
}
