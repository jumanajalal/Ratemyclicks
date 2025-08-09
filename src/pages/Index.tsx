import { useEffect } from "react";
import ClickArena from "@/components/ClickArena";

const Index = () => {
  useEffect(() => {
    document.title = "Rate My Clicks — Click Score Game";
    const ensureTag = (selector: string, create: () => HTMLElement) => {
      let el = document.head.querySelector(selector) as HTMLElement | null;
      if (!el) { el = create(); document.head.appendChild(el); }
      return el;
    };
    const metaDesc = ensureTag('meta[name="description"]', () => {
      const m = document.createElement('meta');
      m.setAttribute('name', 'description');
      return m;
    });
    metaDesc.setAttribute('content', 'Rate your clicks with silly scores and comments. Click the big button and get judged!');

    const linkCanon = ensureTag('link[rel="canonical"]', () => {
      const l = document.createElement('link');
      l.setAttribute('rel', 'canonical');
      return l;
    });
    linkCanon.setAttribute('href', window.location.href);
  }, []);

  return (
    <main className="min-h-screen grid place-items-center bg-background px-6 py-16">
      <ClickArena />
    </main>
  );
};

export default Index;
