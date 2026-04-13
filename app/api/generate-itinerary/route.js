// app/api/generate-itinerary/route.js

import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

// Initialize Gemini client with our API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(request) {
  try {
    // 1. Read form data sent from the frontend
    const body = await request.json();
    const { destination, days, budget, interests } = body;

    // 2. Validate required fields
    if (!destination || !days || !budget) {
      return NextResponse.json(
        { error: "Missing required fields: destination, days, or budget" },
        { status: 400 }
      );
    }

    // 3. Build the prompt
    const interestText =
      interests && interests.length > 0
        ? `The traveler's interests include: ${interests.join(", ")}.`
        : "The traveler has general interests.";

    const budgetDescriptions = {
      budget: "a tight budget (under $50/day)",
      moderate: "a moderate budget ($50–$150/day)",
      luxury: "a luxury budget ($150+/day)",
    };

    const prompt = `You are an expert travel planner with deep knowledge of destinations worldwide.

Create a detailed, day-by-day travel itinerary for the following trip:

- **Destination:** ${destination}
- **Duration:** ${days} days
- **Budget:** ${budgetDescriptions[budget] || budget}
- **Interests:** ${interestText}

Please structure the itinerary as follows:
- Start with a short "Trip Overview" (2-3 sentences about what makes this destination special for this traveler)
- Then list each day clearly: "Day 1: [Theme for the day]"
- For each day, include:
  - Morning activity (with specific place names)
  - Afternoon activity
  - Evening activity or dinner recommendation
  - A budget tip relevant to the day's activities
- End with "Practical Tips" section (3-5 bullet points about transportation, best times to visit spots, cultural notes, etc.)

Make it specific, practical, and exciting. Use real place names, local restaurants, and hidden gems — not just tourist clichés. Tailor everything to the budget level.`;

    // 4. Call Gemini API
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    // "gemini-1.5-flash" is fast, free, and great for this use case

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const itinerary = response.text();

    // 5. Send itinerary back to frontend
    return NextResponse.json({ itinerary });

  } catch (error) {
    console.error("Error generating itinerary:", error);
    return NextResponse.json(
      { error: "Failed to generate itinerary. Please try again." },
      { status: 500 }
    );
  }
}
