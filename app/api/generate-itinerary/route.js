// app/api/generate-itinerary/route.js

import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request) {
  try {
    const body = await request.json();
    const { destination, days, budget, interests } = body;

    if (!destination || !days || !budget) {
      return NextResponse.json(
        { error: "Missing required fields." },
        { status: 400 }
      );
    }

    const budgetDescriptions = {
      budget: "a tight budget (under $50/day)",
      moderate: "a moderate budget ($50–$150/day)",
      luxury: "a luxury budget ($150+/day)",
    };

    const interestText =
      interests && interests.length > 0
        ? interests.join(", ")
        : "general sightseeing";

    const prompt = `You are an expert travel planner.

Create a detailed day-by-day itinerary for:
- Destination: ${destination}
- Duration: ${days} days
- Budget: ${budgetDescriptions[budget] || budget}
- Interests: ${interestText}

Format your response exactly like this:

Trip Overview
[2-3 sentences about the destination]

Day 1: [Theme]
- Morning: [activity + place name]
- Afternoon: [activity + place name]
- Evening: [activity or dinner recommendation]
- Budget Tip: [money-saving advice]

[Continue for all ${days} days]

Practical Tips
- [tip 1]
- [tip 2]
- [tip 3]`;

    console.log("Calling Claude API..."); // This will show in your terminal

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2000,
      messages: [{ role: "user", content: prompt }],
    });

    console.log("Claude responded successfully"); // Confirm it worked

    const itinerary = message.content[0].text;

    return NextResponse.json({ itinerary });

  } catch (error) {
    // This logs the REAL error to your terminal
    console.error("FULL ERROR:", error.message);
    console.error("ERROR TYPE:", error.constructor.name);

    return NextResponse.json(
      { error: error.message || "Failed to generate itinerary." },
      { status: 500 }
    );
  }
}