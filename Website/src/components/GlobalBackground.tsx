import { useLocation } from "react-router-dom";

export function GlobalBackground() {
  const { pathname } = useLocation();
  const quietGradient =
    pathname.startsWith("/simulations") ||
    pathname.startsWith("/chapters") ||
    pathname.startsWith("/collections") ||
    pathname.startsWith("/docs");

  return (
    <div className={`global-animated-bg ${quietGradient ? "global-animated-bg--quiet" : ""}`} aria-hidden="true">
      <div className="global-animated-bg__mesh" />
      <div className="global-animated-bg__orb global-animated-bg__orb--a" />
      <div className="global-animated-bg__orb global-animated-bg__orb--b" />
      <div className="global-animated-bg__orb global-animated-bg__orb--c" />
      <div className="global-animated-bg__sweep" />
      <div className="global-animated-bg__pulse" />
      <div className="global-animated-bg__veil" />
    </div>
  );
}
