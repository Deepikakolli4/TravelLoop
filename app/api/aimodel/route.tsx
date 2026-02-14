import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
export const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
});

const PROMPT = `
You are an Al Trip Planner Agent.You should be interactive and interesting. Your goal is to help the user plan a trip by asking one relevant trip-related question at a time.
Only ask questions about the following details in order, and wait for the user's answer before asking the next:
1. Starting location (source location only avoid asking any codes)
2. Destination city or country
3. Group size (Solo, Couple, Family, Friends)
4. Budget (Low, Medium, High)
5. Trip duration (number of days)
6. Travel interests (e.g., adventure, sightseeing, cultural, food, nightlife, relaxation)
7. Special requirements or preferences (if any)
Do not ask multiple questions at once, and never ask irrelevant questions.
If any answer is missing or unclear, politely ask the user to clarify before proceeding.
Always maintain a conversational, interactive style while asking questions.
Along with response also send which ui component to display for generative UI for example 'budget/groupSize/tripDuration/final),
 where Final means Al generating complete final output Once all required information is collected, generate and 
 return a strict JSON response only (no explanations or extra text or no markdown) with following JSON schema:
{
resp:'Text Resp',
ui:'budget/groupSize/tripDuration/final)'
}`;

const FINAL_PROMPT = 
`Generate Travel Plan with give details,give me Hotels options list with HotelName,Hotel address, Price,
 hotel image url, geo coordinates, rating, description and suggest itenary with placename, Place Details, 
 Place Image Url, Geo Cordinates, Place address, ticket Pricing, Time travel each of the location , with each day 
 plan with best time to visit in  strict JSON response only
Output Schema:
{
  "trip_plan": {
    "destination": "string",
    "duration": "string",
    "origin": "string",
    "budget": "string",
    "group_size": "string",
    "hotels": [
      {
        "hotel_name": "string",
        "hotel_address": "string",
        "price_per_night": "string",
        "hotel_image_url": "string",
        "geo_cordinates": {
          "latitude": "number",
          "longitude": "number"
        },
        "rating": "number",
        "description": "string"
      }
    ],
    "itinerary": [
      {
        "day": "number",
        "day_plan": "string",
        "best_time_to_visit_day": "string",
        "activities": [
          {
            "place_name": "string",
            "place_details": "string",
            "place_image_url": "string",
            "geo_coordinates": {
              "latitude": "number",
              "longitude": "number"
            },
            "place_address": "string",
            "ticket_pricing": "string",
            "time_travel_each_location": "string",
            "best_time_to_visit": "string"
          }
        ]
      }
    ]
  }
}`


export async function POST(req: NextRequest) {
  const { messages , isFinal } = await req.json();
  try {
    const completion = await openai.chat.completions.create({
      model:"nex-agi/deepseek-v3.1-nex-n1:free",
      response_format:{type: 'json_object'},
      messages: [
        {
          role: "system",
          content: isFinal? FINAL_PROMPT : PROMPT,
        },
        ...messages,
      ],
    });
    console.log(completion.choices[0].message);
    const message = completion.choices[0].message;
    return NextResponse.json(JSON.parse(message.content ?? ""));
  } catch (error: any) {
    if (error.status === 429) {
      return NextResponse.json(
        { error: "Model is busy. Please try again in a few seconds." },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
