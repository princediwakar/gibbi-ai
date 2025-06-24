import Image from "next/image";
import { HeaderSection } from "@/components/shared/header-section";
import { studentTestimonials } from "@/config/landing";
import MaxWidthWrapper from "../shared/max-width-wrapper";

export default function Testimonials() {

  return (
    <section className="relative">
      <MaxWidthWrapper className="py-24">
      <div className="absolute -z-10 top-0 left-0 h-full w-full bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
        <HeaderSection
          label="Testimonials"
          title="What Our Students Say"
          subtitle="Real stories from students who have transformed their study habits with GibbiAI."
        />
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 px-4 py-12 sm:grid-cols-2 lg:grid-cols-3 lg:gap-12 lg:px-6">
          {studentTestimonials.slice(0, 6).map((item) => (
            <div className="break-inside-avoid" key={item.name}>
              <div className="group relative flex flex-col gap-6 rounded-xl border bg-card p-6 transition-all hover:shadow-lg">
                <div className="flex items-center gap-4">
                  <Image
                    width={40}
                    height={40}
                    className="size-10 rounded-full border border-border object-cover"
                    src={item.image}
                    alt={item.name}
                  />
                  <div className="flex flex-col">
                    <p className="font-semibold text-foreground">
                      {item.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {item.job}
                    </p>
                  </div>
                </div>
                <q className="text-muted-foreground">{item.review}</q>
              </div>
            </div>
          ))}
        </div>
      </MaxWidthWrapper>
    </section>
  );
}



