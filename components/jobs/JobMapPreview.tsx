"use client";

import React from "react";
import Map, { Marker } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN as string | undefined;

type JobMapPreviewProps = {
  lat: number;
  lng: number;
  locationText: string;
};

export function JobMapPreview({ lat, lng, locationText }: JobMapPreviewProps) {
  if (!MAPBOX_TOKEN) {
    return (
      <div className="w-full h-48 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center gap-2">
        <span className="material-symbols-outlined text-slate-400 text-3xl">location_on</span>
        <p className="text-sm font-bold text-slate-600 dark:text-slate-300 text-center px-4">{locationText}</p>
        <p className="text-xs text-slate-400">Cấu hình NEXT_PUBLIC_MAPBOX_TOKEN để xem bản đồ</p>
      </div>
    );
  }

  return (
    <div className="w-full h-48 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 relative">
      <Map
        mapboxAccessToken={MAPBOX_TOKEN}
        initialViewState={{
          longitude: lng,
          latitude: lat,
          zoom: 14,
        }}
        style={{ width: "100%", height: "100%" }}
        mapStyle="mapbox://styles/mapbox/light-v11"
        reuseMaps
      >
        <Marker longitude={lng} latitude={lat} anchor="bottom">
          <span className="material-symbols-outlined text-3xl text-red-500 drop-shadow-md">location_on</span>
        </Marker>
      </Map>
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-full bg-white/95 dark:bg-slate-900/95 shadow border border-slate-200 dark:border-slate-700">
        <span className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1">
          <span className="material-symbols-outlined text-base text-primary">place</span>
          {locationText}
        </span>
      </div>
    </div>
  );
}
