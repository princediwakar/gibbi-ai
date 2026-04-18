import Link from "next/link";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ThemeToggleButton";
import MaxWidthWrapper from "../shared/max-width-wrapper";

export default function SiteFooter({ className }: React.HTMLAttributes<HTMLElement>) {
  const footerLinks = [
    {
      title: "Platform",
      items: [
        { title: "Home", href: "/" },
        { title: "Practice Tests", href: "/quizzes" },
        { title: "Feedback", href: "/feedback" },
        { title: "Features", href: "#features" },
      ],
    },
    {
      title: "Legal",
      items: [
        { title: "Privacy Policy", href: "/privacy" },
        { title: "Terms of Service", href: "/terms" },
      ],
    },
  ];

  return (
    <footer className={cn("border-t border-border bg-background", className)}>
      <MaxWidthWrapper>
        <div className="grid grid-cols-2 gap-8 py-14 md:grid-cols-5">
        {footerLinks.map((section) => (
          <div key={section.title}>
              <h4 className="text-sm font-semibold text-foreground">{section.title}</h4>
              <ul className="mt-4 space-y-3">
              {section.items?.map((link) => (
                <li key={link.title}>
                  <Link
                    href={link.href}
                      className="text-sm text-muted-foreground transition-all hover:text-primary hover:underline"
                  >
                    {link.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
          <div className="col-span-full md:col-span-2">
            <h4 className="text-sm font-semibold text-foreground">GibbiAI</h4>
<p className="mt-2 text-sm text-muted-foreground">
              The smart way to study. Turn any material into practice tests, master the material, ace your exams.
            </p>
        </div>
      </div>

        <div className="flex flex-col items-center justify-between gap-4 border-t border-border py-6 sm:flex-row">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} GibbiAI. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <ThemeToggle />
          </div>
        </div>
      </MaxWidthWrapper>
    </footer>
  );
}