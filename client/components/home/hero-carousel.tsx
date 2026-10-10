"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  ShoppingCart,
} from "lucide-react";
import type { Product } from "@/constants/mock-data";

export function HeroCarousel({ products }: { products: Product[] }) {
  const slides = products.slice(0, 5).map((product) => ({
    id: product.id,
    title: product.name,
    subtitle: product.description,
    image: product.image,
    ctaLink: `/products/${encodeURIComponent(product.id)}`,
  }));
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchEndX, setTouchEndX] = useState<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const nextSlide = () => {
    if (slides.length > 1) {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }
  };

  const prevSlide = () => {
    if (slides.length > 1) {
      setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    }
  };

  useEffect(() => {
    if (isPaused || slides.length < 2) return;
    timerRef.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused, slides.length]);

  // Touch swipe support for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEndX(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (touchStartX === null || touchEndX === null) return;
    const distance = touchStartX - touchEndX;
    if (distance > 45) {
      nextSlide();
    } else if (distance < -45) {
      prevSlide();
    }
    setTouchStartX(null);
    setTouchEndX(null);
  };

  const handleScrollDown = () => {
    if (typeof window !== "undefined") {
      window.scrollTo({
        top: window.innerHeight,
        behavior: "smooth",
      });
    }
  };

  if (slides.length === 0) {
    return (
      <div className="hero-carousel-root relative flex h-screen min-h-screen w-full items-center justify-center overflow-hidden bg-[#070a10] px-6 text-center sm:h-[100dvh] sm:min-h-[100dvh]">
        <div className="max-w-xl space-y-4">
          <h1 className="text-3xl font-bold text-white sm:text-5xl">
            Products from local sellers
          </h1>
          <p className="text-sm text-zinc-300 sm:text-base">
            There are no products to feature right now. Check back as sellers add listings.
          </p>
          <Link
            href="/marketplace"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 px-6 py-3 text-sm font-bold text-white"
          >
            Explore Marketplace
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      className="hero-carousel-root relative w-full h-screen min-h-screen h-[100vh] min-h-[100vh] sm:h-[100dvh] sm:min-h-[100dvh] overflow-hidden bg-black select-none shadow-2xl"
      style={{ height: "100dvh", minHeight: "100vh" }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* 100% Fullscreen Slides Container across all Browsers & Operating Systems */}
      <div className="relative h-full w-full">
        {slides.map((slide, index) => {
          const isActive = index === currentSlide;

          return (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${isActive
                  ? "opacity-100 z-10 pointer-events-auto"
                  : "opacity-0 z-0 pointer-events-none"
                }`}
            >
              {/* Background Image with Dark Vignette Gradient */}
              <div className="relative h-full w-full overflow-hidden">
                <Image
                  src={slide.image}
                  alt={slide.title}
                  fill
                  unoptimized
                  sizes="100vw"
                  className="object-cover object-center filter brightness-[0.84] transform scale-100 transition-transform duration-7000 ease-out"
                  loading={index === 0 ? "eager" : "lazy"}
                />
                {/* Lateral Dark Vignette */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/60 to-black/25 pointer-events-none" />
                {/* Vertical Gradient to blend seamlessly with the transparent overlay header at top */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#060913] via-transparent to-black/40 pointer-events-none" />
              </div>

              {/* Text & Content Container - Vertically Centered in Fullscreen */}
              <div className="absolute inset-0 flex items-center z-20">
                <div className="mx-auto w-full max-w-[1600px] px-4 sm:px-8 md:px-16 space-y-3 sm:space-y-4 pt-12 sm:pt-16">
                  <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/40 bg-emerald-500/20 px-3 py-1 sm:px-3.5 sm:py-1.5 text-[11px] sm:text-xs font-bold text-emerald-300 backdrop-blur-md shadow-lg w-fit">
                    <span>{products[index]?.category || "Marketplace product"}</span>
                  </div>

                  <h1 className="text-2xl xs:text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight text-white leading-tight max-w-4xl drop-shadow-md">
                    {slide.title}
                  </h1>

                  {slide.subtitle && (
                    <p className="text-xs xs:text-sm sm:text-base md:text-lg text-zinc-300 leading-relaxed max-w-2xl drop-shadow-sm">
                      {slide.subtitle}
                    </p>
                  )}

                  <div className="pt-2 sm:pt-4 flex flex-row items-center gap-2.5 sm:gap-3 flex-wrap">
                    <Link
                      href={slide.ctaLink}
                      className="inline-flex items-center justify-center gap-2 rounded-xl sm:rounded-2xl bg-gradient-to-r from-indigo-500 via-indigo-600 to-cyan-500 px-6 sm:px-8 py-2.5 sm:py-3.5 text-xs sm:text-sm font-bold text-white shadow-xl shadow-indigo-500/30 hover:brightness-110 active:scale-95 transition-all"
                    >
                      <ShoppingCart className="h-4 w-4" />
                      <span>View Product</span>
                      <ArrowRight className="h-4 w-4" />
                    </Link>

                    <Link
                      href="/marketplace"
                      className="inline-flex items-center justify-center gap-2 rounded-xl sm:rounded-2xl border border-white/20 bg-white/10 hover:bg-white/20 px-5 sm:px-7 py-2.5 sm:py-3.5 text-xs sm:text-sm font-semibold text-white backdrop-blur-md transition-all active:scale-95"
                    >
                      <span>Explore Store</span>
                    </Link>
                  </div>

                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Navigation Arrows for Tablet & Desktop */}
      {slides.length > 1 && <button
        type="button"
        onClick={prevSlide}
        aria-label="Previous Slide"
        className="hidden sm:flex absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 z-30 h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black/50 text-white backdrop-blur-md hover:bg-white/20 transition-all cursor-pointer shadow-lg"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>}
      {slides.length > 1 && <button
        type="button"
        onClick={nextSlide}
        aria-label="Next Slide"
        className="hidden sm:flex absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 z-30 h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black/50 text-white backdrop-blur-md hover:bg-white/20 transition-all cursor-pointer shadow-lg"
      >
        <ChevronRight className="h-5 w-5" />
      </button>}

      {/* Bottom Center "SCROLL" Indicator with Smooth Scroll Navigation */}
      <button
        type="button"
        onClick={handleScrollDown}
        className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-1.5 cursor-pointer group select-none text-zinc-400 hover:text-cyan-400 transition-colors focus:outline-none"
        aria-label="Scroll to browse store"
        title="Scroll down"
      >
        <span className="text-[10px] sm:text-[11px] font-mono tracking-[0.25em] uppercase">
          SCROLL
        </span>
        <div className="w-5 h-8 sm:w-5.5 sm:h-9 rounded-full border-2 border-zinc-400/70 group-hover:border-cyan-400 flex items-start justify-center p-1 transition-colors">
          <div className="w-1 h-2 rounded-full bg-zinc-300 group-hover:bg-cyan-400 animate-bounce mt-0.5 transition-colors" />
        </div>
      </button>

      {/* Indicator Pills (Original Brand Color: Cyan active indicator) */}
      <div className="absolute bottom-5 sm:bottom-7 right-4 sm:right-8 z-30 flex items-center gap-1.5 sm:gap-2">
        {slides.map((_, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => setCurrentSlide(idx)}
            className={`h-1.5 rounded-full transition-all cursor-pointer ${idx === currentSlide
                ? "w-6 sm:w-8 bg-cyan-400 shadow-md shadow-cyan-400/50"
                : "w-1.5 sm:w-2 bg-white/30 hover:bg-white/60"
              }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
