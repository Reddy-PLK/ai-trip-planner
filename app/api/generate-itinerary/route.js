// ✅ IMPORTANT: Force Node.js runtime (fixes 500 error)
export const runtime = "nodejs";

import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(request) {
  try {
    console.log("✅ API HIT");

    // Get data
    const body = await request.json();
    const { destination, days, budget, interests } = body;

    // Validate
    if (!destination || !days || !budget) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const interestText =
      interests && interests.length > 0
        ? interests.join(", ")
        : "general";

    // ⚡ Fast prompt
    const prompt = `
Create a ${days}-day itinerary for ${destination}.

Budget: ${budget}
Interests: ${interestText}

For each day include:
- Morning
- Afternoon
- Evening

Keep it short and simple.
`;

    console.log("🧠 Calling Gemini...");

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash-latest",
    });

    // Timeout protection
    const result = await Promise.race([
      model.generateContent(prompt),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Timeout")), 15000)
      ),
    ]);

    const response = result.response;
    const itinerary = response.text();

    console.log("✅ Response received");

    return NextResponse.json({ itinerary });

  } catch (error) {
    console.error("❌ ERROR:", error);

    return NextResponse.json(
      { error: error.message || "Something went wrong" },
      { status: 500 }
    );
  }
}
