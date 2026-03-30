import { useNavigate } from "react-router-dom";

import logo from "@/assets/logo.png";

const navItems = [
  { label: "Website", href: "https://vibe.trading" },
  { label: "Docs on Github", href: "https://github.com/0xneelo/vibe_docs" },
  { label: "Try our Closed Alpha", href: "https://closed-alpha.vibe.trading" },
  { label: "Twitter", href: "https://twitter.com/vibe_trading" },
];

export function HomeNavbar() {
  const navigate = useNavigate();

  return (
    <div className="w-full">
      <nav className="flex w-full items-center justify-between px-4 py-4 sm:px-6 md:px-8 md:py-5">
        <button
          type="button"
          className="flex items-center gap-3 text-left"
          onClick={() => navigate("/")}
          aria-label="Go to home page"
        >
          <img src={logo} alt="Logo" className="h-8 w-auto rounded-md" />
        </button>

        <div className="hidden items-center gap-7 md:flex">
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-base text-foreground/90 transition hover:text-foreground"
            >
              <span>{item.label}</span>
            </a>
          ))}
        </div>

        <button
          type="button"
          className="uiverse-nav-btn h-10 px-4 sm:h-12 sm:px-6"
          onClick={() => navigate("/library")}
        >
          <span className="uiverse-nav-btn__label">Learn More</span>
        </button>
      </nav>

      <div className="mt-[3px] h-px w-full bg-gradient-to-r from-transparent via-foreground/20 to-transparent" />
    </div>
  );
}
