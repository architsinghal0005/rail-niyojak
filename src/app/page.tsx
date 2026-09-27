"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useCallback } from "react";
import { ArrowRight, Database, Layers, Zap, ArrowDown, RotateCcw, AlertTriangle, Play, Shield, Activity, Users, Settings, Clock, CheckCircle, User } from "lucide-react";
import { useTranslation } from "@/lib/i18n";

// ─── Animation configuration ──────────────────────────────────────────────
const STATION_POSITIONS = [0.12, 0.37, 0.62, 0.85]; // fractional positions along track

type StationState = "hidden" | "revealing" | "visible";

export default function LandingPage() {
  const { t, lang, setLang } = useTranslation();
  
  const trackRef = useRef<HTMLDivElement>(null);
  const trainRef = useRef<HTMLDivElement>(null);
  const journeyProgressRef = useRef(0);
  const journeyLockedRef = useRef(false);

  const [stationStates, setStationStates] = useState<StationState[]>(["hidden", "hidden", "hidden", "hidden"]);
  const [markerActive, setMarkerActive] = useState([false, false, false, false]);
  const [trainPct, setTrainPct] = useState(-18); // starting left %
  const [journeyDone, setJourneyDone] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [isLockedIndicator, setIsLockedIndicator] = useState(false);

  // ─── Detect prefers-reduced-motion ──────────────────────────────────────────
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
  }, []);

  // ─── Scroll-driven Animation Loop ────────────────────────────────────────────
  useEffect(() => {
    if (reducedMotion) {
      setTrainPct(108);
      setStationStates(["visible", "visible", "visible", "visible"]);
      setMarkerActive([true, true, true, true]);
      setJourneyDone(true);
      return;
    }

    let rafId: number;
    let lastTop = 99999;

    const updateVisuals = (progress: number) => {
      const pct = -18 + progress * 126;
      setTrainPct(pct);

      const newStates: StationState[] = ["hidden", "hidden", "hidden", "hidden"];
      const newMarkers = [false, false, false, false];

      STATION_POSITIONS.forEach((pos, i) => {
        if (progress >= pos - 0.05) {
          newStates[i] = "visible";
          newMarkers[i] = true;
        }
      });

      setStationStates(newStates);
      setMarkerActive(newMarkers);
      setJourneyDone(progress >= 1);
    };

    const handleWheel = (e: WheelEvent) => {
      if (!journeyLockedRef.current) return;
      e.preventDefault();
      
      const delta = e.deltaY;
      journeyProgressRef.current += delta / 2000;
      
      if (journeyProgressRef.current > 1) {
        journeyProgressRef.current = 1;
        if (delta > 0) {
          journeyLockedRef.current = false;
          setIsLockedIndicator(false);
        }
      }
      
      if (journeyProgressRef.current < 0) {
        journeyProgressRef.current = 0;
        if (delta < 0) {
          journeyLockedRef.current = false;
          setIsLockedIndicator(false);
        }
      }
      rafId = requestAnimationFrame(() => updateVisuals(journeyProgressRef.current));
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!journeyLockedRef.current) return;
      if (e.key === "Escape") {
        journeyLockedRef.current = false;
        setIsLockedIndicator(false);
        return;
      }
      
      const keys = { "ArrowDown": 50, "ArrowUp": -50, "PageDown": 200, "PageUp": -200, " ": 100 };
      if (e.key in keys) {
        e.preventDefault();
        const delta = keys[e.key as keyof typeof keys];
        journeyProgressRef.current += delta / 2000;
        
        if (journeyProgressRef.current > 1) {
          journeyProgressRef.current = 1;
          if (delta > 0) {
            journeyLockedRef.current = false;
            setIsLockedIndicator(false);
          }
        }
        
        if (journeyProgressRef.current < 0) {
          journeyProgressRef.current = 0;
          if (delta < 0) {
            journeyLockedRef.current = false;
            setIsLockedIndicator(false);
          }
        }
        rafId = requestAnimationFrame(() => updateVisuals(journeyProgressRef.current));
      }
    };

    const handleScrollDetect = () => {
      if (journeyLockedRef.current || window.innerWidth <= 768) return;
      if (!trackRef.current) return;
      
      const rect = trackRef.current.getBoundingClientRect();
      const p = journeyProgressRef.current;
      
      // Approaching from top, moving down
      if (p === 0 && lastTop > 0 && rect.top <= 5) {
         window.scrollTo({ top: window.scrollY + rect.top });
         journeyLockedRef.current = true;
         setIsLockedIndicator(true);
      }
      // Approaching from bottom, moving up
      else if (p === 1 && lastTop < 0 && rect.top >= -5) {
         window.scrollTo({ top: window.scrollY + rect.top });
         journeyLockedRef.current = true;
         setIsLockedIndicator(true);
      }
      
      lastTop = rect.top;
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("keydown", handleKeyDown, { passive: false });
    window.addEventListener("scroll", handleScrollDetect, { passive: true });
    
    return () => {
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("scroll", handleScrollDetect);
      cancelAnimationFrame(rafId);
    };
  }, [reducedMotion]);

  // ─── Replay handler ─────────────────────────────────────────────────────────
  const handleReplay = useCallback(() => {
    if (trackRef.current) {
      journeyProgressRef.current = 0;
      setTrainPct(-18);
      setStationStates(["hidden", "hidden", "hidden", "hidden"]);
      setMarkerActive([false, false, false, false]);
      setJourneyDone(false);
      
      window.scrollTo({
        top: trackRef.current.offsetTop,
        behavior: "smooth"
      });
    }
  }, []);

  // ─── Station visibility style helper ────────────────────────────────────────
  const stationStyle = (state: StationState, dir: "up" | "down") => ({
    opacity: state === "hidden" ? 0 : 1,
    transform: state === "hidden" ? (dir === "up" ? "translateY(30px)" : "translateY(-30px)") : "translateY(0)",
    transition: "opacity 0.7s ease, transform 0.7s ease",
  });

  const markerStyle = (active: boolean, isGreen = false) => ({
    backgroundColor: active ? (isGreen ? "#16a34a" : "#991b1b") : "#94a3b8",
    boxShadow: active
      ? isGreen
        ? "0 0 0 6px rgba(22,163,74,0.2)"
        : "0 0 0 6px rgba(153,27,27,0.2)"
      : "none",
    transition: "background-color 0.5s ease, box-shadow 0.5s ease",
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-red-800 selection:text-white">

      {/* ─── Header ─────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-white border-b border-slate-300 shadow-sm">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-8 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-4 group">
            <img src={`${process.env.NEXT_PUBLIC_BASE_PATH || ''}/train-logo.png`} alt="RailNiyojak Logo" className="h-12 w-12 object-contain" />
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest leading-tight">
                {t("brand.ministry")}<br />{t("brand.govt")}
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-black text-slate-900 tracking-tight leading-none">{t("brand.name")}</span>
              </div>
            </div>
          </Link>
          <div className="flex items-center gap-4">
            <div className="flex items-center rounded border border-slate-300 bg-slate-50 text-[10px] font-bold uppercase tracking-widest overflow-hidden">
              <button onClick={() => setLang("en")} className={`px-3 py-1.5 transition-colors ${lang === "en" ? "bg-slate-700 text-white" : "text-slate-600 hover:bg-slate-200"}`}>English</button>
              <div className="w-px h-full bg-slate-300"></div>
              <button onClick={() => setLang("hi")} className={`px-3 py-1.5 transition-colors ${lang === "hi" ? "bg-slate-700 text-white" : "text-slate-600 hover:bg-slate-200"}`}>हिंदी</button>
            </div>
            
            <nav className="hidden lg:flex items-center gap-6 text-[11px] font-bold text-slate-700 uppercase tracking-widest">
              <Link href="/" className="hover:text-red-800 transition-colors">Home</Link>
              <a href="#how-it-works" className="hover:text-red-800 transition-colors">How It Works</a>
              <Link href="/control-tower" className="hover:text-red-800 transition-colors border-l border-slate-300 pl-6">Control Tower</Link>
              <span className="bg-amber-100 text-amber-900 px-2 py-0.5 border border-amber-300">Prototype | Synthetic Data</span>
              <Link href="/control-tower" className="bg-slate-900 text-white px-4 py-2 hover:bg-slate-800 transition-colors border border-slate-700">
                {t("hero.enter")}
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* ─── Main Hero ──────────────────────────── */}
      <section className="relative bg-white border-b-8 border-slate-800 overflow-hidden">
        <div className="relative w-full min-h-[480px] md:h-[600px] bg-slate-900 flex items-center py-12 md:py-0">
          <div className="absolute inset-0 z-0">
            <img
              src={`${process.env.NEXT_PUBLIC_BASE_PATH || ''}/train-hero.png`}
              alt="Vande Bharat Train"
              className="w-full h-full object-cover object-center md:object-right opacity-90"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-900/95 via-slate-900/70 to-transparent" />
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10 w-full flex flex-col items-start justify-center h-full">
            <div className="max-w-2xl mt-4">
              <div className="inline-block bg-amber-500 text-amber-950 text-[10px] font-bold py-1 px-3 uppercase tracking-widest mb-4 shadow-sm border border-amber-600">
                {t("hero.badge")}
              </div>
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white tracking-tight mb-2 drop-shadow-md">
                {t("brand.name")}
              </h1>
              <h2 className="text-sm md:text-base font-bold text-red-400 uppercase tracking-widest mb-6 drop-shadow-sm border-l-4 border-red-500 pl-3">
                {t("hero.subtitle")}
              </h2>
              <div className="text-xl md:text-3xl font-bold text-slate-100 leading-tight mb-4 drop-shadow-md whitespace-pre-line">
                {t("hero.quote").replace(/\\n/g, '\n')}
              </div>
              <p className="text-xs md:text-sm text-slate-300 font-medium mb-8 drop-shadow-md max-w-md leading-relaxed">
                {t("hero.description")}
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/control-tower"
                  className="bg-red-700 hover:bg-red-600 text-white text-xs md:text-sm font-black uppercase tracking-widest py-3 px-8 text-center border border-red-500 shadow-xl transition-transform hover:-translate-y-1 flex items-center justify-center"
                >
                  {t("hero.enter")} <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
                <a
                  href="#track-journey"
                  className="bg-slate-800 text-white text-xs md:text-sm font-bold uppercase tracking-widest py-3 px-8 text-center hover:bg-slate-700 border border-slate-600 shadow-md transition-colors"
                >
                  {t("hero.howitworks")} &rarr;
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* ─── ANIMATED RAILWAY TRACK JOURNEY (SCROLL-DRIVEN) ────────────────────────────── */}
        <div
          id="track-journey"
          ref={trackRef}
          className="hidden md:block relative bg-slate-50 border-t border-slate-200 h-screen"
        >
          <div className="h-full w-full overflow-hidden flex flex-col justify-center">
            
            <div className="absolute top-0 left-0 right-0 max-w-7xl mx-auto px-4 sm:px-6 pt-12 flex items-center justify-between z-40">
              <div>
                <div className="text-xl font-black text-slate-800 uppercase tracking-widest">{t("journey.title")}</div>
                <div className="text-sm font-bold text-slate-500 mt-1">{t("journey.subtitle")}</div>
              </div>
              <div className="flex items-center">
                <button
                  onClick={handleReplay}
                  style={{ opacity: (journeyDone || reducedMotion) ? 1 : 0, pointerEvents: (journeyDone || reducedMotion) ? "auto" : "none" }}
                  className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-red-800 uppercase tracking-widest border border-slate-300 px-4 py-2 hover:border-red-800 transition-all bg-white shadow-sm rounded-sm"
                >
                  <RotateCcw className="h-4 w-4" /> {t("journey.replay")}
                </button>
              </div>
            </div>

            <div className="relative h-[500px] w-full max-w-[1600px] mx-auto mt-12">
            {/* SINGLE Railway Track SVG */}
            <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-10 pointer-events-none z-10">
              <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
                <defs>
                  <pattern id="sleepers-main" x="0" y="0" width="30" height="40" patternUnits="userSpaceOnUse">
                    <rect x="10" y="4" width="10" height="32" fill="#94a3b8" rx="1" />
                  </pattern>
                </defs>
                <rect x="0" y="0" width="100%" height="100%" fill="url(#sleepers-main)" />
                <line x1="0" y1="12" x2="100%" y2="12" stroke="#1e293b" strokeWidth="5" strokeLinecap="round" />
                <line x1="0" y1="28" x2="100%" y2="28" stroke="#1e293b" strokeWidth="5" strokeLinecap="round" />
              </svg>
            </div>

            {/* Animated Train */}
            <div
              ref={trainRef}
              className="absolute z-15"
              style={{
                bottom: "calc(50% - 8px)",
                left: 0,
                transform: `translateX(${trainPct}vw)`,
                width: 600,
                transition: reducedMotion ? "none" : undefined,
                willChange: "transform"
              }}
            >
              <img src={`${process.env.NEXT_PUBLIC_BASE_PATH || ''}/running-train.png`} alt="Vande Bharat Train" className="w-full h-auto object-contain block" draggable={false} />
            </div>

            <div className="max-w-[1600px] mx-auto relative h-full">
              {/* STATION 01 */}
              <div className="absolute flex flex-col items-center z-20" style={{ left: `${STATION_POSITIONS[0] * 100}%`, bottom: "calc(50% + 8px)", transform: "translateX(-50%)" }}>
                <div style={{ ...stationStyle(stationStates[0], "up"), paddingBottom: "32px" }}>
                  <div className="bg-white border-2 border-slate-800 shadow-md p-4 w-[270px] h-[230px] flex flex-col items-center justify-center text-center rounded-sm">
                    <div className="bg-slate-800 text-white text-lg font-black px-3 py-1 tracking-widest rounded-sm mb-3">01</div>
                    <Database className="h-6 w-6 text-slate-700 mx-auto mb-2" />
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-3 border-b-2 border-red-800 pb-2 w-full">{t("journey.step1")}</h3>
                    <div className="flex flex-wrap justify-center gap-1.5 mb-3">
                      {["TMS","SMMS","TDMS","BDMS","COA"].map(s => (
                        <span key={s} className="text-[10px] bg-slate-100 border border-slate-300 px-1.5 py-0.5 font-bold text-slate-700 rounded-sm">{s}</span>
                      ))}
                    </div>
                    <p className="text-[11px] text-slate-600 font-bold leading-tight">{t("journey.step1.desc")}</p>
                  </div>
                </div>
                <div className="absolute bg-slate-800 w-[4px] h-[32px] bottom-0" />
                <div className="absolute rounded-full border-[4px] border-white shadow-sm" style={{ ...markerStyle(markerActive[0]), width: 24, height: 24, bottom: "-12px" }} />
              </div>

              {/* STATION 02 */}
              <div className="absolute flex flex-col items-center z-20" style={{ left: `${STATION_POSITIONS[1] * 100}%`, top: "calc(50% + 8px)", transform: "translateX(-50%)" }}>
                <div className="absolute rounded-full border-[4px] border-white shadow-sm" style={{ ...markerStyle(markerActive[1]), width: 24, height: 24, top: "-12px" }} />
                <div className="absolute bg-slate-800 w-[4px] h-[32px] top-0" />
                <div style={{ ...stationStyle(stationStates[1], "down"), paddingTop: "32px" }}>
                  <div className="bg-white border-2 border-slate-800 shadow-md p-4 w-[270px] h-[230px] flex flex-col items-center justify-center text-center rounded-sm">
                    <div className="bg-slate-800 text-white text-lg font-black px-3 py-1 tracking-widest rounded-sm mb-3">02</div>
                    <AlertTriangle className="h-6 w-6 text-amber-600 mx-auto mb-2" />
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-3 border-b-2 border-red-800 pb-2 w-full">{t("journey.step2")}</h3>
                    <div className="flex flex-wrap justify-center gap-2 mb-3">
                      <span className="text-[10px] font-bold text-red-800 bg-red-50 border border-red-200 px-2 py-0.5 rounded-sm uppercase">Asset Risk</span>
                      <span className="text-[10px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-sm uppercase">Task Urgency</span>
                      <span className="text-[10px] font-bold text-blue-800 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-sm uppercase">Criticality</span>
                    </div>
                    <p className="text-[11px] text-slate-600 font-bold leading-tight">{t("journey.step2.desc")}</p>
                  </div>
                </div>
              </div>

              {/* STATION 03 */}
              <div className="absolute flex flex-col items-center z-20" style={{ left: `${STATION_POSITIONS[2] * 100}%`, bottom: "calc(50% + 8px)", transform: "translateX(-50%)" }}>
                <div style={{ ...stationStyle(stationStates[2], "up"), paddingBottom: "32px" }}>
                  <div className="bg-white border-2 border-slate-800 shadow-md p-4 w-[270px] h-[230px] flex flex-col items-center justify-center text-center rounded-sm">
                    <div className="bg-slate-800 text-white text-lg font-black px-3 py-1 tracking-widest rounded-sm mb-3">03</div>
                    <Layers className="h-6 w-6 text-slate-700 mx-auto mb-2" />
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-3 border-b-2 border-red-800 pb-2 w-full">{t("journey.step3")}</h3>
                    <div className="flex justify-center items-center gap-2 mb-3">
                      <span className="text-xs font-bold text-red-800">Eng</span><span className="text-slate-400">+</span>
                      <span className="text-xs font-bold text-blue-800">S&T</span><span className="text-slate-400">+</span>
                      <span className="text-xs font-bold text-amber-800">TRD</span>
                    </div>
                    <p className="text-[11px] text-slate-600 font-bold leading-tight">{t("journey.step3.desc")}</p>
                  </div>
                </div>
                <div className="absolute bg-slate-800 w-[4px] h-[32px] bottom-0" />
                <div className="absolute rounded-full border-[4px] border-white shadow-sm" style={{ ...markerStyle(markerActive[2]), width: 24, height: 24, bottom: "-12px" }} />
              </div>

              {/* STATION 04 */}
              <div className="absolute flex flex-col items-center z-30" style={{ left: `${STATION_POSITIONS[3] * 100}%`, top: "calc(50% + 8px)", transform: "translateX(-50%)" }}>
                <div className="absolute rounded-full border-[4px] border-white shadow-md" style={{ ...markerStyle(markerActive[3], true), width: 28, height: 28, top: "-14px" }} />
                <div className="absolute bg-emerald-700 w-[4px] h-[32px] top-0" />
                <div style={{ ...stationStyle(stationStates[3], "down"), paddingTop: "32px" }}>
                  <div className="bg-emerald-50 border-2 border-emerald-700 shadow-lg p-4 w-[270px] h-[250px] flex flex-col items-center justify-center text-center rounded-sm relative">
                    <div className="bg-emerald-700 text-white text-lg font-black px-4 py-1.5 tracking-widest rounded-sm mb-3 border border-emerald-900">04</div>
                    <Zap className="h-6 w-6 text-emerald-700 mx-auto mb-2" />
                    <h3 className="text-sm font-black text-emerald-900 uppercase tracking-widest mb-3 border-b-2 border-emerald-400 pb-2 w-full">{t("journey.step4")}</h3>
                    <div className="flex justify-between w-full mb-1 text-[11px] font-bold"><span className="text-slate-600 uppercase">Block Capacity:</span><span className="text-slate-900">180 min</span></div>
                    <div className="flex justify-between w-full mb-1 text-[11px] font-bold"><span className="text-emerald-700 uppercase">Available:</span><span className="text-emerald-800">32 min</span></div>
                    <div className="flex justify-between w-full mb-3 text-[11px] font-bold border-b border-emerald-200 pb-2"><span className="text-emerald-700 uppercase">Harvested:</span><span className="text-emerald-800">+3 Tasks</span></div>
                    <p className="text-[11px] text-emerald-900 font-bold leading-tight mb-3">{t("journey.step4.desc")}</p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </section>

    {isLockedIndicator && !reducedMotion && (
      <div className="fixed bottom-8 right-8 z-50 bg-slate-900 text-white p-4 rounded-sm shadow-2xl border border-slate-700 flex flex-col items-center animate-fade-in pointer-events-none">
        <div className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Scroll to Travel</div>
        <ArrowDown className="h-4 w-4 text-red-500 mb-2 animate-bounce" />
        <div className="text-xs font-bold uppercase tracking-widest border-t border-slate-700 pt-2 w-full text-center">Train Journey</div>
        <div className="text-2xl font-black text-white">{Math.round(journeyProgressRef.current * 100)}%</div>
      </div>
    )}

      {/* ─── NEW SECTIONS ──────────────────────────────────────────────────────── */}
      
      {/* WHAT IS RAIL NIYOJAK? */}
      <section id="about" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-black text-slate-900 uppercase tracking-widest mb-6 border-l-4 border-red-800 pl-4">What is Rail Niyojak?</h2>
            <p className="text-lg text-slate-600 font-medium mb-8 leading-relaxed">
              Rail Niyojak is an AI-powered railway maintenance decision-support system that coordinates maintenance activities across Engineering, S&T and TRD while considering railway traffic and block availability.
            </p>
            <div className="space-y-4">
              <div className="bg-slate-50 p-4 border border-slate-200 flex gap-4 items-center">
                <div className="w-12 h-12 bg-red-100 flex items-center justify-center text-red-800 font-bold rounded-full">Eng</div>
                <div><h4 className="font-bold text-slate-900 uppercase">Engineering</h4><p className="text-sm text-slate-500">Track & Civil Maintenance</p></div>
              </div>
              <div className="bg-slate-50 p-4 border border-slate-200 flex gap-4 items-center">
                <div className="w-12 h-12 bg-blue-100 flex items-center justify-center text-blue-800 font-bold rounded-full">S&T</div>
                <div><h4 className="font-bold text-slate-900 uppercase">S&T</h4><p className="text-sm text-slate-500">Signalling & Telecom</p></div>
              </div>
              <div className="bg-slate-50 p-4 border border-slate-200 flex gap-4 items-center">
                <div className="w-12 h-12 bg-amber-100 flex items-center justify-center text-amber-800 font-bold rounded-full">TRD</div>
                <div><h4 className="font-bold text-slate-900 uppercase">TRD</h4><p className="text-sm text-slate-500">Traction Distribution</p></div>
              </div>
            </div>
          </div>
          <div className="bg-slate-100 h-full min-h-[400px] flex items-center justify-center border-4 border-slate-200 relative overflow-hidden">
            <img src={`${process.env.NEXT_PUBLIC_BASE_PATH || ''}/train-hero.png`} alt="Railway Track" className="absolute inset-0 w-full h-full object-cover opacity-30 grayscale" />
            <div className="z-10 text-center p-6 bg-white shadow-lg border border-slate-300">
              <Database className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <div className="text-slate-800 font-black tracking-widest">CENTRALIZED MAINTENANCE INTELLIGENCE</div>
            </div>
          </div>
        </div>
      </section>

      {/* THE CHALLENGE */}
      <section className="py-20 bg-slate-100 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-black text-slate-900 uppercase tracking-widest border-b-4 border-red-800 inline-block pb-2">The Challenge</h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-12">
            <div className="bg-white p-8 border border-slate-300 shadow-sm relative">
              <div className="absolute top-0 right-0 bg-red-800 text-white text-[10px] font-bold px-3 py-1 uppercase">Current Approach</div>
              <div className="space-y-6 mt-6 text-center">
                <div className="p-4 bg-red-50 border border-red-200 font-bold text-red-900">Engineering &rarr; Independent Block</div>
                <div className="p-4 bg-blue-50 border border-blue-200 font-bold text-blue-900">S&T &rarr; Independent Block</div>
                <div className="p-4 bg-amber-50 border border-amber-200 font-bold text-amber-900">TRD &rarr; Independent Block</div>
              </div>
            </div>
            
            <div className="flex flex-col justify-center space-y-6">
              <div className="flex items-start gap-4">
                <div className="mt-1 bg-red-100 p-2 rounded-full text-red-700"><AlertTriangle className="w-5 h-5" /></div>
                <div><h4 className="font-bold text-slate-900 uppercase">Fragmented Planning</h4><p className="text-slate-600 text-sm mt-1">Silos between departments lead to conflicting requirements.</p></div>
              </div>
              <div className="flex items-start gap-4">
                <div className="mt-1 bg-red-100 p-2 rounded-full text-red-700"><Activity className="w-5 h-5" /></div>
                <div><h4 className="font-bold text-slate-900 uppercase">Under-utilized Possessions</h4><p className="text-slate-600 text-sm mt-1">Time wasted inside granted blocks without parallel work.</p></div>
              </div>
              <div className="flex items-start gap-4">
                <div className="mt-1 bg-red-100 p-2 rounded-full text-red-700"><Users className="w-5 h-5" /></div>
                <div><h4 className="font-bold text-slate-900 uppercase">Higher Coordination Burden</h4><p className="text-slate-600 text-sm mt-1">Manual coordination causes delays and errors.</p></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-black text-slate-900 uppercase tracking-widest mb-16 text-center">How Rail Niyojak Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { id: "01", title: "DATA", desc: "TMS + SMMS + TDMS + BDMS + COA integration into one view." },
              { id: "02", title: "INTELLIGENCE", desc: "Asset Risk + Urgency + Criticality analysis." },
              { id: "03", title: "MATCHING", desc: "Cross-department compatibility and logic." },
              { id: "04", title: "OPTIMIZATION", desc: "Generating feasible maintenance block plans." },
              { id: "05", title: "HARVESTING", desc: "Adding additional compatible work to unused block capacity." },
              { id: "06", title: "APPROVAL & REPLANNING", desc: "Human-controlled decision support and dynamic changes." }
            ].map((step) => (
              <div key={step.id} className="bg-slate-50 border border-slate-200 p-8 hover:border-slate-400 transition-colors">
                <div className="text-3xl font-black text-slate-300 mb-4">{step.id}</div>
                <h3 className="text-lg font-black text-slate-900 uppercase tracking-widest mb-2 border-b-2 border-red-800 pb-2 inline-block">{step.title}</h3>
                <p className="text-slate-600 text-sm font-medium mt-2">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BLOCK HARVESTING (FLAGSHIP) */}
      <section className="py-24 bg-emerald-50 border-y-4 border-emerald-700">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <h2 className="text-sm font-black text-emerald-800 uppercase tracking-widest mb-2">BLOCK HARVESTING ENGINE</h2>
          <h3 className="text-4xl md:text-5xl font-black text-slate-900 mb-6">"Make Every Possession Count."</h3>
          <p className="text-lg text-slate-700 font-medium max-w-3xl mx-auto mb-16">
            When an approved maintenance block has remaining capacity, Rail Niyojak searches the maintenance backlog for compatible work that can be safely completed without extending the possession.
          </p>
          
          <div className="bg-white p-8 border border-emerald-200 shadow-xl relative text-left">
            <div className="absolute top-0 right-0 bg-emerald-700 text-white text-[10px] font-bold px-3 py-1 uppercase">Prototype Simulation</div>
            
            <div className="flex justify-between text-xs font-bold text-slate-500 mb-2 border-b border-slate-200 pb-2">
              <span>02:00</span><span>05:00</span>
            </div>
            
            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-4"><span className="w-24 text-sm font-bold text-slate-800">Engineering</span><div className="h-6 bg-red-600 w-3/4"></div></div>
              <div className="flex items-center gap-4"><span className="w-24 text-sm font-bold text-slate-800">S&T</span><div className="h-6 bg-blue-600 w-1/3"></div></div>
              <div className="flex items-center gap-4"><span className="w-24 text-sm font-bold text-slate-800">TRD</span><div className="h-6 bg-amber-500 w-1/3"></div></div>
            </div>

            <div className="flex justify-center mb-8">
              <div className="bg-emerald-100 text-emerald-800 text-sm font-bold py-2 px-6 border border-emerald-300 flex flex-col items-center">
                <ArrowDown className="w-5 h-5 mb-1" /> HARVEST ADDITIONAL COMPATIBLE TASKS
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-6 text-center pt-8 border-t border-slate-200">
              <div><div className="text-sm font-bold text-slate-500 uppercase">Tasks Completed</div><div className="text-2xl font-black text-emerald-700">3 &rarr; 6</div></div>
              <div><div className="text-sm font-bold text-slate-500 uppercase">Block Utilization</div><div className="text-2xl font-black text-emerald-700">82% &rarr; 96%</div></div>
              <div><div className="text-sm font-bold text-slate-500 uppercase">Possession Avoided</div><div className="text-2xl font-black text-emerald-700">4.2 h</div></div>
            </div>
          </div>
          
          <div className="mt-12">
            <Link href="/harvesting" className="inline-flex items-center bg-emerald-700 hover:bg-emerald-600 text-white font-black uppercase tracking-widest px-8 py-4 shadow-lg transition-colors">
              Try Block Harvesting <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* CURRENT VS RAIL NIYOJAK */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-black text-slate-900 uppercase tracking-widest text-center mb-16">From Fragmented Blocks to Coordinated Possessions</h2>
          
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="bg-white p-8 border border-slate-300">
              <h3 className="text-center font-bold text-slate-500 uppercase tracking-widest mb-8">Current Approach</h3>
              <div className="space-y-4 font-bold text-slate-800 text-sm">
                <div className="flex justify-between p-4 bg-slate-100 border border-slate-200"><span>Engineering</span> <span>&rarr; Block A</span></div>
                <div className="flex justify-between p-4 bg-slate-100 border border-slate-200"><span>S&T</span> <span>&rarr; Block B</span></div>
                <div className="flex justify-between p-4 bg-slate-100 border border-slate-200"><span>TRD</span> <span>&rarr; Block C</span></div>
              </div>
              <ul className="mt-8 space-y-2 text-sm text-slate-600 font-medium text-center">
                <li>&times; Multiple Possessions</li>
                <li>&times; Unused Capacity</li>
                <li>&times; Higher Coordination Burden</li>
              </ul>
            </div>
            
            <div className="bg-slate-900 p-8 border border-slate-700 shadow-xl text-white relative">
              <h3 className="text-center font-bold text-amber-500 uppercase tracking-widest mb-8">Rail Niyojak</h3>
              <div className="relative">
                <div className="space-y-4 font-bold text-slate-300 text-sm w-1/2">
                  <div className="p-4 bg-slate-800 border border-slate-700">Engineering</div>
                  <div className="p-4 bg-slate-800 border border-slate-700">S&T</div>
                  <div className="p-4 bg-slate-800 border border-slate-700">TRD</div>
                </div>
                <div className="absolute top-1/2 right-0 -translate-y-1/2 w-1/2 flex items-center justify-end pr-4">
                  <div className="h-px bg-red-500 w-12 absolute left-0 top-1/2 -translate-y-1/2"></div>
                  <div className="p-6 bg-red-800 font-black text-lg text-center border-2 border-red-400 z-10 w-full ml-8">Integrated<br/>Block</div>
                </div>
              </div>
              <ul className="mt-12 space-y-2 text-sm text-slate-300 font-medium text-center">
                <li>&checkmark; Shared Possession</li>
                <li>&checkmark; More Maintenance Completed</li>
                <li>&checkmark; Better Asset Utilization</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* RAILWAY MAINTENANCE ECOSYSTEM */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-2xl font-black text-slate-900 uppercase tracking-widest mb-12">Railway Maintenance Ecosystem</h2>
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            {["TMS", "SMMS", "TDMS", "BDMS", "COA", "Timetable", "Goods Forecast"].map(sys => (
              <div key={sys} className="px-6 py-3 bg-slate-100 border border-slate-300 font-bold text-slate-700 rounded-sm">{sys}</div>
            ))}
          </div>
          <div className="w-px h-16 bg-slate-400 mx-auto mb-8 relative">
            <ArrowDown className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-slate-400" />
          </div>
          <div className="inline-block bg-slate-900 text-white font-black text-2xl tracking-widest py-6 px-16 border-4 border-slate-700 mb-8 shadow-lg">
            {t("brand.name")}
          </div>
          <div className="w-px h-16 bg-slate-400 mx-auto mb-8 relative">
            <ArrowDown className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-slate-400" />
          </div>
          <div className="inline-block bg-red-50 border border-red-200 text-red-900 font-bold px-8 py-4 uppercase tracking-widest">
            Optimized Block Plan
          </div>
        </div>
      </section>

      {/* KEY BENEFITS */}
      <section className="py-20 bg-slate-100">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-black text-slate-900 uppercase tracking-widest mb-12 text-center">Key Benefits</h2>
          <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-6">
            {[
              { title: "Asset Availability", icon: Activity, desc: "Higher infrastructure availability" },
              { title: "Block Utilization", icon: Layers, desc: "Better use of maintenance possessions" },
              { title: "Coordination", icon: Users, desc: "Engineering + S&T + TRD" },
              { title: "Operational Impact", icon: AlertTriangle, desc: "Consider train movement during planning" },
              { title: "Resource Use", icon: Settings, desc: "Better use of crews and equipment" }
            ].map(b => (
              <div key={b.title} className="bg-white p-6 border-t-4 border-slate-800 shadow-sm text-center">
                <b.icon className="w-8 h-8 text-slate-700 mx-auto mb-4" />
                <h4 className="font-black text-sm uppercase text-slate-900 mb-2">{b.title}</h4>
                <p className="text-xs font-medium text-slate-500">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CONTROL TOWER PREVIEW */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-black text-slate-900 uppercase tracking-widest mb-12">Control Tower Preview</h2>
          <div className="bg-slate-900 rounded-t-lg p-4 border-x border-t border-slate-700 flex gap-2">
            <div className="w-3 h-3 rounded-full bg-slate-700"></div><div className="w-3 h-3 rounded-full bg-slate-700"></div><div className="w-3 h-3 rounded-full bg-slate-700"></div>
          </div>
          <div className="bg-slate-50 border border-slate-300 p-8 shadow-2xl relative overflow-hidden text-left mb-12">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
              <div className="bg-white p-4 border border-slate-200 shadow-sm"><div className="text-xs font-bold text-slate-500 uppercase">Asset Availability</div><div className="text-2xl font-black text-slate-900">94.2%</div></div>
              <div className="bg-white p-4 border border-slate-200 shadow-sm"><div className="text-xs font-bold text-slate-500 uppercase">Integrated Blocks</div><div className="text-2xl font-black text-slate-900">7</div></div>
              <div className="bg-white p-4 border border-slate-200 shadow-sm"><div className="text-xs font-bold text-slate-500 uppercase">Block Utilization</div><div className="text-2xl font-black text-slate-900">91%</div></div>
              <div className="bg-white p-4 border border-slate-200 shadow-sm"><div className="text-xs font-bold text-slate-500 uppercase">High-Risk Tasks</div><div className="text-2xl font-black text-slate-900">18</div></div>
              <div className="bg-white p-4 border border-slate-200 shadow-sm"><div className="text-xs font-bold text-slate-500 uppercase">Possession Avoided</div><div className="text-2xl font-black text-slate-900">8.4 h</div></div>
            </div>
            <div className="h-32 bg-slate-200 border border-slate-300 w-full flex items-center justify-center font-bold text-slate-400">
              [ Interactive Timeline View ]
            </div>
          </div>
          
          <Link href="/control-tower" className="inline-flex items-center bg-slate-900 hover:bg-red-800 text-white font-black uppercase tracking-widest px-8 py-4 shadow-lg transition-colors border border-slate-700">
            Enter Control Tower &rarr;
          </Link>
        </div>
      </section>

      {/* HUMAN IN THE LOOP & TRUST */}
      <section className="py-20 bg-slate-100 border-t border-slate-300">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-widest mb-6 border-l-4 border-slate-800 pl-4">Human-in-the-Loop</h2>
            <p className="text-slate-600 font-medium mb-8">
              Rail Niyojak supports railway personnel with recommendations. Final operational decisions remain under authorized human control.
            </p>
            <div className="space-y-4">
              <div className="flex items-center gap-4 bg-white p-4 shadow-sm"><div className="bg-slate-200 p-2"><Database className="w-4 h-4 text-slate-600" /></div><span className="font-bold text-sm">AI Recommendation</span></div>
              <div className="flex items-center gap-4 bg-white p-4 shadow-sm border-l-2 border-red-500"><div className="bg-red-100 p-2"><User className="w-4 h-4 text-red-800" /></div><span className="font-bold text-sm text-red-900">Human Review</span></div>
              <div className="flex items-center gap-4 bg-white p-4 shadow-sm"><div className="bg-emerald-100 p-2"><CheckCircle className="w-4 h-4 text-emerald-700" /></div><span className="font-bold text-sm">Approve / Modify / Reject</span></div>
            </div>
          </div>
          
          <div className="bg-white p-10 border border-slate-300 shadow-lg relative">
            <div className="absolute top-0 right-0 bg-slate-800 text-white text-[10px] font-bold px-3 py-1 uppercase">Governance</div>
            <Shield className="w-12 h-12 text-slate-700 mb-6" />
            <h2 className="text-xl font-black text-slate-900 uppercase tracking-widest mb-6">Designed for Controlled Decision Support</h2>
            <ul className="space-y-4 font-bold text-slate-700 text-sm">
              <li className="flex items-center gap-3"><CheckCircle className="w-4 h-4 text-emerald-600" /> Explainable Recommendations</li>
              <li className="flex items-center gap-3"><CheckCircle className="w-4 h-4 text-emerald-600" /> Audit-ready Decisions</li>
              <li className="flex items-center gap-3"><CheckCircle className="w-4 h-4 text-emerald-600" /> Constraint-aware Planning</li>
              <li className="flex items-center gap-3"><CheckCircle className="w-4 h-4 text-emerald-600" /> Human Approval Required</li>
              <li className="flex items-center gap-3"><CheckCircle className="w-4 h-4 text-emerald-600" /> Synthetic Prototype Data</li>
            </ul>
            <div className="mt-8 pt-4 border-t border-slate-200 text-xs font-bold text-slate-500">
              Prototype developed for Smart India Hackathon 2026.
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-slate-900 text-slate-400 py-12 text-center text-sm font-medium border-t-8 border-red-800">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            &copy; 2026 {t("brand.ministry")}, {t("brand.govt")}. All rights reserved.
          </div>
          <div className="flex items-center gap-6">
            <span className="font-black text-white tracking-widest uppercase">{t("brand.name")}</span>
            <span className="bg-slate-800 text-slate-300 px-2 py-1 text-xs">SIH26027</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
