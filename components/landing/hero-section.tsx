import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { SignInButton } from "../SignInButton";

export default function HeroSection() {
  const heroImages = [
    "/_static/illustrations/hero-image-1.png",
    "/_static/illustrations/hero-image-2.png"
  ];
  const randomHeroImage = heroImages[Math.floor(Math.random() * heroImages.length)];
  return (
    <section className="py-12 sm:py-16 lg:py-20">
      <div className="container flex max-w-5xl flex-col items-center gap-6 text-center lg:gap-12">
        <div className="space-y-4">
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl">
            The Practice Test Generator That Finds What You Don't Know
          </h1>
          <p className="max-w-2xl mx-auto text-lg text-muted-foreground sm:text-xl">
            Paste your notes or upload a PDF. Get practice tests in seconds. No card-making, no setup—just study what you don't know.
          </p>
        </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
          <SignInButton buttonText="Start Practicing for Free" icon={false} />
            <Link
              href="/quizzes"
              className={cn(
              buttonVariants({ variant: "outline" }),
              "transition-all"
              )}
            >
            Browse Practice Tests
            </Link>
        </div>
        <div className="w-full max-w-4xl">
          <div className="relative rounded-xl shadow-2xl">
          <Image
            src={randomHeroImage}
              alt="A student confidently reviewing AI-generated quiz results on a tablet"
              width={1200}
              height={675}
              className="rounded-xl"
            priority
          />
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent rounded-xl" />
          </div>
        </div>
      </div>
    </section>
  );
}