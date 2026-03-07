import { currentUser } from "@clerk/nextjs/server";
import { clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {

    const user = await currentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const usageCount = (user.publicMetadata?.tripCount as number) || 0;

    // ✅ FREE LIMIT
    if (usageCount >= 10) {
      return NextResponse.json(
        {
          limitReached: true,
          message: "Free limit finished. Please subscribe.",
        },
        { status: 403 }
      );
    }

    const { origin, destination, days, budget, travelWith } = await req.json();

const prompt = `
Create a ${days}-day travel plan for a trip.

Trip Details:
Origin: ${origin}
Destination: ${destination}
Days: ${days}
Budget: ${budget}
Travel With: ${travelWith}

IMPORTANT:
- Return ONLY valid JSON.
- Do NOT include explanations.
- Do NOT wrap in markdown.
- Respect number of days strictly.
- Always return EXACTLY 3 hotels.
- Always return EXACTLY 3 famous local foods.
- Generate real tourist attractions.
- Do not repeat places.
- Use real image URLs OR:
  https://via.placeholder.com/400x300?text=Image

Return JSON in this EXACT structure:

{
  "destination": "${destination}",
  "duration": "${days} Days",
  "budget": "${budget}",
  "hotels": [
    {
      "hotel_name": "",
      "hotel_address": "",
      "hotel_image_url": "",
      "price_per_night": "",
      "rating": ""
    }
  ],
  "foods": [
    {
      "food_name": "",
      "food_description": "",
      "food_image_url": ""
    }
  ],
  "itinerary": [
    {
      "day": 1,
      "activities": [
        {
          "time_of_day": "morning",
          "place_name": "",
          "place_address": "",
          "place_details": "",
          "place_image_url": "",
          "ticket_pricing": ""
        },
        {
          "time_of_day": "afternoon",
          "place_name": "",
          "place_address": "",
          "place_details": "",
          "place_image_url": "",
          "ticket_pricing": ""
        },
        {
          "time_of_day": "evening",
          "place_name": "",
          "place_address": "",
          "place_details": "",
          "place_image_url": "",
          "ticket_pricing": ""
        }
      ]
    }
  ]
}
`;
    const response = await openai.chat.completions.create({
      model: "openai/gpt-4o-mini",
      messages: [
        { role: "system", content: "Return ONLY JSON." },
        { role: "user", content: prompt },
      ],
    });

    let text = response.choices[0].message.content || "{}";
    text = text.replace(/```json|```/g, "").trim();

    let trip_plan;

    try {
      trip_plan = JSON.parse(text);
    } catch {
      trip_plan = {};
    }


const client = await clerkClient();

await client.users.updateUser(user.id, {
  publicMetadata: {
    tripCount: usageCount + 1,
  },
});

    return NextResponse.json({
      trip_plan,
      remainingUses: 10 - (usageCount + 1),
    });

  } catch (error) {
    console.error("ERROR:", error);

    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}