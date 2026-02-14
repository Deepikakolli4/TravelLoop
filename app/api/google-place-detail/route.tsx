import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function POST(req:NextRequest) {
    const {placeName} = await req.json();
    const BASE_URL = 'https://places.googleapis.com/v1/places:searchText';
    const config = {
        headers:{
            'Content-Type' : 'application/json',
            'X-Goog-Api-Key' : process?.env?.GOOGLE_PLACE_API_KEY,
            'X-Goog-FieldMask' : [
                'places.photos',
                'places.displayName',
                'places.id'
            ]
        }
    };

    try{
    const result = await axios.post(BASE_URL, {
        textQuery: placeName
    },
    config);

    const placeRefName = result?.data?.places[0]?.name
     
     return NextResponse.json(result?.data);
   } catch (error) {
     return NextResponse.json({error: error});
   }
}