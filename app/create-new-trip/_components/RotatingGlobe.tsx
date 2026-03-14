"use client";

import React, { useEffect, useRef } from "react";

const CITIES = [
  { lat: 40.7, lng: -74, label: "New York" },
  { lat: 51.5, lng: -0.1, label: "London" },
  { lat: 48.8, lng: 2.3, label: "Paris" },
  { lat: 35.6, lng: 139.7, label: "Tokyo" },
  { lat: 19.0, lng: 72.8, label: "Mumbai" },
  { lat: 22.3, lng: 114.2, label: "Hong Kong" },
  { lat: -33.9, lng: 151.2, label: "Sydney" },
  { lat: 1.3, lng: 103.8, label: "Singapore" },
  { lat: 25.2, lng: 55.3, label: "Dubai" },
  { lat: 55.7, lng: 37.6, label: "Moscow" },
  { lat: 39.9, lng: 116.4, label: "Beijing" },
  { lat: 28.6, lng: 77.2, label: "Delhi" },
  { lat: -23.5, lng: -46.6, label: "São Paulo" },
  { lat: 30.0, lng: 31.2, label: "Cairo" },
  { lat: 37.7, lng: -122.4, label: "San Francisco" },
  { lat: 41.0, lng: 29.0, label: "Istanbul" },
  { lat: 34.0, lng: -118.2, label: "Los Angeles" },
  { lat: 43.7, lng: -79.4, label: "Toronto" },
  { lat: 59.9, lng: 30.3, label: "St. Petersburg" },
  { lat: 52.5, lng: 13.4, label: "Berlin" },
  { lat: 41.9, lng: 12.5, label: "Rome" },
  { lat: 40.4, lng: -3.7, label: "Madrid" },
  { lat: 31.2, lng: 121.5, label: "Shanghai" },
  { lat: 37.5, lng: 127.0, label: "Seoul" },
  { lat: -34.6, lng: -58.4, label: "Buenos Aires" },
  { lat: -1.3, lng: 36.8, label: "Nairobi" },
  { lat: 13.7, lng: 100.5, label: "Bangkok" },
  { lat: 23.1, lng: 113.3, label: "Guangzhou" },
];

const ARCS = [
  { startLat: 40.7, startLng: -74, endLat: 51.5, endLng: -0.1 },
  { startLat: 51.5, startLng: -0.1, endLat: 48.8, endLng: 2.3 },
  { startLat: 40.7, startLng: -74, endLat: 19.0, endLng: 72.8 },
  { startLat: 35.6, startLng: 139.7, endLat: 1.3, endLng: 103.8 },
  { startLat: 22.3, startLng: 114.2, endLat: 35.6, endLng: 139.7 },
  { startLat: -33.9, startLng: 151.2, endLat: 1.3, endLng: 103.8 },
  { startLat: 55.7, startLng: 37.6, endLat: 51.5, endLng: -0.1 },
  { startLat: 25.2, startLng: 55.3, endLat: 19.0, endLng: 72.8 },
  { startLat: 37.7, startLng: -122.4, endLat: 35.6, endLng: 139.7 },
  { startLat: -23.5, startLng: -46.6, endLat: 40.7, endLng: -74 },
];

const RotatingGlobe = () => {
  const globeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!globeRef.current) return;

    let globeInstance: any;

    import("globe.gl").then((GlobeGL) => {
      const Globe = GlobeGL.default;

      globeInstance = new Globe(globeRef.current!)
        .globeImageUrl("//unpkg.com/three-globe/example/img/earth-blue-marble.jpg")
        .bumpImageUrl("//unpkg.com/three-globe/example/img/earth-topology.png")
        .backgroundImageUrl("//unpkg.com/three-globe/example/img/night-sky.png")
        .width(globeRef.current!.clientWidth)
        .height(globeRef.current!.clientHeight)
        .pointsData(CITIES)
        .pointColor(() => "#ffcc44")
        .pointAltitude(0.01)
        .pointRadius(0.4)
        .pointLabel("label")
        .labelsData(CITIES)
        .labelLat((d: any) => d.lat)
        .labelLng((d: any) => d.lng)
        .labelText((d: any) => d.label)
        .labelSize(1.2)
        .arcsData(ARCS)
        .arcColor(() => [
          "rgba(100,180,255,0)",
          "rgba(100,180,255,0.8)",
          "rgba(100,180,255,0)",
        ])
        .arcAltitude(0.3)
        .arcStroke(0.5)
        .arcDashLength(0.4)
        .arcDashGap(0.2)
        .arcDashAnimateTime(2000);

      globeInstance.controls().autoRotate = true;
      globeInstance.controls().autoRotateSpeed = 0.8;
      globeInstance.controls().enableZoom = true;
    });

    return () => {
      if (globeInstance) globeInstance._destructor?.();
    };
  }, []);

  return <div ref={globeRef} className="w-full h-full" />;
};

export default RotatingGlobe;