import { cn } from "@/lib/utils";
import { Icons } from "@/components/shared/icons";
import MaxWidthWrapper from "@/components/shared/max-width-wrapper";
import BlurImage from "../shared/blur-image";

interface InfoLandingProps {
  data: {
    title: string;
    description: string;
    image: string;
    list: { icon: string; title: string; description: string }[];
  };
  reverse?: boolean;
}

export default function InfoLanding({ data, reverse = false }: InfoLandingProps) {
  return (
    <div className="py-10 sm:py-20">
      <MaxWidthWrapper className="grid gap-10 px-2.5 lg:grid-cols-2 lg:items-center lg:gap-20 lg:px-7">
        <div className={cn(reverse ? "lg:order-2" : "lg:order-1")}>
          <h2 className="font-heading text-3xl text-foreground md:text-4xl lg:text-[40px]">
            {data.title}
          </h2>
          <p className="mt-4 text-base text-muted-foreground">
            {data.description}
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
            <BlurImage
              src={data.image}
              alt={data.title}
              width={1200}
              height={675}
              className="size-full bg-card object-cover"
              />
          </div>
        </div>
      </MaxWidthWrapper>
    </div>
  );
}