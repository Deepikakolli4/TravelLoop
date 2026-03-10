"use client";

import { Plane, Train, Building, Bus } from "lucide-react";

export default function Home() {

  const services = [
    {
      name: "Flights",
      desc: "Search and book the best flight deals worldwide.",
      icon: Plane,
      color: "from-blue-400 to-blue-600",
      iconColor: "text-blue-600",
      link: "https://www.makemytrip.com/flights/"
    },
    {
      name: "Trains",
      desc: "Book train tickets easily through IRCTC.",
      icon: Train,
      color: "from-green-400 to-green-600",
      iconColor: "text-green-600",
      link: "https://www.irctc.co.in"
    },
    {
      name: "Buses",
      desc: "Reserve bus tickets quickly via RTC services.",
      icon: Bus,
      color: "from-orange-400 to-orange-600",
      iconColor: "text-orange-600",
      link: "https://www.apsrtconline.in"
    },
    {
      name: "Hotels",
      desc: "Discover cozy stays and amazing accommodations.",
      icon: Building,
      color: "from-purple-400 to-purple-600",
      iconColor: "text-purple-600",
      link: "https://www.makemytrip.com/hotels/"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br">

      {/* Hero Section */}
      <header className="py-20 text-center px-4">
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800 mb-6">
          Plan Your Journey With{" "}<span className="text-primary">Ease</span>{" "}
        </h1>

        <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
          Travel Loop helps you book flights, trains, buses and hotels in one
          place. Start your next adventure with just one click.
        </p>
      </header>

      {/* Services */}
      <main className="max-w-6xl mx-auto px-6 pb-20">

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">

          {services.map((service, index) => {
            const Icon = service.icon;

            return (
              <div
                key={index}
                onClick={() => window.open(service.link, "_blank")}
                className="group bg-white rounded-2xl shadow-lg cursor-pointer transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl"
              >

                {/* Top gradient */}
                <div
                  className={`h-28 w-full bg-gradient-to-r ${service.color} rounded-t-2xl`}
                />

                {/* Content */}
                <div className="p-6 flex flex-col items-center text-center">

                  {/* Icon */}
                  <div className="bg-gray-50 p-4 rounded-full shadow-sm group-hover:scale-110 transition">
                    <Icon className={`w-10 h-10 ${service.iconColor}`} />
                  </div>

                  <h3 className="text-xl font-semibold mt-4">
                    {service.name}
                  </h3>

                  <p className="text-sm text-gray-500 mt-2">
                    {service.desc}
                  </p>

                </div>

              </div>
            );
          })}

        </div>

      </main>

    </div>
  );
}