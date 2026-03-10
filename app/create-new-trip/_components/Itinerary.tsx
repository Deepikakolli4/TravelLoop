import React from 'react';
import { Timeline } from "@/components/ui/timeline";
import HotelCardItem from './HotelCardItem';
import PlaceCardItem from './PlaceCardItem';
import { TripInfo } from "../_components/types";

const TRIP_DATA : TripInfo = {
  budget: "Moderate",
  destination: "Hyderabad",
  duration: "6 Days",
  group_size: "Family 3-5 People",
  origin: "Vizag (Visakhapatnam)",
  hotels: [
    {
      description:
        "Luxury hotel with modern amenities, close to major temples and city center",
      geo_coordinates: {
        latitude: 17.412299,
        longitude: 78.471092,
      },
      hotel_address:
        "Tank Bund Road, Near Hussain Sagar Lake, Hyderabad, Telangana 500080",
      hotel_image_url:
        "https://example.com/marriott-hyderabad.jpg",
      hotel_name: "Hotel Marriott Hyderabad",
      price_per_night: "₹4,500-₹6,000",
      rating: 4.5,
    },
    {
      description:
        "Premium hotel known for excellent service and central location",
      geo_coordinates: {
        latitude: 17.425793,
        longitude: 78.444878,
      },
      hotel_address:
        "Road No 1, Banjara Hills, Hyderabad, Telangana 500034",
      hotel_image_url:
        "https://example.com/taj-krishna.jpg",
      hotel_name: "Taj Krishna Hyderabad",
      price_per_night: "₹5,000-₹7,000",
      rating: 4.7,
    },
    {
      description:
        "Modern hotel with family-friendly facilities",
      geo_coordinates: {
        latitude: 17.455896,
        longitude: 78.364543,
      },
      hotel_address:
        "Near HITEC City, Kondapur, Hyderabad, Telangana 500081",
      hotel_image_url:
        "https://example.com/novotel-hyderabad.jpg",
      hotel_name: "Hotel Novotel Hyderabad",
      price_per_night: "₹3,500-₹5,000",
      rating: 4.3,
    },
  ],
  itinerary: [
    {
      activities: [
        {
          best_time_to_visit:
            "Morning 8 AM - 11 AM or Evening 4 PM - 7 PM",
          geo_coordinates: {
            latitude: 17.406187,
            longitude: 78.469137,
          },
          place_address:
            "Adarsh Nagar, Hyderabad, Telangana 500063",
          place_details:
            "Beautiful white marble temple dedicated to Lord Venkateswara, situated on Naubat Pahad hill",
          place_image_url:
            "https://example.com/birla-mandir.jpg",
          place_name: "Birla Mandir (Venkateswara Temple)",
          ticket_pricing: "Free Entry",
          time_travel_each_location: "2-3 hours",
        },
      ],
      best_time_to_visit_day: "Morning 8 AM - 11 AM",
      day: 1,
      day_plan: "Arrival and Birla Mandir",
    },
    {
      activities: [
        {
          best_time_to_visit: "Early morning 6 AM - 11 AM",
          geo_coordinates: {
            latitude: 17.286282,
            longitude: 78.333456,
          },
          place_address:
            "Chilkur Village, Moinabad Mandal, Hyderabad, Telangana 500075",
          place_details:
            "Famous temple located 25km from Hyderabad, known for wish fulfillment and unique customs",
          place_image_url:
            "https://example.com/chilkur-balaji.jpg",
          place_name: "Chilkur Balaji Temple (Visa Balaji)",
          ticket_pricing: "Free Entry",
          time_travel_each_location:
            "6-7 hours including travel",
        },
      ],
      best_time_to_visit_day: "Morning 6 AM - 11 AM",
      day: 2,
      day_plan: "Chilkur Balaji Temple",
    },
    {
      activities: [
        {
          best_time_to_visit:
            "Morning 7 AM - 12 PM or Evening 5 PM - 8 PM",
          geo_coordinates: {
            latitude: 17.412345,
            longitude: 78.478901,
          },
          place_address:
            "Banjara Hills, Road No 12, Hyderabad, Telangana 500034",
          place_details:
            "Replica of Puri Jagannath Temple, known for Rath Yatra celebrations",
          place_image_url:
            "https://example.com/jagannath-temple.jpg",
          place_name: "Jagannath Temple",
          ticket_pricing: "Free Entry",
          time_travel_each_location: "2-3 hours",
        },
        {
          best_time_to_visit:
            "Morning 7 AM - 11 AM or Evening 5 PM - 9 PM",
          geo_coordinates: {
            latitude: 17.438921,
            longitude: 78.445612,
          },
          place_address:
            "Jubilee Hills, Hyderabad, Telangana 500033",
          place_details:
            "Beautiful temple dedicated to Shirdi Sai Baba",
          place_image_url:
            "https://example.com/sai-baba-temple.jpg",
          place_name: "Sai Baba Temple",
          ticket_pricing: "Free Entry",
          time_travel_each_location: "1-2 hours",
        },
      ],
      best_time_to_visit_day: "Morning 7 AM - 12 PM",
      day: 3,
      day_plan:
        "Jagannath Temple and local spiritual sites",
    },
    {
      activities: [
        {
          best_time_to_visit: "Early morning 5 AM - 1 PM",
          geo_coordinates: {
            latitude: 17.585345,
            longitude: 78.943456,
          },
          place_address:
            "Yadagirigutta, Nalgonda District, Telangana 508115",
          place_details:
            "Famous cave temple dedicated to Lord Narasimha, known for healing powers",
          place_image_url:
            "https://example.com/yadagirigutta-temple.jpg",
          place_name:
            "Sri Lakshmi Narasimha Temple, Yadagirigutta",
          ticket_pricing:
            "Free Entry (Special Darshan ₹50-₹100)",
          time_travel_each_location:
            "Full day excursion (6-8 hours)",
        },
      ],
      best_time_to_visit_day: "Early Morning 5 AM - 1 PM",
      day: 4,
      day_plan: "Yadagirigutta Temple",
    },
    {
      activities: [
        {
          best_time_to_visit:
            "Morning 8 AM - 12 PM (Non-prayer times for visitors)",
          geo_coordinates: {
            latitude: 17.361633,
            longitude: 78.474066,
          },
          place_address:
            "Ghansi Bazaar, Hyderabad, Telangana 500002",
          place_details:
            "One of the oldest and largest mosques in South India, built with soil from Mecca",
          place_image_url:
            "https://example.com/macca-masjid.jpg",
          place_name: "Macca Masjid (Mecca Masjid)",
          ticket_pricing: "Free Entry",
          time_travel_each_location: "1-2 hours",
        },
        {
          best_time_to_visit: "Morning 9 AM - 11 AM",
          geo_coordinates: {
            latitude: 17.358937,
            longitude: 78.471645,
          },
          place_address:
            "Pathar Gatti, Hyderabad, Telangana 500002",
          place_details:
            "Historic mosque near Charminar with beautiful architecture",
          place_image_url:
            "https://example.com/jama-masjid.jpg",
          place_name: "Jama Masjid Hyderabad",
          ticket_pricing: "Free Entry",
          time_travel_each_location: "1 hour",
        },
      ],
      best_time_to_visit_day: "Morning 8 AM - 12 PM",
      day: 5,
      day_plan: "Macca Masjid and nearby spiritual sites",
    },
    {
      activities: [
        {
          best_time_to_visit:
            "Morning 7 AM - 11 AM or Evening 5 PM - 8 PM",
          geo_coordinates: {
            latitude: 17.423456,
            longitude: 78.456789,
          },
          place_address:
            "Nampally, Hyderabad, Telangana 500001",
          place_details:
            "Beautiful temple dedicated to Lord Krishna, known for spiritual atmosphere and bhajans",
          place_image_url:
            "https://example.com/iskcon-hyderabad.jpg",
          place_name: "ISKCON Temple Hyderabad",
          ticket_pricing: "Free Entry",
          time_travel_each_location: "2-3 hours",
        },
      ],
      best_time_to_visit_day: "Morning 7 AM - 11 AM",
      day: 6,
      day_plan: "ISKCON Temple and departure",
    },
  ],
};

const Itinerary = () => {
  const timelineItems = [
    {
      title: "Recommended Hotels",
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
          {TRIP_DATA.hotels.map((hotel, index) => (
            <HotelCardItem key={`hotel-${index}`} hotel={hotel} />
          ))}
        </div>
      ),
    },
    ...TRIP_DATA.itinerary.map((dayData) => ({
      title: `Day ${dayData.day}`,
      content: (
        <div className="space-y-6 p-4">
          <p className="text-lg font-medium text-muted-foreground">
            Best Time: {dayData.best_time_to_visit_day || "Flexible"}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dayData.activities.map((activity, idx) => (
              <PlaceCardItem
                key={`activity-day${dayData.day}-${idx}`}
                activity={activity}
              />
            ))}
          </div>
        </div>
      ),
    })),
  ];

  return (
    <div className="relative w-full h-[83vh] overflow-y-auto bg-background">
      <Timeline data={timelineItems} tripData={TRIP_DATA} />
    </div>
  );
};

export default Itinerary;