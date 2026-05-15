import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  Zap, Scissors, Film, Sparkles, ChevronDown,
  Check, ArrowRight, Play, Pause, BarChart3, Layers, Wand2,
} from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

/* ------------------------------------------------------------------ */
/*  Easing tokens                                                      */
/* ------------------------------------------------------------------ */
const easeExpoOut = [0.16, 1, 0.3, 1] as [number, number, number, number];
const easeSpring = [0.34, 1.56, 0.64, 1] as [number, number, number, number];

/* ------------------------------------------------------------------ */
/*  Animation helpers                                                  */
/* ------------------------------------------------------------------ */
function useScrollReveal(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: threshold });
  return { ref, isInView };
}

const fadeUpVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay, ease: easeExpoOut },
  }),
};

/* ------------------------------------------------------------------ */
/*  Section 1: Hero + Live Terminal                                   */
/* ------------------------------------------------------------------ */
const terminalLines = [
  '> Initializing CutFlow AI engine...',
  '> Loading BeatSync v2.1 module',
  '> Analyzing audio track: "ELECTRIC_DREAMS_V3.wav"',
  '> BPM detected: 128.00 | Key: F# minor',
  '> 4/4 time signature confirmed',
  '> Scanning footage directory: 847 clips found',
  '> Running AI clip analysis...',
  '> - 23 performance takes identified',
  '> - 45 B-roll candidates scored',
  '> - Removing 12 unusable segments',
  '> Building timeline structure...',
  '> [████████████████████] 100% COMPLETE',
  '> Timeline exported: 847 cuts, 3m 42s duration',
  '> Ready for review',
];

function TerminalPanel() {
  const [displayedLines, setDisplayedLines] = useState<string[]>([]);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (currentLineIndex >= terminalLines.length) {
      const pauseTimer = setTimeout(() => {
        setDisplayedLines([]);
        setCurrentLineIndex(0);
        setCurrentCharIndex(0);
      }, 3000);
      return () => clearTimeout(pauseTimer);
    }

    const line = terminalLines[currentLineIndex];
    if (currentCharIndex <= line.length) {
      const charTimer = setTimeout(() => {
        setDisplayedLines((prev) => {
          const updated = [...prev];
          updated[currentLineIndex] = line.slice(0, currentCharIndex);
          return updated;
        });
        setCurrentCharIndex(currentCharIndex + 1);
      }, 30);
      return () => clearTimeout(charTimer);
    } else {
      const nextLineTimer = setTimeout(() => {
        setCurrentLineIndex(currentLineIndex + 1);
        setCurrentCharIndex(0);
      }, 500);
      return () => clearTimeout(nextLineTimer);
    }
  }, [currentLineIndex, currentCharIndex]);

  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = contentRef.current.scrollHeight;
    }
  }, [displayedLines]);

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8, delay: 0.3, ease: easeExpoOut }}
      className="w-full max-w-[420px] overflow-hidden rounded-xl border border-slate"
      style={{
        backgroundColor: '#12121C',
        boxShadow: '0 0 60px rgba(255, 90, 54, 0.08), 0 20px 40px rgba(0, 0, 0, 0.4)',
      }}
    >
      {/* Terminal header */}
      <div
        className="flex items-center gap-3 border-b border-slate px-5 py-3"
      >
        <div className="flex items-center gap-2">
          <span className="block h-3 w-3 rounded-full" style={{ backgroundColor: '#FF5F57' }} />
          <span className="block h-3 w-3 rounded-full" style={{ backgroundColor: '#FFBD2E' }} />
          <span className="block h-3 w-3 rounded-full" style={{ backgroundColor: '#28C840' }} />
        </div>
        <span
          className="mx-auto pr-8 text-xs text-muted"
          style={{ fontFamily: 'JetBrains Mono, monospace' }}
        >
          CUTFLOW AI
        </span>
      </div>

      {/* Terminal content */}
      <div
        ref={contentRef}
        className="h-[340px] overflow-y-auto p-5"
        style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '13px', lineHeight: 1.5, color: '#ECECF3' }}
      >
        {displayedLines.map((line, i) => (
          <div key={`${i}-${currentLineIndex}`} className="whitespace-pre-wrap">
            {line}
            {i === currentLineIndex && currentCharIndex <= terminalLines[i]?.length && (
              <span className="ml-0.5 inline-block h-4 w-2 animate-pulse bg-coral" />
            )}
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function HeroSection() {
  return (
    <section
      id="hero"
      className="relative flex min-h-[100dvh] items-center overflow-hidden"
      style={{ backgroundColor: '#0A0A0F' }}
    >
      {/* Subtle radial gradient */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse 80% 70% at 75% 40%, rgba(255, 90, 54, 0.03) 0%, transparent 60%)',
        }}
      />

      {/* Pixel dots decoration */}
      {Array.from({ length: 25 }).map((_, i) => (
        <div
          key={i}
          className="pointer-events-none absolute h-px w-px rounded-full"
          style={{
            backgroundColor: 'rgba(255, 90, 54, 0.15)',
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            opacity: 0.15,
          }}
        />
      ))}

      <div className="relative z-10 mx-auto flex w-full max-w-[1280px] flex-col items-center gap-12 px-6 py-24 lg:flex-row lg:gap-8 lg:py-0">
        {/* Left - Content */}
        <div className="flex flex-1 flex-col items-start lg:max-w-[55%]">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: easeExpoOut }}
            className="mb-4 text-sm font-medium uppercase tracking-[0.08em] text-coral"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            AI-POWERED MUSIC VIDEO EDITOR
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.05, ease: easeExpoOut }}
            className="text-ivory"
            style={{
              fontFamily: 'Syne, sans-serif',
              fontSize: 'clamp(3rem, 8vw, 6rem)',
              fontWeight: 400,
              lineHeight: 1.0,
              letterSpacing: '-0.02em',
              textTransform: 'uppercase' as const,
            }}
          >
            Music Video Editing, Automated.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15, ease: easeExpoOut }}
            className="mt-6 max-w-[480px] text-muted"
            style={{
              fontFamily: 'Inter, sans-serif',
              fontWeight: 300,
              lineHeight: 1.7,
            }}
          >
            CutFlow AI listens to your music, analyzes your footage, and builds complete timelines synced to the beat. From rough cut to final polish — in minutes, not hours.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25, ease: easeExpoOut }}
            className="mt-8 flex flex-col items-start gap-3"
          >
            <a
              href="#pricing"
              className="group inline-flex items-center gap-2 rounded-pill bg-coral px-6 py-3 text-sm font-medium text-obsidian transition-all duration-200 hover:brightness-110"
              style={{
                fontFamily: 'Inter, sans-serif',
                boxShadow: '0 0 30px rgba(255, 90, 54, 0.3)',
              }}
            >
              Start Creating
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </a>
            <span className="text-xs text-muted" style={{ fontFamily: 'Inter, sans-serif' }}>
              No credit card required
            </span>
          </motion.div>
        </div>

        {/* Right - Terminal */}
        <div className="flex flex-1 justify-center lg:max-w-[45%] lg:justify-end">
          <TerminalPanel />
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Section 2: Video Showcase                                          */
/* ------------------------------------------------------------------ */
function VideoShowcaseSection() {
  const { ref, isInView } = useScrollReveal(0.15);
  const [isPlaying, setIsPlaying] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <section
      id="showcase"
      className="relative py-24"
      style={{
        backgroundColor: '#0A0A0F',
        background: 'linear-gradient(to bottom, transparent 0%, rgba(255, 90, 54, 0.02) 50%, transparent 100%)',
      }}
    >
      <div ref={ref} className="relative mx-auto max-w-[1280px] px-6">
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: easeExpoOut }}
          className="relative overflow-hidden rounded-xl"
          style={{ borderRadius: '32px' }}
        >
          <video
            ref={videoRef}
            autoPlay
            muted
            loop
            playsInline
            className="h-[50vh] w-full object-cover lg:h-[70vh]"
            style={{ borderRadius: '32px' }}
          >
            <source src="/hero-video.mp4" type="video/mp4" />
          </video>

          {/* Play/Pause overlay button */}
          <button
            onClick={togglePlay}
            className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-black/30 text-ivory backdrop-blur-sm transition-all hover:bg-black/50"
          >
            {isPlaying ? <Pause size={24} /> : <Play size={24} />}
          </button>

          {/* Floating card */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.3, ease: easeExpoOut }}
            className="absolute bottom-6 left-6 max-w-[380px] rounded-xl p-6 sm:p-8 lg:bottom-8 lg:left-8"
            style={{
              backgroundColor: 'rgba(18, 18, 28, 0.85)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '24px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
            }}
          >
            <span
              className="mb-3 inline-block text-sm font-medium uppercase tracking-[0.05em] text-coral"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              INTELLIGENT EDITING
            </span>
            <h3
              className="text-lg font-medium text-ivory sm:text-xl"
              style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}
            >
              AI That Understands Your Vision
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-muted" style={{ fontFamily: 'Inter, sans-serif' }}>
              Our neural engine doesn't just cut to the beat — it analyzes motion, detects performance quality, scores B-roll candidates, and understands the emotional arc of your track.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Section 3: Features Grid                                           */
/* ------------------------------------------------------------------ */
const features = [
  {
    icon: Zap,
    title: 'BeatSync AI',
    description: 'AI detects BPM, key, and time signature from any audio track. Cuts footage to the beat in three styles: Staircase, Manual, or Random.',
  },
  {
    icon: Scissors,
    title: 'B-Roll Intelligence',
    description: 'Analyzes 847+ clips in seconds. Scores candidates by motion quality, removes unusable segments, and selects the best takes automatically.',
  },
  {
    icon: Film,
    title: 'Auto Timeline Builder',
    description: 'Constructs structured rough cuts from your footage library. Arranges performance takes, inserts B-roll at transition points, and maintains visual rhythm.',
  },
  {
    icon: Sparkles,
    title: 'VFX & Transitions',
    description: 'One-click application of camera shakes, CRT overlays, film burns, and seamless transitions. Context-aware AI matches effects to the energy of each section.',
  },
];

function FeaturesSection() {
  const { ref, isInView } = useScrollReveal(0.1);

  return (
    <section
      id="features"
      className="py-24"
      style={{ backgroundColor: '#12121C' }}
    >
      <div ref={ref} className="mx-auto max-w-[1280px] px-6">
        {/* Section header */}
        <div className="mb-16 text-center">
          <motion.span
            variants={fadeUpVariants}
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
            custom={0}
            className="mb-4 inline-block text-sm font-medium uppercase tracking-[0.05em] text-coral"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            THE ENGINE
          </motion.span>
          <motion.h2
            variants={fadeUpVariants}
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
            custom={0.1}
            className="text-ivory"
            style={{
              fontFamily: 'Syne, sans-serif',
              fontSize: 'clamp(2rem, 4vw, 3.5rem)',
              fontWeight: 400,
              lineHeight: 1.1,
              letterSpacing: '-0.01em',
            }}
          >
            Seven AI Modules. One Unified Workflow.
          </motion.h2>
          <motion.p
            variants={fadeUpVariants}
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
            custom={0.2}
            className="mx-auto mt-4 max-w-[560px] text-muted"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            From beat detection to VFX application — every step automated.
          </motion.p>
        </div>

        {/* Feature cards */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.1 * i, ease: easeExpoOut }}
              className="group rounded-xl border border-slate p-8 transition-all duration-400"
              style={{
                backgroundColor: '#1A1A28',
                borderRadius: '24px',
                transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLDivElement).style.borderColor = '#FF5A3633';
                (e.currentTarget as HTMLDivElement).style.boxShadow = '0 0 30px rgba(255, 90, 54, 0.05)';
                (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-4px)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLDivElement).style.borderColor = '#2A2A3E';
                (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
                (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
              }}
            >
              <div
                className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl"
                style={{ backgroundColor: '#FF5A361A' }}
              >
                <feature.icon size={24} className="text-coral transition-transform duration-300 group-hover:scale-105" />
              </div>
              <h3
                className="mb-3 text-lg font-medium text-ivory"
                style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}
              >
                {feature.title}
              </h3>
              <p className="text-sm leading-relaxed text-muted" style={{ fontFamily: 'Inter, sans-serif' }}>
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* View All CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.5, ease: easeExpoOut }}
          className="mt-10 text-center"
        >
          <Link
            to="/intelligence"
            className="inline-flex items-center gap-2 text-sm font-medium text-coral transition-all hover:gap-3"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            Explore All Capabilities
            <ArrowRight size={16} />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Section 4: Comparison / Intelligence Teaser                      */
/* ------------------------------------------------------------------ */
const painPoints = [
  { label: 'Plugin Installation Issues', severity: 92 },
  { label: 'BPM Detection Freezes', severity: 87 },
  { label: 'Clip Selection Quality', severity: 83 },
  { label: 'Professional Format Support', severity: 78 },
  { label: 'Context Awareness', severity: 76 },
];

function IntelligenceTeaserSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.2 });

  return (
    <section
      className="py-24"
      style={{ backgroundColor: '#0A0A0F' }}
    >
      <div ref={sectionRef} className="mx-auto grid max-w-[1280px] grid-cols-1 items-center gap-12 px-6 lg:grid-cols-2">
        {/* Left - Narrative */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.7, ease: easeExpoOut }}
        >
          <span
            className="mb-4 inline-block text-sm font-medium uppercase tracking-[0.05em] text-coral"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            COMPETITOR INTELLIGENCE
          </span>
          <h2
            className="text-ivory"
            style={{
              fontFamily: 'Syne, sans-serif',
              fontSize: 'clamp(2rem, 4vw, 3.5rem)',
              fontWeight: 400,
              lineHeight: 1.1,
              letterSpacing: '-0.01em',
            }}
          >
            Why CutFlow AI Wins
          </h2>
          <p
            className="mt-6 max-w-[480px] text-muted"
            style={{ fontFamily: 'Inter, sans-serif', lineHeight: 1.7 }}
          >
            15,000+ editors bought into AI-powered editing. But the leading plugin stalls on BPM detection, skips usable footage, and can't handle professional camera formats. We analyzed 14,000+ social signals to find the real pain points — and built CutFlow AI to solve every single one.
          </p>

          <div className="mt-8 flex gap-10">
            <div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={isInView ? { opacity: 1 } : {}}
                transition={{ duration: 1.5, delay: 0.3 }}
                className="text-3xl font-medium text-coral"
                style={{ fontFamily: 'Syne, sans-serif' }}
              >
                14,000+
              </motion.div>
              <p className="mt-1 text-sm text-muted" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 300 }}>
                Signals analyzed
              </p>
            </div>
            <div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={isInView ? { opacity: 1 } : {}}
                transition={{ duration: 1.5, delay: 0.4 }}
                className="text-3xl font-medium text-coral"
                style={{ fontFamily: 'Syne, sans-serif' }}
              >
                15
              </motion.div>
              <p className="mt-1 text-sm text-muted" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 300 }}>
                Pain points found
              </p>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.5, ease: easeExpoOut }}
            className="mt-8"
          >
            <Link
              to="/intelligence"
              className="group inline-flex items-center gap-2 rounded-pill border border-slate bg-transparent px-6 py-3 text-sm font-medium text-ivory transition-all duration-200 hover:border-coral hover:shadow-coral-subtle"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              See Full Analysis
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </Link>
          </motion.div>
        </motion.div>

        {/* Right - Pain point bars */}
        <div className="flex flex-col gap-5">
          {painPoints.map((point, i) => (
            <div key={point.label}>
              <div className="mb-2 flex items-center justify-between">
                <span
                  className="text-xs text-muted"
                  style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '12px' }}
                >
                  {point.label}
                </span>
                <span
                  className="text-xs text-coral"
                  style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '12px' }}
                >
                  {point.severity}%
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full" style={{ backgroundColor: '#12121C' }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={isInView ? { width: `${point.severity}%` } : {}}
                  transition={{ duration: 1, delay: 0.15 * i, ease: easeExpoOut }}
                  className="h-full rounded-full"
                  style={{ backgroundColor: '#FF5A36' }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Section 5: Stats Strip                                             */
/* ------------------------------------------------------------------ */
const stats = [
  { value: '99.2%', label: 'Beat accuracy' },
  { value: '12', label: 'Dimension clip analysis' },
  { value: '8+', label: 'Pro formats supported' },
  { value: '0', label: 'Plugins needed' },
];

function StatsSection() {
  const { ref, isInView } = useScrollReveal(0.2);

  return (
    <section
      className="py-16"
      style={{ backgroundColor: '#0A0A0F' }}
    >
      <div ref={ref} className="mx-auto max-w-[1280px] px-6">
        <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.1 * i, ease: easeExpoOut }}
              className="text-center"
            >
              <div
                className="text-4xl font-medium text-coral lg:text-5xl"
                style={{ fontFamily: 'Syne, sans-serif' }}
              >
                {stat.value}
              </div>
              <p className="mt-2 text-sm text-muted" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 300 }}>
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Section 6: Platform Preview                                        */
/* ------------------------------------------------------------------ */
function PlatformPreviewSection() {
  const { ref, isInView } = useScrollReveal(0.15);

  return (
    <section
      className="py-24"
      style={{ backgroundColor: '#0A0A0F' }}
    >
      <div ref={ref} className="mx-auto max-w-[1280px] px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: easeExpoOut }}
          className="mb-12 text-center"
        >
          <h2
            className="text-ivory"
            style={{
              fontFamily: 'Syne, sans-serif',
              fontSize: 'clamp(2rem, 4vw, 3.5rem)',
              fontWeight: 400,
              lineHeight: 1.1,
              letterSpacing: '-0.01em',
            }}
          >
            The CutFlow AI Dashboard
          </h2>
          <p className="mt-4 text-muted" style={{ fontFamily: 'Inter, sans-serif' }}>
            See your entire project at a glance.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.8, ease: easeExpoOut }}
          className="relative mx-auto"
          style={{ maxWidth: '1100px' }}
        >
          <img
            src="/mockup-dashboard.jpg"
            alt="CutFlow AI Dashboard"
            className="w-full rounded-xl"
            style={{
              borderRadius: '24px',
              boxShadow: '0 30px 80px rgba(0, 0, 0, 0.5)',
            }}
          />

          {/* Floating tags */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.5, delay: 0.3, ease: easeSpring }}
            className="absolute -left-2 top-[20%] rounded-pill px-4 py-2 text-xs font-medium text-obsidian sm:left-4 lg:left-8"
            style={{ backgroundColor: '#FF5A36', fontFamily: 'Inter, sans-serif', fontWeight: 500 }}
          >
            AI BEAT DETECTION
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.5, delay: 0.5, ease: easeSpring }}
            className="absolute -right-2 top-[45%] rounded-pill border border-slate px-4 py-2 text-xs font-medium text-ivory sm:right-4 lg:right-8"
            style={{ backgroundColor: '#1A1A28', fontFamily: 'Inter, sans-serif', fontWeight: 500 }}
          >
            B-ROLL INTELLIGENCE
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.5, delay: 0.7, ease: easeSpring }}
            className="absolute -right-2 bottom-[20%] rounded-pill px-4 py-2 text-xs font-medium text-obsidian sm:right-4 lg:right-8"
            style={{ backgroundColor: '#FF5A36', fontFamily: 'Inter, sans-serif', fontWeight: 500 }}
          >
            AUTO SYNC
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Section 7: Testimonials                                            */
/* ------------------------------------------------------------------ */
const testimonials = [
  {
    quote: "CutFlow AI cut my editing time by 80%. What used to take a full day now takes 90 minutes. The beat detection is flawless.",
    author: 'Marcus J.',
    role: 'Music Video Director, LA',
  },
  {
    quote: "I was skeptical about AI editing, but CutFlow handles B-roll selection better than my old assistant. It actually understands motion quality.",
    author: 'Priya S.',
    role: 'Freelance Editor, Mumbai',
  },
  {
    quote: "The VFX module alone is worth the subscription. One-click CRT overlays and camera shakes that match the energy of the track — incredible.",
    author: 'Diego R.',
    role: 'Content Creator, 2.1M subs',
  },
];

function TestimonialsSection() {
  const { ref, isInView } = useScrollReveal(0.1);

  return (
    <section
      id="testimonials"
      className="py-24"
      style={{ backgroundColor: '#12121C' }}
    >
      <div ref={ref} className="mx-auto max-w-[1280px] px-6">
        <div className="mb-16 text-center">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, ease: easeExpoOut }}
            className="mb-4 inline-block text-sm font-medium uppercase tracking-[0.05em] text-coral"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            FROM THE COMMUNITY
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.1, ease: easeExpoOut }}
            className="text-ivory"
            style={{
              fontFamily: 'Syne, sans-serif',
              fontSize: 'clamp(2rem, 4vw, 3.5rem)',
              fontWeight: 400,
              lineHeight: 1.1,
              letterSpacing: '-0.01em',
            }}
          >
            Trusted by 15,000+ Editors Worldwide
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.author}
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.1 * i, ease: easeExpoOut }}
              className="relative overflow-hidden rounded-xl border border-slate p-8"
              style={{
                backgroundColor: '#1A1A28',
                borderRadius: '24px',
              }}
            >
              {/* Decorative quote mark */}
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={isInView ? { opacity: 0.1, scale: 1 } : {}}
                transition={{ duration: 1, delay: 0.2 + 0.1 * i, ease: easeSpring }}
                className="absolute left-4 top-2 text-6xl leading-none text-coral"
                style={{ fontFamily: 'Syne, sans-serif', fontSize: '4rem' }}
              >
                &ldquo;
              </motion.span>

              <p
                className="relative z-10 mb-6 text-sm leading-relaxed text-[#8A8AA0]"
                style={{ fontFamily: 'Inter, sans-serif', lineHeight: 1.7 }}
              >
                {t.quote}
              </p>

              <div>
                <p className="text-sm font-medium text-ivory" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>
                  {t.author}
                </p>
                <p className="mt-0.5 text-xs text-muted" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 300 }}>
                  {t.role}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Section 8: Pricing                                                 */
/* ------------------------------------------------------------------ */
const pricingTiers = [
  {
    name: 'Starter',
    price: '$0',
    period: '/month',
    features: ['3 projects/month', 'BeatSync AI (up to 5 min tracks)', '720p export', 'Community support'],
    cta: 'Get Started Free',
    primary: false,
  },
  {
    name: 'Professional',
    price: '$29',
    period: '/month',
    badge: 'MOST POPULAR',
    features: ['Unlimited projects', 'All AI modules unlocked', '4K export + social formats', 'Priority rendering queue', 'Plugin for Premiere Pro & DaVinci'],
    cta: 'Start Free Trial',
    primary: true,
  },
  {
    name: 'Studio',
    price: '$79',
    period: '/month',
    features: ['Everything in Pro', 'Team collaboration (5 seats)', 'Custom VFX pipeline', 'API access', 'Dedicated support'],
    cta: 'Contact Sales',
    primary: false,
  },
];

function PricingSection() {
  const { ref, isInView } = useScrollReveal(0.1);

  return (
    <section
      id="pricing"
      className="py-24"
      style={{ backgroundColor: '#0A0A0F' }}
    >
      <div ref={ref} className="mx-auto max-w-[1280px] px-6">
        <div className="mb-16 text-center">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, ease: easeExpoOut }}
            className="mb-4 inline-block text-sm font-medium uppercase tracking-[0.05em] text-coral"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            SIMPLE PRICING
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.1, ease: easeExpoOut }}
            className="text-ivory"
            style={{
              fontFamily: 'Syne, sans-serif',
              fontSize: 'clamp(2rem, 4vw, 3.5rem)',
              fontWeight: 400,
              lineHeight: 1.1,
              letterSpacing: '-0.01em',
            }}
          >
            Choose Your Flow
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2, ease: easeExpoOut }}
            className="mt-4 text-muted"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            Start free. Scale when you're ready.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {pricingTiers.map((tier, i) => (
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.15 * i, ease: easeExpoOut }}
              className="relative rounded-xl border p-8"
              style={{
                backgroundColor: '#12121C',
                borderColor: tier.primary ? '#FF5A36' : '#2A2A3E',
                borderWidth: tier.primary ? '2px' : '1px',
                borderRadius: '24px',
                transform: tier.primary ? 'scale(1.02)' : 'scale(1)',
              }}
            >
              {/* Badge */}
              {tier.badge && (
                <div
                  className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-pill px-3 py-1 text-xs font-medium text-obsidian"
                  style={{ backgroundColor: '#FF5A36', fontFamily: 'Inter, sans-serif', fontSize: '0.6875rem' }}
                >
                  {tier.badge}
                </div>
              )}

              <h3
                className="mb-2 text-lg font-medium text-ivory"
                style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}
              >
                {tier.name}
              </h3>

              <div className="mb-6 flex items-baseline gap-1">
                <span
                  className="text-4xl font-medium"
                  style={{
                    fontFamily: 'Syne, sans-serif',
                    color: tier.primary ? '#FF5A36' : '#ECECF3',
                  }}
                >
                  {tier.price}
                </span>
                <span className="text-sm text-muted" style={{ fontFamily: 'Inter, sans-serif' }}>
                  {tier.period}
                </span>
              </div>

              <ul className="mb-8 space-y-3">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <Check size={18} className="mt-0.5 shrink-0 text-coral" />
                    <span className="text-sm text-[#8A8AA0]" style={{ fontFamily: 'Inter, sans-serif' }}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <button
                className="w-full rounded-pill py-3 text-sm font-medium transition-all duration-200"
                style={{
                  fontFamily: 'Inter, sans-serif',
                  backgroundColor: tier.primary ? '#FF5A36' : 'transparent',
                  color: tier.primary ? '#0A0A0F' : '#ECECF3',
                  border: tier.primary ? 'none' : '1px solid #2A2A3E',
                  boxShadow: tier.primary ? '0 0 20px rgba(255, 90, 54, 0.2)' : 'none',
                }}
                onMouseEnter={(e) => {
                  if (tier.primary) {
                    (e.currentTarget as HTMLButtonElement).style.filter = 'brightness(1.1)';
                    (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 30px rgba(255, 90, 54, 0.3)';
                  } else {
                    (e.currentTarget as HTMLButtonElement).style.borderColor = '#FF5A36';
                  }
                }}
                onMouseLeave={(e) => {
                  if (tier.primary) {
                    (e.currentTarget as HTMLButtonElement).style.filter = 'brightness(1)';
                    (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 20px rgba(255, 90, 54, 0.2)';
                  } else {
                    (e.currentTarget as HTMLButtonElement).style.borderColor = '#2A2A3E';
                  }
                }}
              >
                {tier.cta}
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Section 9: FAQ                                                     */
/* ------------------------------------------------------------------ */
const faqItems = [
  {
    question: 'What editing software does CutFlow AI support?',
    answer: 'CutFlow AI works as a plugin for Adobe Premiere Pro 2024+, DaVinci Resolve 19+, and Final Cut Pro 11+. We also offer a standalone web-based editor that requires no installation.',
  },
  {
    question: 'Can CutFlow AI handle professional camera formats?',
    answer: 'Yes. Unlike competing tools limited to MP4/MOV, CutFlow supports BRAW, MXF, ProRes, and RED RAW formats natively.',
  },
  {
    question: 'How does the beat detection work?',
    answer: 'Our proprietary BeatSync AI analyzes audio waveforms to detect BPM, key signature, and time signature with 99.2% accuracy. It supports complex time signatures and tempo changes.',
  },
  {
    question: 'Is my footage uploaded to the cloud?',
    answer: 'No. All AI processing runs locally on your machine. For the web editor, footage is processed via secure encrypted connection and never stored permanently.',
  },
  {
    question: 'Can I try CutFlow AI before subscribing?',
    answer: 'Absolutely. The Starter plan is free forever with 3 projects per month. Pro plans include a 14-day free trial with no credit card required.',
  },
  {
    question: 'What video types work best with CutFlow AI?',
    answer: 'While optimized for music videos, CutFlow AI also excels at event recaps, social content, sports highlights, travel videos, and interview editing.',
  },
];

function FAQSection() {
  const { ref, isInView } = useScrollReveal(0.1);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (i: number) => {
    setOpenIndex(openIndex === i ? null : i);
  };

  return (
    <section
      id="faq"
      className="py-24"
      style={{ backgroundColor: '#12121C' }}
    >
      <div ref={ref} className="mx-auto max-w-[800px] px-6">
        <div className="mb-16 text-center">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, ease: easeExpoOut }}
            className="mb-4 inline-block text-sm font-medium uppercase tracking-[0.05em] text-coral"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            QUESTIONS & ANSWERS
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.1, ease: easeExpoOut }}
            className="text-ivory"
            style={{
              fontFamily: 'Syne, sans-serif',
              fontSize: 'clamp(2rem, 4vw, 3.5rem)',
              fontWeight: 400,
              lineHeight: 1.1,
              letterSpacing: '-0.01em',
            }}
          >
            Everything You Need to Know
          </motion.h2>
        </div>

        <div>
          {faqItems.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.08 * i, ease: easeExpoOut }}
              className="border-b border-slate"
            >
              <button
                onClick={() => toggle(i)}
                className="flex w-full items-center justify-between py-6 text-left"
              >
                <span
                  className="pr-4 text-base font-medium text-ivory sm:text-lg"
                  style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}
                >
                  {item.question}
                </span>
                <motion.div
                  animate={{ rotate: openIndex === i ? 180 : 0 }}
                  transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] }}
                  className="shrink-0 text-muted"
                >
                  <ChevronDown size={20} />
                </motion.div>
              </button>
              <AnimatePresence initial={false}>
                {openIndex === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] }}
                    className="overflow-hidden"
                  >
                    <p
                      className="pb-6 text-muted"
                      style={{ fontFamily: 'Inter, sans-serif', lineHeight: 1.7 }}
                    >
                      {item.answer}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Section 10: Final CTA                                              */
/* ------------------------------------------------------------------ */
function CTASection() {
  const { ref, isInView } = useScrollReveal(0.2);

  return (
    <section
      className="relative py-24"
      style={{
        backgroundColor: '#0A0A0F',
        background: 'radial-gradient(ellipse 60% 50% at 50% 80%, rgba(255, 90, 54, 0.04) 0%, transparent 70%)',
      }}
    >
      <div ref={ref} className="mx-auto max-w-[600px] px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: easeExpoOut }}
          className="overflow-hidden rounded-xl border border-slate"
          style={{
            backgroundColor: '#12121C',
            borderRadius: '32px',
            boxShadow: '0 0 40px rgba(255, 90, 54, 0.05)',
          }}
        >
          {/* Terminal header */}
          <div className="flex items-center gap-3 border-b border-slate px-5 py-3">
            <div className="flex items-center gap-2">
              <span className="block h-3 w-3 rounded-full" style={{ backgroundColor: '#FF5F57' }} />
              <span className="block h-3 w-3 rounded-full" style={{ backgroundColor: '#FFBD2E' }} />
              <span className="block h-3 w-3 rounded-full" style={{ backgroundColor: '#28C840' }} />
            </div>
            <span
              className="mx-auto pr-8 text-xs text-muted"
              style={{ fontFamily: 'JetBrains Mono, monospace' }}
            >
              CUTFLOW.AI
            </span>
          </div>

          {/* Content */}
          <div className="p-8">
            <p
              className="mb-2 text-ivory"
              style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '13px', lineHeight: 1.5 }}
            >
              {'> Ready to transform your workflow?'}
            </p>
            <p
              className="mb-6 text-ivory"
              style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '13px', lineHeight: 1.5 }}
            >
              {'> Join 15,000+ editors already creating with AI.'}
            </p>

            <form
              className="flex flex-col gap-3 sm:flex-row"
              onSubmit={(e) => e.preventDefault()}
            >
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 rounded-pill border border-slate bg-surface-elevated px-5 py-3 text-sm text-ivory placeholder-muted outline-none transition-all duration-200 focus:border-coral"
                style={{
                  fontFamily: 'Inter, sans-serif',
                  boxShadow: 'none',
                }}
                onFocus={(e) => {
                  (e.currentTarget as HTMLInputElement).style.borderColor = '#FF5A36';
                  (e.currentTarget as HTMLInputElement).style.boxShadow = '0 0 20px rgba(255, 90, 54, 0.15)';
                }}
                onBlur={(e) => {
                  (e.currentTarget as HTMLInputElement).style.borderColor = '#2A2A3E';
                  (e.currentTarget as HTMLInputElement).style.boxShadow = 'none';
                }}
              />
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 rounded-pill bg-coral px-6 py-3 text-sm font-medium text-obsidian transition-all hover:brightness-110"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                Get Started
                <ArrowRight size={16} />
              </button>
            </form>

            <p
              className="mt-4 text-muted"
              style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '11px' }}
            >
              No spam. Unsubscribe anytime.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Home Page — Assemble all sections                                  */
/* ------------------------------------------------------------------ */
export default function Home() {
  return (
    <>
      <HeroSection />
      <VideoShowcaseSection />
      <FeaturesSection />
      <IntelligenceTeaserSection />
      <StatsSection />
      <PlatformPreviewSection />
      <TestimonialsSection />
      <PricingSection />
      <FAQSection />
      <CTASection />
    </>
  );
}
