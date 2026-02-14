"use client";
 
import React from "react";
import { Carousel, Card } from "@/components/ui/apple-cards-carousel";
 
export function PopularCityList() {
  const cards = data.map((card, index) => (
    <Card key={card.src} card={card} index={index} />
  ));
 
  return (
    <div className="w-full h-full py-20">
      <h2 className="max-w-5xl pl-4 mx-auto text-xl md:text-3xl font-bold text-neutral-800 dark:text-neutral-200 font-sans">
        Popular Destinations To Visit
      </h2>
      <Carousel items={cards} />
    </div>
  );
}
 
const DummyContent = ({
  description,
  image,
}: {
  description: string;
  image: string;
}) => {
  return (
    <div className="bg-[#F5F5F7] dark:bg-neutral-800 
                    p-5 md:p-6 
                    rounded-2xl 
                    mb-4 
                    flex flex-col md:flex-row 
                    gap-4 md:gap-6 
                    items-center">

      {/* Image Section */}
      <img
        src={image}
        alt="City preview"
        className="w-full md:w-48 h-40 md:h-44 object-cover rounded-lg"
      />

      {/* Text Content */}
      <div className="flex-1 text-center md:text-left">
        <p className="text-neutral-700 dark:text-neutral-300 text-sm md:text-base leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
};
 
const data = [
  {
    category: "India",
    title: "Harbour Views – Opera House, Bondi Beach & Wildlife",
    src: "https://images.unsplash.com/photo-1532664189809-02133fee698d?w=600",
    content: (
      <DummyContent
        description="Explore the vibrant culture of India with its historical monuments, colorful streets, and diverse traditions. From royal palaces to scenic coastlines, India offers an unforgettable travel experience."
        image="https://images.unsplash.com/photo-1532664189809-02133fee698d?w=800"
      />
    ),
  },
  {
    category: "France",
    title: "Paris – Eiffel Tower, Louvre & Art Culture",
    src: "https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?w=600",
    content: (
      <DummyContent
        description="Paris is the city of love, art, and fashion. Walk through charming streets, admire historic museums, and enjoy world-class cuisine."
        image="https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?w=800"
      />
    ),
  },
  {
    category: "USA",
    title: "New York – Times Square, Central Park & Broadway",
    src: "https://images.unsplash.com/photo-1569112749402-52cf70d0c172?w=600",
    content: (
      <DummyContent
        description="Experience the energy of New York City — skyscrapers, Broadway shows, world-class shopping, and iconic landmarks."
        image="https://images.unsplash.com/photo-1569112749402-52cf70d0c172?w=800"
      />
    ),
  },
  {
    category: "Japan",
    title: "Tokyo – Cherry Blossoms, Temples & Technology",
    src: "https://images.unsplash.com/photo-1522547902298-51566e4fb383?w=600",
    content: (
      <DummyContent
        description="Tokyo blends ancient traditions with futuristic innovation, offering temples, neon streets, and world-famous cuisine."
        image="https://images.unsplash.com/photo-1522547902298-51566e4fb383?w=800"
      />
    ),
  },
  {
    category: "Italy",
    title: "Rome – Colosseum, Vatican & Roman History",
    src: "https://images.unsplash.com/photo-1603199766980-fdd4ac568a11?w=600",
    content: (
      <DummyContent
        description="Walk through centuries of history in Rome — from the Colosseum to Renaissance art and authentic Italian cuisine."
        image="https://images.unsplash.com/photo-1603199766980-fdd4ac568a11?w=800"
      />
    ),
  },
  {
    category: "UAE",
    title: "Dubai – Luxury, Skyscrapers & Desert Safari",
    src: "https://images.unsplash.com/photo-1546412414-e1885259563a?w=600",
    content: (
      <DummyContent
        description="Dubai blends futuristic architecture with desert adventures, luxury shopping, and iconic skylines."
        image="https://images.unsplash.com/photo-1546412414-e1885259563a?w=800"
      />
    ),
  },
  {
    category: "UK",
    title: "London – History, Culture & Royal Heritage",
    src: "https://images.unsplash.com/photo-1560580184-2f022cabec4a?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8dS5rfGVufDB8fDB8fHww",
    content: (
      <DummyContent
        description="Explore London’s royal palaces, museums, bridges, and vibrant streets filled with culture and history."
        image="https://images.unsplash.com/photo-1560580184-2f022cabec4a?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8dS5rfGVufDB8fDB8fHww"
      />
    ),
  },
  {
    category: "Indonesia",
    title: "Bali – Beaches, Temples & Nature Retreats",
    src: "https://images.unsplash.com/photo-1524675053444-52c3ca294ad2?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fGluZG9uZXNpYXxlbnwwfHwwfHx8MA%3D%3D",
    content: (
      <DummyContent
        description="Relax in Bali’s tropical paradise featuring lush rice terraces, serene beaches, and spiritual retreats."
        image="https://images.unsplash.com/photo-1524675053444-52c3ca294ad2?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fGluZG9uZXNpYXxlbnwwfHwwfHx8MA%3D%3D"
      />
    ),
  },
];
