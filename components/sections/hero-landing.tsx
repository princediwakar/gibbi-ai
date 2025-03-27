// import Link from "next/link";
// import { cn } from "@/lib/utils";
// import { buttonVariants } from "@/components/ui/button";
// import { Star } from "lucide-react"; // Import shadcn icons
// import { SignInButton } from "../SignInButton";

// import Image from "next/image";

export default function HeroLanding() {
  return (
    <section className="space-y-6 py-12 sm:py-20 lg:py-20">
      <div className="container flex max-w-5xl flex-col items-center gap-5 text-center">
        {/* <Image src="/Q.svg" alt="Quizmaster logo" height={200} width={200}
        /> */}
        {/* <Link
          href="https://twitter.com/quizmasterai"
          className={cn(
            buttonVariants({ variant: "outline", size: "sm", rounded: "full" }),
            "px-4",
          )}
          target="_blank"
        >
          <span className="mr-3">🚀</span>
          <span className="hidden md:flex">Follow us on&nbsp;</span> Twitter
          <Twitter className="ml-2 size-3.5" />
        </Link> */}

        <h1 className="text-balance font-urban text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-[66px]">
          Create Engaging Quizzes with{" "}
          <span className="text-gradient_indigo-purple font-extrabold">
            QuizmasterAI
          </span>
        </h1>

        <p
          className="max-w-2xl text-balance leading-normal text-muted-foreground sm:text-xl sm:leading-8"
          style={{ animationDelay: "0.35s", animationFillMode: "forwards" }}
        >
          Effortlessly generate quizzes for education, training, marketing, and
          more using AI-powered tools.
        </p>

        {/* <div
          className="flex justify-center space-x-2 md:space-x-4"
          style={{ animationDelay: "0.4s", animationFillMode: "forwards" }}
        >
          <div className="w-40"><SignInButton /></div>
          <Link
            href="/pricing"
            target="_blank"
            rel="noreferrer"
            className={cn(
              buttonVariants({
                variant: "outline",
                size: "lg",
              }),
              "px-5",
            )}
          >
            <Star className="mr-2 size-4" />
            <p>
              <span className="hidden sm:inline-block">Explore</span> Pricing
            </p>
          </Link>
        </div>*/}
      </div> 
    </section>
  );
}