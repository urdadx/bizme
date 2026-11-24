import { Button } from "@/components/ui/button";
import { BrandLogo } from "@/components/brand-logo";
import { Link } from "@tanstack/react-router";
import { useEffect, useRef } from "react";

const menuItems = [
  { name: "Features", href: "#features" },
  { name: "Setup", href: "#setup" },
  { name: "FAQs", href: "#faqs" },
];

const githubUrl = "https://github.com/urdadx/bizme";

// The compact "pill" state is driven by a CSS scroll timeline (see `.hero-nav` in globals.css),
// so scrolling never touches React. Browsers without scroll-driven animations get a single
// IntersectionObserver that flips `data-scrolled` instead of a per-scroll-event listener.
function useScrollFallback() {
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (CSS.supports("animation-timeline: scroll()")) return;

    const nav = navRef.current;
    const sentinel = document.createElement("div");
    sentinel.setAttribute("aria-hidden", "true");
    sentinel.style.cssText =
      "position:absolute;top:0;left:0;width:1px;height:50px;pointer-events:none";
    document.body.prepend(sentinel);

    const observer = new IntersectionObserver(([entry]) => {
      nav?.toggleAttribute("data-scrolled", !entry.isIntersecting);
    });
    observer.observe(sentinel);

    return () => {
      observer.disconnect();
      sentinel.remove();
    };
  }, []);

  return navRef;
}

export const HeroHeader = () => {
  const navRef = useScrollFallback();

  return (
    <header>
      <nav ref={navRef} className="hero-nav fixed inset-x-0 z-20 px-4 sm:px-6">
        <div className="hero-nav-bar mx-auto mt-2 w-full max-w-6xl border border-transparent px-4 sm:px-6 lg:px-12">
          <div className="relative flex items-center justify-between gap-6 py-3 lg:py-4">
            <Link to="/" aria-label="home" className="flex items-center space-x-2">
              <BrandLogo className="size-8" />
            </Link>

            <ul className="absolute inset-0 m-auto hidden size-fit gap-8 text-sm lg:flex">
              {menuItems.map((item) => (
                <li key={item.name}>
                  <a
                    href={item.href}
                    className="block text-muted-foreground duration-150 hover:text-accent-foreground"
                  >
                    {item.name}
                  </a>
                </li>
              ))}
              <li>
                <a
                  href={githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-muted-foreground duration-150 hover:text-accent-foreground"
                >
                  Github
                </a>
              </li>
            </ul>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                className="hero-nav-login hidden lg:inline-flex"
                render={<Link to="/login" />}
                nativeButton={false}
              >
                Login
              </Button>
              <Button size="sm" render={<Link to="/register" />} nativeButton={false}>
                Get started
              </Button>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};
