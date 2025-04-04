import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ThemeToggleButton";
import { Icons } from "../shared/icons";

export default function SiteFooter({ className }: React.HTMLAttributes<HTMLElement>) {
  const footerLinks = [
    {
      title: "GibbiAI",
      items: [
        { title: "Home", href: "/" },
        { title: "Public Quizzes", href: "/quizzes" },
      ],
    },
    // {
    //   title: "Learn",
    //   items: [
    //     { title: "How It Works", href: "/how-it-works" },
    //     { title: "Features", href: "/features" },
    //     { title: "Success Stories", href: "/success-stories" },
    //   ],
    // },
    // {
    //   title: "Support",
    //   items: [
    //     { title: "FAQ", href: "/faq" },
    //     { title: "Contact Us", href: "/contact" },
    //     { title: "Feedback", href: "/feedback" },
    //   ],
    // },
    {
      title: "Legal",
      items: [
        { title: "Privacy Policy", href: "/privacy" },
        { title: "Terms of Service", href: "/terms" },
      ],
    },
  ];

  const siteConfig = {
    name: "GibbiAI",
    links: {
      twitter: "https://twitter.com/gibbiai",
      github: "https://github.com/GibbiAIteam/GibbiAI",
    },
  };

  return (
    <footer
      className={cn(
        "border-t bg-background border-border", // layout → colors → borders
        className
      )}
    >
      <div className="container grid max-w-6xl grid-cols-2 gap-8 py-14 md:grid-cols-5">
        {footerLinks.map((section) => (
          <div key={section.title}>
            <span className="text-sm font-semibold text-foreground">
              {section.title}
            </span>
            <ul className="mt-4 list-inside space-y-3">
              {section.items?.map((link) => (
                <li key={link.title}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-all hover:underline hover:text-primary" // typography → colors → transitions → interactivity
                  >
                    {link.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
        <div className="col-span-full md:col-span-2 sm:col-span-1"> {/* layout */}
          <h3 className="text-sm font-semibold text-foreground">
            GibbiAI
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">
            An end-to-end AI-based quiz creation, evaluation and progress tracking platform. Powered by OpenAI, ChatGPT and DeepSeek.
          </p>
        </div>
      </div>

      <div className="py-6 border-t border-border"> {/* spacing → borders */}
        <div className="container flex max-w-6xl flex-col items-center gap-4 sm:flex-row sm:justify-between">
          <p className="text-sm text-center text-muted-foreground sm:text-left">
            © {new Date().getFullYear()} GibbiAI. </p>
          <div className="flex items-center gap-4">
            {/* <Link
              href={siteConfig.links.twitter}
              target="_blank"
              rel="noreferrer"
              className="text-muted-foreground transition-all hover:text-primary" // colors → transitions → interactivity
            >
              <Icons.twitter className="size-5" />
              <span className="sr-only">Twitter</span>
            </Link> */}
            <ThemeToggle />
          </div>
        </div>
      </div>
    </footer>
  );
}