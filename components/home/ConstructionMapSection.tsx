"use client";

import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import Map, {
  Marker,
  Popup,
  NavigationControl,
  FullscreenControl,
} from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN as string | undefined;

type Site = {
  id: number;
  name: string;
  city: string;
  address: string;
  lat: number;
  lng: number;
  progress: number;
};

const MOCK_SITES: Site[] = [
  {
    id: 1,
    name: "Khu đô thị ven sông Hòa Xuân",
    city: "Đà Nẵng",
    address: "Cẩm Lệ, Đà Nẵng",
    lat: 16.0205,
    lng: 108.2346,
    progress: 45,
  },
  {
    id: 2,
    name: "Tòa nhà văn phòng trung tâm",
    city: "Đà Nẵng",
    address: "Hải Châu, Đà Nẵng",
    lat: 16.0678,
    lng: 108.2208,
    progress: 70,
  },
  {
    id: 3,
    name: "Khu công nghiệp Hòa Khánh mở rộng",
    city: "Đà Nẵng",
    address: "Liên Chiểu, Đà Nẵng",
    lat: 16.091,
    lng: 108.159,
    progress: 30,
  },
  {
    id: 4,
    name: "Nhà xưởng lắp ráp cơ khí",
    city: "Quảng Nam",
    address: "Điện Bàn, Quảng Nam",
    lat: 15.9064,
    lng: 108.2547,
    progress: 55,
  },
  {
    id: 5,
    name: "Cải tạo cầu vượt Nguyễn Tri Phương",
    city: "Đà Nẵng",
    address: "Thanh Khê, Đà Nẵng",
    lat: 16.067,
    lng: 108.196,
    progress: 35,
  },
  {
    id: 6,
    name: "Khu nghỉ dưỡng ven biển",
    city: "Đà Nẵng",
    address: "Ngũ Hành Sơn, Đà Nẵng",
    lat: 16.001,
    lng: 108.265,
    progress: 60,
  },
  {
    id: 7,
    name: "Kho logistics Liên Chiểu",
    city: "Đà Nẵng",
    address: "Cảng Liên Chiểu, Đà Nẵng",
    lat: 16.1305,
    lng: 108.149,
    progress: 40,
  },
  {
    id: 8,
    name: "Trung tâm thương mại mới",
    city: "Quảng Nam",
    address: "Hội An, Quảng Nam",
    lat: 15.8805,
    lng: 108.335,
    progress: 25,
  },
];

export const ConstructionMapSection = () => {
  const [selectedSite, setSelectedSite] = useState<Site | null>(null);
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);

  const initialViewState = useMemo(() => {
    if (!MOCK_SITES.length) {
      return {
        longitude: 108.2208,
        latitude: 16.0678,
        zoom: 11,
      };
    }

    const centerLat =
      MOCK_SITES.reduce((sum, s) => sum + s.lat, 0) / MOCK_SITES.length;
    const centerLng =
      MOCK_SITES.reduce((sum, s) => sum + s.lng, 0) / MOCK_SITES.length;

    return {
      longitude: centerLng,
      latitude: centerLat,
      zoom: 11,
    };
  }, []);

  return (
    <section className="py-28 bg-slate-900 text-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col lg:flex-row items-start gap-12 mb-14">
          <div className="flex-1">
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-secondary font-bold uppercase tracking-[0.25em] text-xs md:text-sm block mb-4"
            >
              Bản đồ công trình
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl md:text-4xl lg:text-5xl font-display font-bold mb-4"
            >
              Các công trình đang{" "}
              <span className="text-secondary">thi công tích cực</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-slate-300 text-lg leading-relaxed mb-6"
            >
              Vị trí mock data minh họa các dự án BuildForce đang theo dõi quanh
              Đà Nẵng, giúp bạn hình dung nhanh nơi mình có thể làm việc.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="space-y-4"
            >
              {MOCK_SITES.map((site) => {
                const isActive = selectedSite?.id === site.id;
                return (
                  <button
                    key={site.id}
                    type="button"
                    onClick={() =>
                      setSelectedSite((prev) =>
                        prev?.id === site.id ? null : site
                      )
                    }
                    className={`w-full text-left flex items-start gap-4 rounded-2xl p-4 transition-all border ${
                      isActive
                        ? "bg-slate-800 border-secondary shadow-lg shadow-secondary/30"
                        : "bg-slate-800/60 border-slate-700 hover:border-secondary/60 hover:bg-slate-800"
                    }`}
                  >
                    <div className="w-10 h-10 rounded-2xl bg-secondary/20 flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-secondary">
                        location_on
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-black text-base md:text-lg">
                          {site.name}
                        </p>
                        <span className="px-2 py-0.5 rounded-full bg-slate-700 text-[10px] font-black uppercase tracking-widest">
                          {site.city}
                        </span>
                      </div>
                      <p className="text-sm text-slate-300 font-medium mb-2">
                        {site.address}
                      </p>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-2 rounded-full bg-slate-700 overflow-hidden">
                          <div
                            className="h-full bg-secondary"
                            style={{ width: `${site.progress}%` }}
                          />
                        </div>
                        <span className="text-xs font-black text-slate-200 whitespace-nowrap">
                          {site.progress}% hoàn thành
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex-1 w-full"
          >
            <div className="relative rounded-[2.5rem] overflow-hidden border border-slate-700 bg-slate-900 shadow-2xl h-[360px] md:h-[420px]">
              {MAPBOX_TOKEN ? (
                <Map
                  initialViewState={initialViewState}
                  mapStyle="mapbox://styles/mapbox/light-v11"
                  mapboxAccessToken={MAPBOX_TOKEN}
                  style={{ width: "100%", height: "100%" }}
                  reuseMaps
                  onClick={() => setSelectedSite(null)}
                >
                  <NavigationControl
                    position="bottom-right"
                    showCompass={false}
                  />
                  <FullscreenControl position="top-right" />

                  {MOCK_SITES.map((site) => {
                    const isActive = selectedSite?.id === site.id;
                    return (
                      <Marker
                        key={site.id}
                        longitude={site.lng}
                        latitude={site.lat}
                        anchor="bottom"
                        onClick={(e) => {
                          e.originalEvent.stopPropagation();
                          setSelectedSite(site);
                        }}
                      >
                        <button
                          type="button"
                          className={`group flex flex-col items-center -translate-y-1 ${
                            isActive ? "scale-110" : "scale-100"
                          } transition-transform`}
                        >
                          <span
                            className={`material-symbols-outlined text-3xl drop-shadow-md ${
                              isActive ? "text-secondary" : "text-red-500"
                            }`}
                          >
                            location_on
                          </span>
                          <span className="mt-0.5 text-[10px] font-black px-2 py-0.5 rounded-full bg-white/90 text-slate-800 shadow-sm whitespace-nowrap">
                            {site.city}
                          </span>
                        </button>
                      </Marker>
                    );
                  })}

                  {selectedSite && (
                    <Popup
                      longitude={selectedSite.lng}
                      latitude={selectedSite.lat}
                      anchor="top"
                      closeOnClick={false}
                      focusAfterOpen={false}
                      onClose={() => setSelectedSite(null)}
                      offset={12}
                    >
                      <div className="min-w-[220px] max-w-xs">
                        <p className="text-sm font-black text-slate-900 mb-1">
                          {selectedSite.name}
                        </p>
                        <p className="text-xs font-medium text-slate-500 mb-2">
                          {selectedSite.address}
                        </p>
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex-1 h-1.5 rounded-full bg-slate-200 overflow-hidden">
                            <div
                              className="h-full bg-secondary"
                              style={{ width: `${selectedSite.progress}%` }}
                            />
                          </div>
                          <span className="text-[10px] font-black text-secondary">
                            {selectedSite.progress}%
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 font-medium">
                          Vị trí minh họa (mock). Thực tế sẽ hiển thị theo dữ
                          liệu công trình của bạn.
                        </p>
                      </div>
                    </Popup>
                  )}
                </Map>
              ) : (
                <div className="h-full flex flex-col items-center justify-center px-8">
                  <span className="material-symbols-outlined text-4xl text-slate-500 mb-3">
                    map
                  </span>
                  <p className="text-sm text-slate-300 font-bold text-center mb-1">
                    Chưa cấu hình Mapbox cho frontend
                  </p>
                  <p className="text-xs text-slate-500 font-medium text-center">
                    Thêm <code className="font-mono">NEXT_PUBLIC_MAPBOX_TOKEN</code>{" "}
                    vào file <code className="font-mono">.env.local</code> để
                    hiển thị bản đồ tương tác với marker cho từng công trình.
                  </p>
                </div>
              )}

              <div className="pointer-events-none absolute inset-0 flex flex-col justify-between">
                <div className="flex justify-between p-4">
                  <div className="bg-slate-900/80 backdrop-blur-md px-4 py-2 rounded-2xl border border-slate-700">
                    <p className="text-xs font-black text-slate-300">
                      📍 Đà Nẵng & khu vực lân cận
                    </p>
                  </div>
                  {MAPBOX_TOKEN && (
                    <button
                      type="button"
                      onClick={() => setIsMapModalOpen(true)}
                      className="pointer-events-auto flex items-center gap-1 bg-slate-900/80 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full shadow-lg hover:bg-slate-900"
                    >
                      <span className="material-symbols-outlined text-xs">
                        fullscreen
                      </span>
                      Xem bản đồ lớn
                    </button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {MAPBOX_TOKEN && isMapModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="relative w-full max-w-5xl mx-4">
            <div className="bg-slate-900 rounded-[2.5rem] border border-slate-700 overflow-hidden shadow-2xl h-[70vh]">
              <Map
                initialViewState={initialViewState}
                mapStyle="mapbox://styles/mapbox/light-v11"
                mapboxAccessToken={MAPBOX_TOKEN}
                style={{ width: "100%", height: "100%" }}
                reuseMaps
              >
                <NavigationControl
                  position="bottom-right"
                  showCompass={false}
                />
                <FullscreenControl position="top-right" />

                {MOCK_SITES.map((site) => (
                  <Marker
                    key={site.id}
                    longitude={site.lng}
                    latitude={site.lat}
                    anchor="bottom"
                  >
                    <span className="material-symbols-outlined text-3xl text-red-500 drop-shadow-md">
                      location_on
                    </span>
                  </Marker>
                ))}
              </Map>
            </div>
            <button
              type="button"
              onClick={() => setIsMapModalOpen(false)}
              className="absolute -top-4 right-6 w-10 h-10 rounded-2xl bg-white text-slate-900 flex items-center justify-center shadow-lg border border-slate-200"
            >
              <span className="material-symbols-outlined text-xl">close</span>
            </button>
          </div>
        </div>
      )}
    </section>
  );
};
