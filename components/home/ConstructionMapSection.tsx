"use client";

import React, { useMemo, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Map, {
  Marker,
  Popup,
  NavigationControl,
  FullscreenControl,
  MapRef,
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

// Reusable Custom Marker Component
const ConstructionMarker = ({
  site,
  isActive,
  onClick
}: {
  site: Site;
  isActive: boolean;
  onClick: (e: any) => void
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Marker
      longitude={site.lng}
      latitude={site.lat}
      anchor="bottom"
      onClick={onClick}
    >
      <div
        className="relative flex flex-col items-center group cursor-pointer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Tooltip on hover */}
        <AnimatePresence>
          {isHovered && !isActive && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.9 }}
              className="absolute bottom-full mb-3 px-3 py-1.5 bg-slate-800 text-white text-xs font-bold rounded-lg shadow-xl whitespace-nowrap border border-slate-700 z-10"
            >
              {site.name}
              <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pulse effect for active site */}
        {isActive && (
          <div className="absolute inset-0 -translate-y-3">
            <div className="absolute inset-x-0 top-0 w-10 h-10 -translate-x-1/2 bg-secondary/40 rounded-full animate-ping" />
          </div>
        )}

        {/* Main Marker Circle */}
        <motion.div
          animate={{
            scale: isActive || isHovered ? 1.25 : 1,
            filter: `brightness(${isHovered ? 1.3 : 1}) drop-shadow(0 0 8px ${isActive ? 'rgba(74, 188, 198, 0.4)' : 'rgba(0,0,0,0.3)'})`
          }}
          className={`relative w-11 h-11 rounded-full flex items-center justify-center transition-all duration-500 border-2 ${isActive
              ? "bg-secondary border-white shadow-[0_0_20px_rgba(74,188,198,0.6)]"
              : "bg-slate-800 border-white/20 group-hover:border-white/40 shadow-xl"
            }`}
        >
          <span className={`material-symbols-outlined text-xl ${isActive ? "text-slate-900" : "text-white"}`}>
            apartment
          </span>

          {/* Progress label badge */}
          <div className={`absolute -right-2 -top-2 px-1.5 py-0.5 rounded-full text-[8px] font-black shadow-lg ${isActive ? "bg-white text-secondary" : "bg-secondary text-slate-900"
            }`}>
            {site.progress}%
          </div>
        </motion.div>

        {/* Pointer shadow */}
        <div className="w-1.5 h-1.5 bg-white/20 rounded-full blur-[1px] mt-1" />
      </div>
    </Marker>
  );
};

// Reusable Popup Card Component
const SitePopupCard = ({ site, onClose }: { site: Site; onClose: () => void }) => {
  return (
    <Popup
      longitude={site.lng}
      latitude={site.lat}
      anchor="top"
      closeButton={false}
      onClose={onClose}
      offset={15}
      maxWidth="300px"
      className="custom-popup"
    >
      <div className="p-5 bg-slate-950/90 backdrop-blur-2xl text-white rounded-[2rem] border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] min-w-[280px]">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-secondary shadow-[0_0_15px_rgba(74,188,198,0.3)] flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-slate-900 text-2xl">apartment</span>
          </div>
          <div className="min-w-0">
            <h4 className="font-black text-base leading-tight text-white truncate">
              {site.name}
            </h4>
            <p className="text-[11px] text-slate-400 font-bold flex items-center gap-1 opacity-80">
              <span className="material-symbols-outlined text-sm">location_on</span>
              {site.address}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-slate-900/50 p-3 rounded-2xl border border-white/5 space-y-2">
            <div className="flex items-center justify-between text-[11px] font-black">
              <span className="text-slate-500 uppercase tracking-widest">Construction Progress</span>
              <span className="text-secondary">{site.progress}%</span>
            </div>
            <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${site.progress}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="h-full bg-secondary shadow-[0_0_12px_rgba(74,188,198,0.5)]"
              />
            </div>
          </div>

          <button className="w-full py-3.5 bg-white text-slate-950 hover:bg-secondary hover:text-slate-900 text-[11px] font-black uppercase tracking-[0.15em] rounded-2xl transition-all shadow-xl active:scale-95">
            View Project Details
          </button>
        </div>
      </div>
    </Popup>
  );
};

export const ConstructionMapSection = () => {
  const [selectedSite, setSelectedSite] = useState<Site | null>(null);
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const mapRef = useRef<MapRef>(null);
  const modalMapRef = useRef<MapRef>(null);

  const handleSiteSelect = (site: Site | null, isModal: boolean = false) => {
    const prevSiteId = selectedSite?.id;
    setSelectedSite(site);

    if (site && site.id !== prevSiteId) {
      const currentMapRef = isModal ? modalMapRef : mapRef;
      currentMapRef.current?.flyTo({
        center: [site.lng, site.lat],
        zoom: 16.5,
        pitch: 60,
        bearing: 25,
        duration: 2200,
        essential: true,
        padding: { top: 0, bottom: 0, left: 0, right: 0 }
      });
    }
  };

  const initialViewState = useMemo(() => {
    if (!MOCK_SITES.length) {
      return {
        longitude: 108.2208,
        latitude: 16.0678,
        zoom: 11,
      };
    }
    const centerLat = MOCK_SITES.reduce((sum, s) => sum + s.lat, 0) / MOCK_SITES.length;
    const centerLng = MOCK_SITES.reduce((sum, s) => sum + s.lng, 0) / MOCK_SITES.length;

    return {
      longitude: centerLng,
      latitude: centerLat,
      zoom: 11,
    };
  }, []);

  return (
    <section className="py-28 bg-slate-900 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col lg:flex-row items-stretch gap-12 mb-14">
          {/* Content Left */}
          <div className="lg:w-1/3 flex flex-col shrink-0">
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="text-secondary font-black uppercase tracking-[0.3em] text-xs block mb-4"
            >
              Network Overview
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-5xl font-display font-black text-white mb-6 leading-tight"
            >
              Bản đồ <span className="text-secondary">việc làm</span> tại hiện trường
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-slate-400 text-lg leading-relaxed mb-10"
            >
              Khám phá các dự án đang thi công tích cực. Chúng tôi kết nối bạn với những công trình gần nhất, tối ưu hóa thời gian di chuyển.
            </motion.p>

            <div className="space-y-3 overflow-y-auto max-h-[460px] pr-2 py-4 px-1 custom-scrollbar">
              {MOCK_SITES.map((site) => {
                const isActive = selectedSite?.id === site.id;
                return (
                  <button
                    key={site.id}
                    onClick={() => handleSiteSelect(isActive ? null : site)}
                    className={`w-full text-left flex items-start gap-4 rounded-3xl p-5 transition-all duration-500 border group ${isActive
                      ? "bg-slate-800 border-secondary/50 shadow-2xl ring-1 ring-secondary/20 -translate-y-1"
                      : "bg-slate-800/40 border-white/5 hover:border-white/10 hover:bg-slate-800/60"
                      }`}
                  >
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-colors ${isActive ? "bg-secondary text-slate-900" : "bg-slate-700/50 text-slate-400 group-hover:text-white"
                      }`}>
                      <span className="material-symbols-outlined">apartment</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className={`font-black text-base truncate transition-colors ${isActive ? "text-white" : "text-slate-200"}`}>
                          {site.name}
                        </p>
                      </div>
                      <p className="text-xs text-slate-400 font-medium mb-3 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">location_on</span>
                        {site.address}
                      </p>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-1.5 rounded-full bg-slate-900 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${site.progress}%` }}
                            className={`h-full ${isActive ? "bg-secondary" : "bg-slate-600"}`}
                          />
                        </div>
                        <span className={`text-[10px] font-black whitespace-nowrap ${isActive ? "text-secondary" : "text-slate-500"}`}>
                          {site.progress}% hoàn thành
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Map Right */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="flex-1 w-full"
          >
            <div className="relative h-full min-h-[500px] lg:min-h-0 rounded-[3.5rem] overflow-hidden bg-slate-950 border border-white/10 shadow-[0_0_100px_-20px_rgba(0,0,0,0.8)] group">
              <div className="absolute inset-0 rounded-[3.5rem] pointer-events-none ring-1 ring-inset ring-white/10 z-10" />

              {MAPBOX_TOKEN ? (
                <>
                  <Map
                    ref={mapRef}
                    initialViewState={initialViewState}
                    mapStyle="mapbox://styles/mapbox/navigation-night-v1"
                    mapboxAccessToken={MAPBOX_TOKEN}
                    style={{ width: "100%", height: "100%" }}
                    reuseMaps
                    onClick={() => handleSiteSelect(null)}
                  >
                    <NavigationControl position="top-right" showCompass={false} />

                    {MOCK_SITES.map((site) => (
                      <ConstructionMarker
                        key={site.id}
                        site={site}
                        isActive={selectedSite?.id === site.id}
                        onClick={(e) => {
                          e.originalEvent.stopPropagation();
                          handleSiteSelect(site);
                        }}
                      />
                    ))}

                    <AnimatePresence>
                      {selectedSite && (
                        <SitePopupCard
                          site={selectedSite}
                          onClose={() => handleSiteSelect(null)}
                        />
                      )}
                    </AnimatePresence>
                  </Map>

                  {/* Enhanced Depth Overlays */}
                  <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent pointer-events-none z-[5]" />
                  <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-slate-950/60 to-transparent pointer-events-none z-[5]" />

                  {/* Floating Overlay UI */}
                  <div className="absolute top-8 left-8 pointer-events-none z-20">
                    <motion.div
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-slate-900/60 backdrop-blur-2xl px-6 py-4 rounded-[2rem] border border-white/10 shadow-2xl"
                    >
                      <p className="text-[11px] font-black text-white/90 flex items-center gap-3">
                        <span className="text-secondary tracking-[0.2em] uppercase">Active Zone</span>
                        <span className="w-1 h-1 bg-white/20 rounded-full" />
                        <span className="flex items-center gap-1.5 opacity-80">
                          <span className="material-symbols-outlined text-sm text-secondary">explore</span>
                          Đà Nẵng & lân cận
                        </span>
                      </p>
                    </motion.div>
                  </div>

                  {/* Dynamic Legend */}
                  <div className="absolute bottom-10 left-8 pointer-events-none z-20">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-slate-900/40 backdrop-blur-xl px-4 py-2.5 rounded-2xl border border-white/10 shadow-xl flex items-center gap-4"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-secondary animate-pulse shadow-[0_0_15px_rgba(74,188,198,0.8)]" />
                        <span className="text-[10px] font-black text-white/70 uppercase tracking-widest">In Progress</span>
                      </div>
                      <div className="w-[1px] h-3 bg-white/10" />
                      <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">{MOCK_SITES.length} Sites</span>
                    </motion.div>
                  </div>

                  {/* Action UI */}
                  <button
                    type="button"
                    onClick={() => setIsMapModalOpen(true)}
                    className="absolute top-8 right-16 z-20 flex items-center gap-2 bg-white text-slate-950 text-[11px] font-black uppercase tracking-[0.15em] px-5 py-3.5 rounded-2xl shadow-[0_20px_40px_rgba(0,0,0,0.4)] hover:bg-secondary hover:text-slate-900 transition-all transform hover:-translate-y-1 active:scale-95"
                  >
                    <span className="material-symbols-outlined text-lg">fullscreen</span>
                    Expand Network
                  </button>
                </>
              ) : (
                <div className="h-full flex flex-col items-center justify-center px-12 text-center bg-slate-900">
                  <div className="w-20 h-20 rounded-[2rem] bg-slate-800 flex items-center justify-center mb-6">
                    <span className="material-symbols-outlined text-4xl text-slate-600">map</span>
                  </div>
                  <h3 className="text-xl font-black text-white mb-2">Cấu hình Mapbox yêu cầu</h3>
                  <p className="text-slate-500 text-sm max-w-xs leading-relaxed">
                    Vui lòng thêm <code className="text-secondary bg-secondary/10 px-1.5 py-0.5 rounded">NEXT_PUBLIC_MAPBOX_TOKEN</code> vào file <code className="text-white">.env.local</code> để kích hoạt giao diện bản đồ cao cấp.
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Modern Modal Map */}
      <AnimatePresence>
        {MAPBOX_TOKEN && isMapModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/90 backdrop-blur-xl p-6 md:p-12"
            onClick={() => setIsMapModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="relative w-full h-full max-w-7xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-slate-900 rounded-[3.5rem] border border-white/10 overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.5)] h-full relative group">
                <Map
                  ref={modalMapRef}
                  initialViewState={initialViewState}
                  mapStyle="mapbox://styles/mapbox/navigation-night-v1"
                  mapboxAccessToken={MAPBOX_TOKEN}
                  style={{ width: "100%", height: "100%" }}
                  reuseMaps
                  onClick={() => handleSiteSelect(null, true)}
                >
                  <NavigationControl position="top-right" showCompass={false} />

                  {MOCK_SITES.map((site) => (
                    <ConstructionMarker
                      key={site.id}
                      site={site}
                      isActive={selectedSite?.id === site.id}
                      onClick={(e) => {
                        e.originalEvent.stopPropagation();
                        handleSiteSelect(site, true);
                      }}
                    />
                  ))}

                  <AnimatePresence>
                    {selectedSite && (
                      <SitePopupCard
                        site={selectedSite}
                        onClose={() => handleSiteSelect(null, true)}
                      />
                    )}
                  </AnimatePresence>
                </Map>
                <button
                  type="button"
                  onClick={() => setIsMapModalOpen(false)}
                  className="absolute top-8 right-16 w-12 h-12 rounded-2xl bg-white text-slate-900 flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all z-20"
                >
                  <span className="material-symbols-outlined font-black">close</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        .custom-popup .mapboxgl-popup-content {
          background: transparent !important;
          padding: 0 !important;
          box-shadow: none !important;
          border: none !important;
        }
        .custom-popup .mapboxgl-popup-tip {
          display: none !important;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </section>
  );
};
