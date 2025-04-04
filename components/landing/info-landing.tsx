import { cn } from "@/lib/utils";
import { Icons } from "@/components/shared/icons";
import MaxWidthWrapper from "@/components/shared/max-width-wrapper";

interface InfoLandingProps {
  data: {
    title: string;
    description: string;
    list: { icon: string; title: string; description: string }[];
  };
  reverse?: boolean;
}

export default function InfoLanding({ data, reverse = false }: InfoLandingProps) {
  return (
    <div className="py-10 sm:py-20">
      <MaxWidthWrapper className="grid gap-10 px-2.5 lg:grid-cols-2 lg:items-center lg:px-7">
        <div className={cn(reverse ? "lg:order-2" : "lg:order-1")}>
          <h2 className="font-heading text-2xl text-foreground md:text-4xl lg:text-[40px]">
            Study Struggles? We’ve Got You Covered.
          </h2>
          <p className="mt-4 text-base text-muted-foreground">
            We get it—studying can feel like a battle. GibbiAI turns your challenges into wins.
          </p>
          <dl className="mt-6 space-y-4 leading-7">
            {data.list.map((item, index) => {
              const Icon = Icons[item.icon as keyof typeof Icons] || Icons.arrowRight;
              return (
                <div className="group relative pl-8 transition-all hover:pl-10" key={index}>
                  <dt className="font-semibold text-foreground">
                    <Icon className="absolute left-0 top-1 size-5 text-primary transition-transform group-hover:translate-x-2" />
                    <span>{item.title}</span>
                  </dt>
                  <dd className="text-sm text-muted-foreground">{item.description}</dd>
                </div>
              );
            })}
          </dl>
        </div>
        <div className={cn("group overflow-hidden rounded-xl border border-border lg:-m-4", reverse ? "order-1" : "order-2")}>
          <div className="aspect-video transition-all group-hover:scale-105">
            <svg
              className="size-full bg-card transition-all group-hover:brightness-110"
              viewBox="0 0 200 100"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Background grid for subtle texture */}
              <g className="text-muted-foreground/10">
                <line x1="0" y1="25" x2="200" y2="25" stroke="currentColor" strokeWidth="1" />
                <line x1="0" y1="50" x2="200" y2="50" stroke="currentColor" strokeWidth="1" />
                <line x1="0" y1="75" x2="200" y2="75" stroke="currentColor" strokeWidth="1" />
                <line x1="50" y1="0" x2="50" y2="100" stroke="currentColor" strokeWidth="1" />
                <line x1="100" y1="0" x2="100" y2="100" stroke="currentColor" strokeWidth="1" />
                <line x1="150" y1="0" x2="150" y2="100" stroke="currentColor" strokeWidth="1" />
              </g>
              {/* Student figure */}
              <rect
                x="20"
                y="40"
                width="40"
                height="40"
                rx="5"
                fill="hsl(var(--muted))"
                className="transition-all group-hover:fill-[hsl(var(--muted))/0.8]"
              />
              <circle
                cx="40"
                cy="30"
                r="10"
                fill="hsl(var(--foreground))"
                className="transition-all group-hover:fill-[hsl(var(--primary))]"
              />
              {/* Stack of books/notes (struggle) */}
              <rect x="10" y="60" width="20" height="10" fill="hsl(var(--muted-foreground))" rx="2" />
              <rect x="15" y="65" width="20" height="10" rx="2" fill="hsl(var(--muted-foreground))/0.8" />
              {/* GibbiAI tablet with results */}
              <rect
                x="140"
                y="40"
                width="40"
                height="25"
                rx="3"
                fill="hsl(var(--background))"
                stroke="hsl(var(--primary))"
                strokeWidth="2"
                className="transition-all group-hover:stroke-[hsl(var(--secondary))]"
              />
              {/* Quiz result checkmark */}
              <path
                d="M150 50 L155 55 L165 45"
                stroke="hsl(var(--primary))"
                strokeWidth="3"
                strokeLinecap="round"
                className="transition-all group-hover:stroke-[hsl(var(--secondary))]"
              />
              {/* Arrow from struggle to success */}
              <path
                d="M60 60 Q100 20 140 50"
                stroke="hsl(var(--primary))"
                strokeWidth="3"
                strokeLinecap="round"
                className="transition-all group-hover:stroke-[hsl(var(--secondary))]"
              />
            </svg>
          </div>
        </div>
      </MaxWidthWrapper>
    </div>
  );
}