import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    notionDatabaseUrl: process.env.NOTION_DATABASE_URL ?? "",
  });
}
