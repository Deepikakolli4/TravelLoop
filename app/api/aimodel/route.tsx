import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENAI_API_KEY,
});

const QUESTION_KEYWORDS = {
  DESTINATION: "Where would you like to travel?",
  ORIGIN: "Where are you travelling from?",
  TRIPTYPE: "What type of trip are you planning?",
  BUDGET: "What is your budget for the trip?",
  GROUP: "How many people are travelling?",
  DURATION: "How many days will your trip be?",
};

export async function POST(req: Request) {
  try {
    const user = await currentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    console.log("[DEBUG] === NEW REQUEST RECEIVED ===");

    const { messages = [] } = body;

    if (!Array.isArray(messages)) {
      return NextResponse.json(
        { error: "messages must be an array" },
        { status: 400 }
      );
    }

    const userMessages = messages.filter((m: any) => m?.role === "user");
    const assistantMessages = messages.filter((m: any) => m?.role === "assistant");

    console.log("[DEBUG] user messages count:", userMessages.length);
    console.log("[DEBUG] assistant messages count:", assistantMessages.length);

    let responseText = "";
    let uiType: string | undefined = undefined;

    /*
    =====================================
    CHAT FLOW CONTROL (FIXED)
    =====================================
    */

    switch (userMessages.length) {
      case 0:
        console.log("[STEP 1] Asking DESTINATION");
        responseText = QUESTION_KEYWORDS.DESTINATION;
        break;

      case 1:
        console.log("[STEP 2] Asking ORIGIN");
        responseText = QUESTION_KEYWORDS.ORIGIN;
        break;

      case 2:
        console.log("[STEP 3] Asking TRIP TYPE");
        responseText = QUESTION_KEYWORDS.TRIPTYPE;
        uiType = "tripType";
        break;

      case 3:
        console.log("[STEP 4] Asking BUDGET");
        responseText = QUESTION_KEYWORDS.BUDGET;
        uiType = "budget";
        break;

      case 4:
        console.log("[STEP 5] Asking GROUP SIZE");
        responseText = QUESTION_KEYWORDS.GROUP;
        uiType = "groupSize";
        break;

      case 5:
        console.log("[STEP 6] Asking TRIP DURATION");
        responseText = QUESTION_KEYWORDS.DURATION;
        uiType = "tripDuration";
        break;

      default:
        console.log("[STEP 7] GENERATING ITINERARY");

        const destination = userMessages[0]?.content?.trim() || "unknown";
        const origin = userMessages[1]?.content?.trim() || "unknown";
        const tripType = userMessages[2]?.content?.trim() || "Leisure";
        const budget = userMessages[3]?.content?.trim() || "Moderate";
        const group = userMessages[4]?.content?.trim() || "Couple";
        const days = userMessages[5]?.content?.trim() || "5";

        console.log("[DEBUG] Using answers:");
        console.log("destination:", destination);
        console.log("origin:", origin);
        console.log("tripType:", tripType);
        console.log("budget:", budget);
        console.log("group:", group);
        console.log("days:", days);

        const prompt = `
You are an expert travel planner.

Create a detailed travel itinerary in JSON format.

Trip Details:
Destination: ${destination}
Origin: ${origin}
Trip Type: ${tripType}
Budget: ${budget}
Group Size: ${group}
Trip Duration: ${days} days

Return ONLY JSON in this format:

{
  "destination": "",
  "duration": "",
  "budget": "",
  "tripType": "",
  "groupSize": "",
  "dailyPlan": [
    {
      "day": 1,
      "morning": "",
      "afternoon": "",
      "evening": "",
      "stay": "",
      "restaurant": ""
    }
  ]
}
`;

        const aiResponse = await openai.chat.completions.create({
          model: "deepseek/deepseek-chat",
          messages: [
            {
              role: "system",
              content: "Return ONLY valid JSON. No explanation.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          temperature: 0.35,
          max_tokens: 4500,
        });

        let text = aiResponse.choices?.[0]?.message?.content?.trim() || "{}";

        let trip_plan = {};

        try {
          const cleaned = text
            .replace(/```json/g, "")
            .replace(/```/g, "")
            .trim();

          trip_plan = JSON.parse(cleaned);
        } catch (e) {
          console.error("[ERROR] JSON parsing failed:", e);

          trip_plan = {
            error: "Invalid JSON from AI",
            raw: text,
          };
        }

        return NextResponse.json({
          resp: "Your travel itinerary is ready!",
          ui: "final",
          trip_plan,
        });
    }

    console.log("[RESPONSE] Sending question:", responseText);

    return NextResponse.json({
      resp: responseText,
      ui: uiType,
    });

  } catch (error) {
    console.error("[CRITICAL] API route crashed:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}