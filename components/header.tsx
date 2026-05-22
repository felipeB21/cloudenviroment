import Link from "next/link";
import { ThemeToggle } from "./theme/toggle";
import Image from "next/image";
import Session from "./auth/session";

const NAV_LINKS = [
  { label: "Pricing", href: "/pricing" },
  { label: "About", href: "/about" },
];

export default function Header() {
  return (
    <header className="bg-background fixed top-0 w-full">
      <div className="flex items-center justify-between p-3 max-w-4xl mx-auto">
        <div className="flex items-center gap-5">
          <Link href={"/"} className="flex items-center gap-2">
            <Image
              src={"/brand_logo.svg"}
              alt="Brand Logo"
              width={32}
              height={32}
            />
            <h5 className="text-primary">CloudEnvironment</h5>
          </Link>
          <nav className="mt-0.5">
            <ul className="flex items-center gap-5">
              {NAV_LINKS.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-foreground hover:text-primary"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Session />
        </div>
      </div>
    </header>
  );
}
