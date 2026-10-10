import React, { useMemo, useState, useRef, useEffect } from 'react';
import { SplitFlap } from 'react-split-flap';
import { AsciiEffect } from './ui/ascii-effect';
import './Hero.css';

// Character set containing spaces, uppercase, lowercase, and digits
// This ensures react-split-flap preserves mixed-case letters like "Mobile Developer"
const SPLIT_FLAP_CHARS = [
  ' ',
  ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''),
  ...'abcdefghijklmnopqrstuvwxyz'.split(''),
  ...'0123456789'.split(''),
];

const LENS_RADIUS = 60; // Magnifying lens radius (120px diameter)
const DOT_RADIUS = 7.5; // Exactly matches the 15px default dot cursor (7.5px radius)
const DURATION_ENTER = 240; // ms
const DURATION_LEAVE = 200; // ms

// Duration for ASCII glitch effect on initial load (0.5 seconds) and cross-fade
const ASCII_DURATION = 500;       // ms (0.5 seconds)
const ASCII_FADE_DURATION = 350;  // ms cross-fade

// Smooth spring ease-out for blooming lens
const easeOutBack = (t) => {
  const c1 = 1.15;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
};
// Smooth cubic ease-out for contracting back to dot
const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

export default function Hero() {
  const chars = useMemo(() => SPLIT_FLAP_CHARS, []);
  const frameRef = useRef(null);
  const lensRef = useRef(null);
  const colorImgRef = useRef(null);
  const ringRef = useRef(null);
  const [isHoveringImg, setIsHoveringImg] = useState(false);
  const [showAscii, setShowAscii] = useState(true);
  const [asciiFading, setAsciiFading] = useState(false);

  // High-performance animation controller for morphing between dot and magnifier
  const animRef = useRef({
    progress: 0,
    startProgress: 0,
    targetProgress: 0,
    startTime: 0,
    animating: false,
    rafId: null,
    coords: { x: 0, y: 0 },
  });

  const applyFrame = (progress, x, y) => {
    if (!lensRef.current || !colorImgRef.current || !ringRef.current) return;

    // Both aperture and ring radius expand/contract in 100% mathematical lock-step
    const r = DOT_RADIUS + (LENS_RADIUS - DOT_RADIUS) * progress;
    const scale = (DOT_RADIUS / LENS_RADIUS) + (1 - (DOT_RADIUS / LENS_RADIUS)) * progress; // 0.125 -> 1.0
    const bgAlpha = Math.max(0, 1 - progress * 1.5); // Solid dot fill at 0, dissolves to clear ring
    const opacity = progress <= 0 ? 0 : Math.min(1, progress * 4);

    const clip = `circle(${r.toFixed(1)}px at ${x}px ${y}px)`;
    lensRef.current.style.clipPath = clip;
    lensRef.current.style.webkitClipPath = clip;
    lensRef.current.style.opacity = opacity.toFixed(2);
    colorImgRef.current.style.transformOrigin = `${x}px ${y}px`;

    ringRef.current.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%) scale(${scale.toFixed(3)})`;
    ringRef.current.style.backgroundColor = `rgba(57, 254, 22, ${bgAlpha.toFixed(2)})`;
    ringRef.current.style.opacity = opacity.toFixed(2);
  };

  const startAnimation = (target) => {
    const anim = animRef.current;
    anim.targetProgress = target;
    anim.startProgress = anim.progress;
    anim.startTime = performance.now();
    anim.animating = true;

    if (anim.rafId) cancelAnimationFrame(anim.rafId);

    const tick = (now) => {
      const elapsed = now - anim.startTime;
      const duration = anim.targetProgress === 1 ? DURATION_ENTER : DURATION_LEAVE;
      const t = Math.min(1, elapsed / duration);
      const eased = anim.targetProgress === 1 ? easeOutBack(t) : easeOutCubic(t);
      
      anim.progress = Math.max(0, Math.min(1, anim.startProgress + (anim.targetProgress - anim.startProgress) * eased));
      
      applyFrame(anim.progress, anim.coords.x, anim.coords.y);

      if (t < 1) {
        anim.rafId = requestAnimationFrame(tick);
      } else {
        anim.progress = anim.targetProgress;
        anim.animating = false;
        anim.rafId = null;

        if (anim.targetProgress === 1) {
          applyFrame(1, anim.coords.x, anim.coords.y);
        } else {
          if (lensRef.current) lensRef.current.style.clipPath = 'circle(0px at 50% 50%)';
          setIsHoveringImg(false);
        }
      }
    };

    anim.rafId = requestAnimationFrame(tick);
  };

  const getCoords = (e) => {
    if (!frameRef.current) return { x: 0, y: 0 };
    const rect = frameRef.current.getBoundingClientRect();
    const borderLeft = frameRef.current.clientLeft || 0;
    const borderTop = frameRef.current.clientTop || 0;
    return {
      x: Math.round(e.clientX - rect.left - borderLeft),
      y: Math.round(e.clientY - rect.top - borderTop),
    };
  };

  const handleMouseMove = (e) => {
    const coords = getCoords(e);
    animRef.current.coords = coords;

    // If fully expanded and transition is idle, update directly for 0-latency tracking
    if (!animRef.current.animating && animRef.current.progress === 1) {
      if (lensRef.current) {
        lensRef.current.style.clipPath = `circle(${LENS_RADIUS}px at ${coords.x}px ${coords.y}px)`;
        lensRef.current.style.webkitClipPath = `circle(${LENS_RADIUS}px at ${coords.x}px ${coords.y}px)`;
      }
      if (colorImgRef.current) {
        colorImgRef.current.style.transformOrigin = `${coords.x}px ${coords.y}px`;
      }
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${coords.x}px, ${coords.y}px, 0) translate(-50%, -50%)`;
      }
    }
  };

  const handleMouseEnter = (e) => {
    const coords = getCoords(e);
    animRef.current.coords = coords;
    setIsHoveringImg(true);
    startAnimation(1);
  };

  const handleMouseLeave = () => {
    startAnimation(0);
  };

  useEffect(() => {
    // Fade out ASCII effect after 1 second
    const fadeTimer = setTimeout(() => {
      setAsciiFading(true);
    }, ASCII_DURATION);

    // Unmount the ASCII canvas after it has dissolved
    const removeTimer = setTimeout(() => {
      setShowAscii(false);
    }, ASCII_DURATION + ASCII_FADE_DURATION);

    const anim = animRef.current;
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
      if (anim.rafId) {
        cancelAnimationFrame(anim.rafId);
      }
    };
  }, []);

  return (
    <main id="hero" className="hero-container">
      <div className="hero-content">
        {/* Centermost client photo with interactive magnifying lens */}
        <div className="hero-image-wrapper">
          <div
            ref={frameRef}
            className={`hero-image-frame ${isHoveringImg ? 'lens-active' : ''}`}
            data-cursor="lens"
            onMouseMove={handleMouseMove}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onDragStart={(e) => e.preventDefault()}
            onContextMenu={(e) => e.preventDefault()}
          >
            {/* Base grayscale image */}
            <img
              src="/ralph-dainiell.jpg"
              alt="Ralph Dainiell Gonzaga"
              className="hero-image hero-image-base"
              loading="eager"
              draggable={false}
              onDragStart={(e) => e.preventDefault()}
            />

            {/* ASCII Effect on initial mount (runs for 0.5 seconds) */}
            {showAscii && (
              <div className={`hero-ascii-overlay ${asciiFading ? 'fade-out' : ''}`}>
                <AsciiEffect
                  imageSrc="/ralph-dainiell.jpg"
                  alt="Ralph Dainiell Gonzaga - ASCII"
                  variant="glitch"
                  chars=" .:-=+*#%@"
                  fontSize={10}
                  fontFamily="'VT323', monospace"
                  colors={["#111215", "#52525b", "#d4d4d8", "#ffffff"]}
                  backgroundColor="#0d0f12"
                  revealDuration={ASCII_DURATION}
                  glitchIntensity={0.9}
                  glitchFrequency={45}
                  fit="cover"
                  focusX={0.5}
                  focusY={0.22}
                  scale={1}
                />
              </div>
            )}

            {/* Magnifying Color Lens Reveal Layer */}
            <div
              ref={lensRef}
              className="hero-image-lens"
            >
              <img
                ref={colorImgRef}
                src="/ralph-dainiell.jpg"
                alt="Ralph Dainiell Gonzaga - Natural Color"
                className="hero-image hero-image-color"
                draggable={false}
                onDragStart={(e) => e.preventDefault()}
              />
            </div>

            {/* Magnifying Glass Ring (Clipped strictly within the photo frame) */}
            <div
              ref={ringRef}
              className="hero-lens-ring"
            />
          </div>
        </div>

        {/* Right side information & SplitFlap badges */}
        <div className="hero-details">
          <div className="hero-name-block">
            <h1 className="hero-name">
              <span className="hero-name-line">RALPH DAINIELL</span>
              <span className="hero-name-line">GONZAGA</span>
            </h1>
          </div>

          <div className="hero-badges">
            <div className="hero-badge">
              <SplitFlap
                value="Mobile Developer"
                chars={chars}
                size="small"
                theme="dark"
                hinge={true}
                timing={12}
                duration={300}
                animateOnMount={true}
                fontColor="#27C93F"
                background="transparent"
                className="custom-split-flap"
              />
            </div>

            <div className="hero-badge">
              <SplitFlap
                value="DevOps Engineer"
                chars={chars}
                size="small"
                theme="dark"
                hinge={true}
                timing={15}
                duration={300}
                animateOnMount={true}
                fontColor="#27C93F"
                background="transparent"
                className="custom-split-flap"
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
