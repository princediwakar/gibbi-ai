import Image from "next/image";
import { HeaderSection } from "@/components/shared/header-section";
import { studentTestimonials } from "@/config/landing";

export default function Testimonials() {

  return (
    <section>
      <div className="container flex max-w-6xl flex-col gap-10 py-32 sm:gap-y-16">
        <HeaderSection
          label="Success Stories"
          title="Real Wins with GibbiAI"
          subtitle="See how students like you are crushing it with GibbiAI."
        />
        <div className="flex flex-col gap-6 mb-6">
          <div className="grid gap-4 sm:grid-cols-3 text-center">
            <div>
              <p className="text-2xl font-semibold text-foreground">20,000+</p>
              <p className="text-muted-foreground">Students Boosted</p>
            </div>
            <div>
              <p className="text-2xl font-semibold text-foreground">50,000+</p>
              <p className="text-muted-foreground">Quizzes Crafted</p>
            </div>
            <div>
              <p className="text-2xl font-semibold text-foreground">1M+</p>
              <p className="text-muted-foreground">Questions Conquered</p>
            </div>
          </div>
        </div>
        <div className="column-1 gap-6 space-y-6 md:columns-2 lg:columns-3">
          {studentTestimonials.map((item) => (
            <div className="break-inside-avoid" key={item.name}>
              <div className="group relative rounded-xl border bg-card p-6 transition-all hover:shadow-md hover:border-primary/50">
                <div className="flex flex-col">
                  <div className="relative mb-4 flex items-center gap-3">
                    <span className="relative inline-flex size-10 shrink-0 items-center justify-center rounded-full transition-all group-hover:scale-105">
                      <Image
                        width={100}
                        height={100}
                        className="size-full rounded-full border border-border ring-2 ring-background transition-all group-hover:ring-primary"
                        src={item.image}
                        alt={item.name}
                      />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {item.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {item.job}
                      </p>
                    </div>
                  </div>
                  <q className="text-muted-foreground italic transition-all group-hover:text-foreground">{item.review}</q>
                  <p className="mt-2 text-xs text-muted-foreground opacity-75">
                    {item.location}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}



