import { HeaderSection } from "@/components/shared/header-section";
import { Icons } from "@/components/shared/icons";
import MaxWidthWrapper from "@/components/shared/max-width-wrapper";

export default function Features() {
  const features = [
    {
      title: "Quiz Your Way",
      description: "Convert any topic, PDF, or text into True/False or MCQs—master material fast, no hassle.",
      icon: "edit",
    },
    {
      title: "Exam-Ready Practice",
      description: "Boost confidence with timed tests that mirror real exams—never feel unprepared.",
      icon: "clock",
    },
    {
      title: "Precision Assessment",
      description: "Pinpoint what you know with detailed results and explanations—focus where it counts.",
      icon: "chartBar",
    },
    {
      title: "Progress at a Glance",
      description: "Track your growth over time—stay motivated as you climb to the top.",
      icon: "trendingUp",
    },
  ];

  return (
    <section>
      <div className="pb-6 pt-28">
        <MaxWidthWrapper>
          <HeaderSection
            label="Features"
            title="Your Toolkit for Exam Success"
            subtitle="Everything you need to conquer quizzes and ace your exams."
          />
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => {
              const Icon = Icons[feature.icon as keyof typeof Icons] || Icons.arrowRight;
              return (
                <div
                  className="group relative overflow-hidden rounded-2xl border bg-card p-6 transition-all hover:shadow-lg hover:border-primary/70"
                  key={feature.title}
                >
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 -translate-y-1/2 rounded-full border bg-gradient-to-b from-primary/40 to-card opacity-15 blur-2xl transition-all duration-300 group-hover:-translate-y-1/4 group-hover:opacity-25 dark:from-primary/20 dark:to-card dark:opacity-10 dark:group-hover:opacity-20"
                  />
                  <div className="relative">
                    <div className="relative flex size-14 rounded-xl border border-border bg-background shadow-sm transition-all group-hover:rotate-6">
                      <Icon className="relative m-auto size-7 text-primary transition-colors group-hover:text-secondary" />
                    </div>
                    <h3 className="mt-6 text-xl font-semibold text-foreground">{feature.title}</h3>
                    <p className="mt-2 text-muted-foreground leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </MaxWidthWrapper>
      </div>
    </section>
  );
}