import { HeaderSection } from "@/components/shared/header-section";
import { Icons } from "@/components/shared/icons";
import MaxWidthWrapper from "@/components/shared/max-width-wrapper";

export default function Features() {
  const features = [
    {
      title: "Flexible Quiz Creation",
      description: "Generate True/False or multiple-choice questions from any topic, text, or PDF.",
      icon: "edit",
    },
    {
      title: "Timed Practice Exams",
      description: "Simulate real exam conditions to build confidence and improve time management.",
      icon: "clock",
    },
    {
      title: "Detailed Performance Analytics",
      description: "Pinpoint strengths and weaknesses with insightful results and explanations.",
      icon: "chartBar",
    },
    {
      title: "Track Your Progress",
      description: "Monitor your improvement over time and stay motivated on your path to success.",
      icon: "trendingUp",
    },
  ];

  return (
    <section>
      <div className="pb-6 pt-28">
        <MaxWidthWrapper>
          <HeaderSection
            label="Features"
            title="Everything You Need to Succeed"
            subtitle="GibbiAI provides a complete toolkit to help you master any subject and ace your exams."
          />
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => {
              const Icon = Icons[feature.icon as keyof typeof Icons] || Icons.arrowRight;
              return (
                <div
                  className="group relative overflow-hidden rounded-2xl border bg-card p-6 text-center transition-all hover:-translate-y-2 hover:shadow-2xl"
                  key={feature.title}
                >
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 -translate-y-1/2 rounded-full bg-gradient-to-b from-primary/10 to-transparent opacity-50 blur-2xl transition-all duration-300 group-hover:-translate-y-1/4 group-hover:opacity-100"
                  />
                  <div className="relative">
                    <div className="relative mx-auto flex size-14 items-center justify-center rounded-xl border border-border bg-background shadow-sm transition-all group-hover:scale-110">
                      <Icon className="size-7 text-primary" />
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