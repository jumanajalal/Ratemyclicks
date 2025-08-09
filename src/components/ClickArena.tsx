import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

const COMMENTS = [
  "Elegant click.",
  "That click was suspicious…",
  "10/10 would click again.",
  "Click of the century!",
  "A bold and decisive click.",
  "Weirdly satisfying.",
  "Weak click. Try harder.",
  "Majestic. Truly majestic.",
  "That click woke the servers.",
  "Certified crispy click.",
];

const FUN_FACTS = [
  "Fun fact: Honey never spoils.",
  "Fun fact: Bananas are berries, but strawberries aren't.",
  "Fun fact: Octopuses have three hearts.",
  "Fun fact: Your click traveled thousands of miles of fiber.",
  "Fun fact: A group of flamingos is called a flamboyance.",
];

function useLocalBest(key = "best-click-score") {
  const [best, setBest] = useState<number | null>(null);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw) setBest(Number(raw));
    } catch {}
  }, [key]);

  const update = (val: number) => {
    try {
      const next = best === null ? val : Math.max(best, val);
      setBest(next);
      localStorage.setItem(key, String(next));
    } catch {}
  };
  return { best, update };
}

export default function ClickArena() {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [score, setScore] = useState<number | null>(null);
  const [comment, setComment] = useState<string>("");
  const [fact, setFact] = useState<string>("");
  const [wiggle, setWiggle] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { best, update } = useLocalBest();

  // Signature moment: pointer-follow gradient
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      el.style.setProperty("--x", `${x}%`);
      el.style.setProperty("--y", `${y}%`);
    };
    el.addEventListener("mousemove", onMove);
    return () => el.removeEventListener("mousemove", onMove);
  }, []);

  const verdict = useMemo(() => {
    if (score === null) return null;
    if (score >= 95) return "Legendary click!";
    if (score >= 85) return "Elite finger energy.";
    if (score <= 10) return "Was that a tap or a whisper?";
    return null;
  }, [score]);

  const handleBeep = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = "triangle";
      o.frequency.value = 520;
      o.connect(g);
      g.connect(ctx.destination);
      g.gain.setValueAtTime(0.001, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.05, ctx.currentTime + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.18);
      o.start();
      o.stop(ctx.currentTime + 0.2);
    } catch {}
  };

  const startAnalysis = () => {
    if (loading) return;
    setWiggle(true);
    setTimeout(() => setWiggle(false), 300);
    handleBeep();

    setLoading(true);
    setProgress(0);
    setScore(null);
    setComment("");
    setFact("");

    const duration = 750;
    const start = performance.now();

    const tick = (t: number) => {
      const elapsed = t - start;
      const p = Math.min(100, Math.round((elapsed / duration) * 100));
      setProgress(p);
      if (p < 100) {
        requestAnimationFrame(tick);
      } else {
        // Compute silly score
        const nextScore = Math.floor(Math.random() * 101);
        setScore(nextScore);
        // Rules override sometimes
        const pool = [...COMMENTS];
        if (nextScore > 95) pool.unshift("Click of the century!");
        if (nextScore < 10) pool.unshift("Weak click. Try harder.");
        const chosen = pool[Math.floor(Math.random() * pool.length)];
        setComment(chosen);
        setFact(FUN_FACTS[Math.floor(Math.random() * FUN_FACTS.length)]);
        update(nextScore);
        setLoading(false);
      }
    };

    requestAnimationFrame(tick);
  };

  return (
    <section aria-label="Rate My Clicks Arena" className="relative">
      <div ref={containerRef} className="relative">
        <div className="pointer-gradient" aria-hidden />
        <div className="relative z-10 mx-auto max-w-2xl text-center space-y-6 animate-enter">
          <h1 className="font-display text-5xl sm:text-6xl tracking-wide bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Rate My Clicks
          </h1>
          <p className="text-muted-foreground max-w-prose mx-auto">
            One big button. Infinite judgement. Click to get your totally scientific score.
          </p>

          <div className="flex items-center justify-center">
            <Button
              variant="hero"
              size="xl"
              className={cn(
                "hover-scale select-none px-12",
                wiggle && "animate-wiggle"
              )}
              onClick={startAnalysis}
              aria-label="Click Me"
            >
              Click Me
            </Button>
          </div>

          {/* Loading bar */}
          {loading && (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Analyzing your click…</p>
              <Progress value={progress} />
            </div>
          )}

          {/* Result */}
          {!loading && score !== null && (
            <div className="space-y-3 animate-enter">
              <p className="text-lg text-muted-foreground">Your click score</p>
              <div className="font-display text-6xl sm:text-7xl">
                {score}/100
              </div>
              <p className="font-fun text-xl">{verdict ?? comment}</p>
              {best !== null && (
                <p className="text-sm text-muted-foreground">Best score on this device: <span className="font-medium">{best}</span></p>
              )}
              {fact && (
                <p className="text-sm text-muted-foreground">{fact}</p>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
