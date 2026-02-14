"use client";

import React, {
  useEffect,
  useRef,
  useState,
  createContext,
  useContext,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { IconArrowNarrowLeft, IconArrowNarrowRight, IconX } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { useOutsideClick } from "@/hooks/use-outside-click";

interface CarouselProps {
  items: React.ReactNode[];
  initialScroll?: number;
}

type CardType = {
  src: string;
  title: string;
  category: string;
  content: React.ReactNode;
};

export const CarouselContext = createContext<{
  onCardClose: (index: number) => void;
  currentIndex: number;
}>({
  onCardClose: () => {},
  currentIndex: 0,
});

export const Carousel = ({ items, initialScroll = 0 }: CarouselProps) => {
  const carouselRef = useRef<HTMLDivElement | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (carouselRef.current) {
      carouselRef.current.scrollLeft = initialScroll;
      checkScroll();
    }
  }, [initialScroll]);

  const checkScroll = () => {
    if (!carouselRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth);
  };

  const scrollLeft = () => {
    carouselRef.current?.scrollBy({ left: -300, behavior: "smooth" });
  };

  const scrollRight = () => {
    carouselRef.current?.scrollBy({ left: 300, behavior: "smooth" });
  };

  const handleCardClose = (index: number) => {
    if (!carouselRef.current) return;
    const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
    const cardWidth = isMobile ? 230 : 384;
    const gap = isMobile ? 4 : 8;

    carouselRef.current.scrollTo({
      left: (cardWidth + gap) * (index + 1),
      behavior: "smooth",
    });

    setCurrentIndex(index);
  };

  return (
    <CarouselContext.Provider value={{ onCardClose: handleCardClose, currentIndex }}>
      <div className="relative w-full">
        <div
          ref={carouselRef}
          onScroll={checkScroll}
          className="flex w-full overflow-x-scroll scroll-smooth py-10 [scrollbar-width:none]"
        >
          <div className="mx-auto flex max-w-7xl gap-4 pl-4">
            {items.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.15 }}
                className="rounded-3xl last:pr-[5%]"
              >
                {item}
              </motion.div>
            ))}
          </div>
        </div>

       <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-between px-4 pointer-events-none">
  <button
    onClick={scrollLeft}
    disabled={!canScrollLeft}
    className="pointer-events-auto flex items-center justify-center 
               w-12 h-12 rounded-full 
               bg-white shadow-md 
               hover:bg-gray-100 
               disabled:opacity-40"
  >
    <IconArrowNarrowLeft className="w-6 h-6 text-gray-700" />
  </button>

  <button
    onClick={scrollRight}
    disabled={!canScrollRight}
    className="pointer-events-auto flex items-center justify-center 
               w-12 h-12 rounded-full 
               bg-white shadow-md 
               hover:bg-gray-100 
               disabled:opacity-40"
            >
    <IconArrowNarrowRight className="w-6 h-6 text-gray-700" />
           </button>
         </div>
      </div>
    </CarouselContext.Provider>
  );
};

export const Card = ({
  card,
  index,
  layout = false,
}: {
  card: CardType;
  index: number;
  layout?: boolean;
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);
  const { onCardClose } = useContext(CarouselContext);

  useOutsideClick(ref as React.RefObject<HTMLDivElement>, () => setOpen(false));

  return (
    <>
      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <motion.div
              className="fixed inset-0 bg-black/80"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />

            <motion.div
              ref={ref}
              layoutId={layout ? `card-${index}` : undefined}
              className="relative z-50 max-w-4xl rounded-2xl bg-white p-8"
            >
              <button
                onClick={() => {
                  setOpen(false);
                  onCardClose(index);
                }}
                className="absolute right-4 top-4"
              >
                <IconX />
              </button>

              <h2 className="text-3xl font-bold">{card.title}</h2>
              <p className="mt-2 text-gray-500">{card.category}</p>
              <div className="mt-6">{card.content}</div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <motion.button
        layoutId={layout ? `card-${index}` : undefined}
        onClick={() => setOpen(true)}
        className="relative h-80 w-56 overflow-hidden rounded-3xl bg-gray-200"
      >
        <img
          src={card.src}
          alt={card.title}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-b from-black/60 to-transparent p-4">
          <p className="text-white text-sm">{card.category}</p>
          <h3 className="text-white text-xl font-semibold">{card.title}</h3>
        </div>
      </motion.button>
    </>
  );
};
