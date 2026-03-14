import React from "react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { UtensilsCrossed } from "lucide-react";

type Props = {
  name: string;
  index: number;
  destination?: string;
};

const foodHints = [
  "Best for lunch or dinner.",
  "Try this at a well-rated local spot.",
  "Popular among travelers and locals.",
  "Great pick to taste authentic flavors.",
  "Pair this with a local drink.",
];

const DEFAULT_IMAGE = "/placeholder.svg";

const buildFoodPhotoCandidates = (name: string, destination?: string): string[] => {
  const params = new URLSearchParams({
    placeName: name,
  });

  if (destination?.trim()) {
    params.set("context", `${destination} food`);
  }

  return [
    `/api/google-place-photo?${params.toString()}`,
    DEFAULT_IMAGE,
  ];
};

const FoodCardItem = ({ name, index, destination }: Props) => {
  const hint = foodHints[index % foodHints.length];
  const [imgCandidates, setImgCandidates] = useState<string[]>([]);
  const [imgIndex, setImgIndex] = useState(0);

  useEffect(() => {
    const candidates = buildFoodPhotoCandidates(name, destination);
    setImgCandidates(Array.from(new Set(candidates)));
    setImgIndex(0);
  }, [name, destination]);

  const imageSrc = imgCandidates[imgIndex] || DEFAULT_IMAGE;

  return (
    <article className="rounded-xl border border-orange-200 bg-linear-to-br from-orange-50 to-amber-50 p-4 shadow-sm">
      <div className="mb-3 overflow-hidden rounded-lg border border-orange-200 bg-white">
        <Image
          src={imageSrc}
          alt={name}
          width={600}
          height={360}
          className="h-36 w-full object-cover"
          onError={() => {
            setImgIndex((prev) => Math.min(prev + 1, Math.max(0, imgCandidates.length - 1)));
          }}
        />
      </div>
      <div className="flex items-center gap-2">
        <div className="rounded-full bg-white p-2 border border-orange-200">
          <UtensilsCrossed className="h-4 w-4 text-orange-600" />
        </div>
        <h4 className="text-sm font-semibold text-orange-900">{name}</h4>
      </div>
      <p className="mt-2 text-xs text-orange-800">{hint}</p>
    </article>
  );
};

export default FoodCardItem;
