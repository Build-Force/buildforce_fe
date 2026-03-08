'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

interface Brick {
  id: number;
  row: number;
  col: number;
  delay: number;
  color: string;
}

const COLS = 12;
const ROWS = 3;
const BRICK_COLORS = ['#3B82F6', '#2563EB', '#1D4ED8', '#22C55E', '#16A34A', '#EF4444', '#DC2626'];
const BRICK_ANIMATION_TIME = COLS * 60 + ROWS * 30 + 300;
const MIN_VISIBLE_TIME = 400;
const LOADER_VISIBLE_TIME = Math.max(BRICK_ANIMATION_TIME, MIN_VISIBLE_TIME);

const AUTH_PATH_PREFIXES = ['/signin', '/auth'];

const shouldSkipLoader = (pathname: string): boolean => {
  return AUTH_PATH_PREFIXES.some((prefix) => pathname.startsWith(prefix));
};

function generateBricks(): Brick[] {
  const bricks: Brick[] = [];
  let id = 0;

  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const colorIndex = (row * COLS + col) % BRICK_COLORS.length;
      bricks.push({
        id: id++,
        row,
        col,
        delay: (col + row * 0.5) * 60,
        color: BRICK_COLORS[colorIndex],
      });
    }
  }

  return bricks;
}

function BrickBar({ visible }: { visible: boolean }) {
  const [bricks] = useState<Brick[]>(generateBricks);
  const [filled, setFilled] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (!visible) {
      setFilled(new Set());
      return;
    }

    const timers: ReturnType<typeof setTimeout>[] = [];

    bricks.forEach((brick) => {
      const timer = setTimeout(() => {
        setFilled((prev) => new Set(prev).add(brick.id));
      }, brick.delay);

      timers.push(timer);
    });

    return () => timers.forEach(clearTimeout);
  }, [visible, bricks]);

  return (
    <div className="flex flex-col gap-[3px]" style={{ width: COLS * 28 + (COLS - 1) * 3 }}>
      {Array.from({ length: ROWS }, (_, row) => (
        <div key={row} className="flex gap-[3px]" style={{ marginLeft: row % 2 === 1 ? 14 : 0 }}>
          {Array.from({ length: COLS }, (_, col) => {
            const brick = bricks.find((b) => b.row === row && b.col === col);
            const isFilled = brick ? filled.has(brick.id) : false;

            return (
              <div
                key={col}
                className="rounded-[2px] transition-all"
                style={{
                  width: 24,
                  height: 12,
                  backgroundColor: isFilled ? brick?.color : 'rgba(255,255,255,0.08)',
                  transform: isFilled ? 'scaleY(1)' : 'scaleY(0.6)',
                  opacity: isFilled ? 1 : 0.3,
                  transitionDuration: '200ms',
                  transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
                  boxShadow: isFilled ? `0 2px 8px ${brick?.color}66` : 'none',
                }}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}

function LoaderOverlay({ visible }: { visible: boolean }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (visible) {
      setMounted(true);
      return;
    }

    const timer = setTimeout(() => setMounted(false), 400);
    return () => clearTimeout(timer);
  }, [visible]);

  if (!mounted) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center"
      style={{
        backgroundColor: 'rgba(10, 15, 28, 0.92)',
        backdropFilter: 'blur(6px)',
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.3s ease',
        pointerEvents: visible ? 'all' : 'none',
      }}
    >
      <div
        className="mb-8 flex items-center gap-2"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(-8px)',
          transition: 'opacity 0.4s ease, transform 0.4s ease',
        }}
      >
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
          <path d="M6 20h20v3a2 2 0 01-2 2H8a2 2 0 01-2-2v-3z" fill="#3B82F6" />
          <path d="M16 5C10.5 5 6 9 6 14v6h20v-6c0-5-4.5-9-10-9z" fill="#2563EB" />
          <path d="M13 5.3V14h6V5.3A10.1 10.1 0 0016 5c-1.05 0-2.07.11-3 .3z" fill="#22C55E" />
          <rect x="3" y="18" width="26" height="3" rx="1.5" fill="#1D4ED8" />
        </svg>
        <span
          style={{
            fontFamily: "var(--font-inter), sans-serif",
            fontWeight: 800,
            fontSize: 22,
            letterSpacing: "-0.02em",
            color: "#F1F5F9",
            textTransform: "uppercase",
          }}
        >
          Build<span style={{ color: "#3B82F6" }}>Force</span>
        </span>
      </div>

      <BrickBar visible={visible} />

      <p
        className="mt-5 text-xs uppercase tracking-widest"
        style={{
          color: "rgba(148,163,184,0.6)",
          fontFamily: "var(--font-inter), sans-serif",
          opacity: visible ? 1 : 0,
          transition: "opacity 0.4s ease 0.2s",
        }}
      >
        Đang tải...
      </p>
    </div>
  );
}

export function PageTransitionLoader() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [loading, setLoading] = useState(false);
  const [hash, setHash] = useState('');
  const [prevRouteKey, setPrevRouteKey] = useState<string | null>(null);

  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const routeKey = `${pathname}?${searchParams.toString()}#${hash}`;
  const skipLoader = shouldSkipLoader(pathname);

  const startLoading = useCallback(() => {
    if (skipLoader) {
      setLoading(false);
      return;
    }

    setLoading(true);

    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => {
      setLoading(false);
    }, LOADER_VISIBLE_TIME);
  }, [skipLoader]);

  useEffect(() => {
    setHash(window.location.hash || '');

    const handleHashChange = () => setHash(window.location.hash || '');
    const handleBeforeUnload = () => setLoading(true);

    window.addEventListener('hashchange', handleHashChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  useEffect(() => {
    if (prevRouteKey === null) {
      setPrevRouteKey(routeKey);
      startLoading();
      return;
    }

    if (prevRouteKey !== routeKey) {
      setPrevRouteKey(routeKey);
      startLoading();
    }
  }, [routeKey, prevRouteKey, startLoading]);

  useEffect(() => {
    return () => {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, []);

  return <LoaderOverlay visible={loading} />;
}

export default PageTransitionLoader;
