import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  BookOpenText,
  BriefcaseBusiness,
  ContactRound,
  Handshake,
  Home,
  Info,
  LayoutGrid,
  Menu,
  Phone,
  UserRound,
  X,
  type LucideIcon,
} from "lucide-react";
import { site } from "@/data/site";
import logo from "@/assets/incentify-logo.png";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navigation: { label: string; to: string; icon: LucideIcon }[] = [
  { label: "Home", to: "/", icon: Home },
  { label: "Services", to: "/services", icon: LayoutGrid },
  { label: "Other Services", to: "/other-services", icon: BriefcaseBusiness },
  { label: "Resources", to: "/resources", icon: BookOpenText },
  { label: "About", to: "/about", icon: Info },
  { label: "Contact", to: "/contact", icon: ContactRound },
];

export function SiteHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/85">
      <div className="hidden border-b border-border bg-primary text-primary-foreground lg:block">
        <div className="container-page flex h-9 items-center justify-between text-xs">
          <p>{site.hours}</p>
          <div className="flex items-center gap-5">
            <a className="hover:underline" href={`mailto:${site.email}`}>
              {site.email}
            </a>
            <a className="flex items-center gap-1.5 hover:underline" href={`tel:${site.phoneHref}`}>
              <Phone className="h-3.5 w-3.5" aria-hidden="true" />
              {site.phone}
            </a>
          </div>
        </div>
      </div>

      <div className="container-page">
        <div className="flex h-16 items-center justify-between gap-3 lg:h-[4.5rem]">
          <Link to="/" className="flex shrink-0 items-center" aria-label="Incentify home">
            <img
              src={logo}
              alt="Incentify Private Limited — We Grow Together"
              width={1159}
              height={1074}
              className="h-12 w-auto max-w-[10.5rem] object-contain sm:h-14 sm:max-w-[12rem]"
            />
          </Link>

          <nav aria-label="Main" className="hidden min-w-0 flex-1 items-center justify-center gap-0.5 2xl:gap-1 lg:flex">
            {navigation.map((item) => (
              <NavLink key={item.to} to={item.to} icon={item.icon}>
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex shrink-0 items-center gap-2">
            <div className="hidden items-center gap-1.5 2xl:flex">
              <Link
                to="/portal"
                search={{ role: "customer" }}
                className="inline-flex min-h-9 items-center gap-1.5 rounded-md border border-border bg-background px-3 text-xs font-bold text-foreground transition-colors hover:border-primary/40 hover:text-primary"
              >
                <UserRound className="h-3.5 w-3.5" aria-hidden="true" /> Customer Login
              </Link>
              <Link
                to="/portal"
                search={{ role: "partner" }}
                className="inline-flex min-h-9 items-center gap-1.5 rounded-md border border-border bg-background px-3 text-xs font-bold text-foreground transition-colors hover:border-primary/40 hover:text-primary"
              >
                <Handshake className="h-3.5 w-3.5" aria-hidden="true" /> Partner Login
              </Link>
            </div>
            <Button asChild size="sm" className="hidden whitespace-nowrap sm:inline-flex">
              <Link to="/consultation">Book a Consultation</Link>
            </Button>
            <button
              type="button"
              className="inline-flex h-11 w-11 items-center justify-center rounded-md border border-border text-foreground lg:hidden"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {mobileOpen && (
        <div className="fixed inset-x-0 top-16 bottom-0 z-50 overflow-y-auto border-t border-border bg-background lg:hidden">
          <nav aria-label="Mobile" className="container-page py-4">
            {navigation.map((item) => (
              <MobileLink key={item.to} to={item.to} icon={item.icon} onClick={() => setMobileOpen(false)}>
                {item.label}
              </MobileLink>
            ))}
            <div className="grid grid-cols-2 gap-2 border-b border-border py-4">
              <Link
                to="/portal"
                search={{ role: "customer" }}
                onClick={() => setMobileOpen(false)}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-border bg-secondary px-3 text-sm font-bold text-foreground"
              >
                <UserRound className="h-4 w-4" /> Customer
              </Link>
              <Link
                to="/portal"
                search={{ role: "partner" }}
                onClick={() => setMobileOpen(false)}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-border bg-secondary px-3 text-sm font-bold text-foreground"
              >
                <Handshake className="h-4 w-4" /> Partner
              </Link>
            </div>
            <div className="grid gap-3 py-6">
              <Button asChild size="lg">
                <Link to="/consultation" onClick={() => setMobileOpen(false)}>
                  Book a Consultation
                </Link>
              </Button>
              <a href={`tel:${site.phoneHref}`} className="flex items-center justify-center gap-2 py-2 text-sm font-semibold text-primary">
                <Phone className="h-4 w-4" aria-hidden="true" /> {site.phone}
              </a>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}

function NavLink({ to, children, icon: Icon, className }: { to: string; children: ReactNode; icon: LucideIcon; className?: string }) {
  return (
    <Link
      to={to}
      activeOptions={{ exact: to === "/" }}
      activeProps={{ className: "text-primary bg-secondary" }}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md px-2.5 py-2 text-sm font-medium whitespace-nowrap text-foreground transition-colors hover:bg-secondary hover:text-primary 2xl:px-3",
        className,
      )}
    >
      <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
      <span>{children}</span>
    </Link>
  );
}

function MobileLink({ to, children, icon: Icon, onClick }: { to: string; children: ReactNode; icon: LucideIcon; onClick: () => void }) {
  return (
    <Link to={to} onClick={onClick} className="flex items-center gap-3 border-b border-border py-4 text-base font-semibold">
      <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary">
        <Icon className="h-4 w-4" aria-hidden="true" />
      </span>
      {children}
    </Link>
  );
}
