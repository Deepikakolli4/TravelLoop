"use client"

import React, { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Wallet, Star,ExternalLink} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Hotel } from "./ChatBox";
import axios from "axios";

type Props = {
    hotel:Hotel
}
const HotelCardItem = ({hotel}:Props) => {
 
  useEffect(() =>{
    hotel&&GetGooglePlaceDetail();
  },[hotel]);


  const GetGooglePlaceDetail = async()=>{
    const  result = await axios.post('/api/google-place-detail',{
         placeNmae:hotel?.hotel_name
    });
    console.log(result.data);
  }


  return (
    <div className="flex flex-col gap-1">
      <Image
        src={"/placeholder.jpg"}
        alt="place-image"
        width={400}
        height={200}
        className="rounded-xl shadow object-cover mb-2"
      />
      <h2 className="font-semibold text-lg">{hotel?.hotel_name}</h2>
      <h2 className="text-gray-500">{hotel.hotel_address}</h2>
      <div className="flex justify-between items-center">
        <p className="flex gap-2 text-green-600">
          <Wallet /> {hotel.price_per_night}
        </p>
        <p className="flex gap-2 text-yellow-500">
          <Star />
          {hotel.rating}
        </p>
      </div>
      <p className="line-clamp-3 text-gray-500">{hotel.description}</p>
      <Link
        href={
          "https://www.google.com/maps/search/?api=1&query=" + hotel?.hotel_name
        }
        target="_blank"
      >
        <Button variant={"outline"} className="mt-4 border-black w-full">
          View
          <ExternalLink />
        </Button>
      </Link>
    </div>
  );
};

export default HotelCardItem;
