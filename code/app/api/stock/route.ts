import { NextResponse } from "next/server";
import { getCompanyStockData } from "../../utils/stock";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const company = searchParams.get("company");

  if (!company) {
    return NextResponse.json({ error: "Missing company query parameter" }, { status: 400 });
  }

  try {
    const data = await getCompanyStockData(company);
    return NextResponse.json(data);
  } catch (error) {
    console.error("[STOCK API] Error fetching stock data:", error);
    return NextResponse.json({ error: "Failed to fetch stock data" }, { status: 500 });
  }
}
