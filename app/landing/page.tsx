import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { CheckIcon, RocketIcon, LightbulbIcon, BarChartIcon, StarIcon, ClockIcon, SettingsIcon, TrendingUpIcon } from "lucide-react";
import Image from "next/image";

export default function LandingPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      {/* Hero Section */}
      <section className="text-center mb-16">
        <Badge variant="secondary" className="mb-4">
          <RocketIcon className="mr-2 h-4 w-4" />
          AI-Powered Assessments
        </Badge>
        <h1 className="text-4xl font-bold mb-4">
          Effortlessly Create Engaging, Auto-Graded Quizzes
        </h1>
        <p className="text-xl text-muted-foreground mb-8">
          Save time, boost engagement, and track student progress with ease.
        </p>
        <div className="flex justify-center gap-4">
          <Button size="lg">Start Free Today</Button>
          <Button variant="outline" size="lg">
            Learn More
          </Button>
        </div>
      </section>

{/* Pain Points Section - Alternate Version */}
<section className="mb-16">
  <h2 className="text-2xl font-bold text-center mb-8">
    Teaching Online Is Tough – We Make It Easier
  </h2>
  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
    {[
      {
        icon: <StarIcon className="h-8 w-8" />,
        title: "Boost Engagement",
        description: "Interactive formats make learning fun and engaging",
        color: "from-blue-50 to-blue-100",
        stats: "40% higher engagement",
        image: "/images/engagement.jpg",
      },
      {
        icon: <BarChartIcon className="h-8 w-8" />,
        title: "Save Time",
        description: "Automate quiz creation and grading",
        color: "from-green-50 to-green-100",
        stats: "5+ hours saved weekly",
        image: "/images/time-saver.jpg",
      },
      {
        icon: <LightbulbIcon className="h-8 w-8" />,
        title: "Track Progress",
        description: "Get real-time insights into student performance",
        color: "from-purple-50 to-purple-100",
        stats: "90% faster feedback",
        image: "/images/progress.jpg",
      },
    ].map((feature, i) => (
      <div key={i} className={`relative overflow-hidden rounded-lg bg-gradient-to-b ${feature.color} group hover:shadow-lg transition-all duration-300`}>
        <div className="p-8 z-10 relative">
          <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center mb-6 shadow-sm">
            {feature.icon}
          </div>
          <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
          <p className="text-muted-foreground mb-4">{feature.description}</p>
          <div className="text-sm font-semibold text-muted-foreground bg-white/50 px-3 py-1.5 rounded-full inline-block">
            {feature.stats}
          </div>
        </div>
        {/* <Image 
          src={feature.image} 
          alt={feature.title}
          width={400}
          height={300}
          className="absolute inset-0 w-full h-full object-cover opacity-10 group-hover:opacity-20 transition-opacity"
        /> */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/30 to-white/70"></div>
      </div>
    ))}
  </div>
</section>
{/* Why Educators Love It Section - Alternate Version */}
<section className="mb-16">
  <h2 className="text-2xl font-bold text-center mb-8">Why Educators Love It</h2>
  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
    {[
      {
        icon: <ClockIcon className="h-8 w-8" />,
        title: "Instant AI-Generated Quizzes",
        description: "No more manual question writing",
        stats: "Save 5+ hours/week",
        color: "bg-blue-50",
        image: "/images/ai-quiz.jpg",
      },
      {
        icon: <SettingsIcon className="h-8 w-8" />,
        title: "Auto-Grading & Insights",
        description: "Less time grading, more time teaching",
        stats: "90% faster grading",
        color: "bg-green-50",
        image: "/images/auto-grade.jpg",
      },
      {
        icon: <TrendingUpIcon className="h-8 w-8" />,
        title: "Boost Engagement",
        description: "Interactive formats make learning fun",
        stats: "40% higher engagement",
        color: "bg-purple-50",
        image: "/images/engagement.jpg",
      },
      {
        icon: <StarIcon className="h-8 w-8" />,
        title: "In-Depth Analytics",
        description: "Track performance & improve outcomes",
        stats: "95% satisfaction rate",
        color: "bg-orange-50",
        image: "/images/analytics.jpg",
      },
    ].map((feature, i) => (
      <div key={i} className={`relative overflow-hidden rounded-lg ${feature.color} group`}>
        <div className="p-8 z-10 relative">
          <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center mb-6">
            {feature.icon}
          </div>
          <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
          <p className="text-muted-foreground mb-4">{feature.description}</p>
          <div className="text-sm font-semibold text-muted-foreground">
            {feature.stats}
          </div>
        </div>
        {/* <Image 
          src={feature.image} 
          alt={feature.title}
          width='300'
          height='300'
          className="absolute inset-0 w-full h-full object-cover opacity-20 group-hover:opacity-30 transition-opacity"
        /> */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white/50"></div>
      </div>
    ))}
  </div>
</section>


      {/* How It Works Section */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-center mb-8">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              step: "1",
              title: "Enter Your Topic",
              description: "Provide your content or topic",
            },
            {
              step: "2",
              title: "AI Generates Quiz",
              description: "Get instant, auto-graded quizzes",
            },
            {
              step: "3",
              title: "Share & Track",
              description: "Monitor student progress in real-time",
            },
          ].map((step, i) => (
            <div key={i} className="text-center">
              <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto mb-4">
                {step.step}
              </div>
              <h3 className="text-xl font-bold mb-2">{step.title}</h3>
              <p className="text-muted-foreground">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing Section */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-center mb-8">Simple & Transparent Pricing</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              title: "Starter",
              price: "$9.99/mo",
              features: ["AI assessments", "Auto-grading"],
              bestFor: "New Educators",
            },
            {
              title: "Pro",
              price: "$19.99/mo",
              features: ["Unlimited quizzes", "Advanced analytics"],
              bestFor: "Scaling Creators",
            },
            {
              title: "Business",
              price: "$49.99/mo",
              features: ["LMS integrations", "Priority support"],
              bestFor: "Teams & Experts",
            },
          ].map((plan, i) => (
            <Card key={i} className="p-6">
              <CardHeader className="text-center">
                <h3 className="text-xl font-bold mb-2">{plan.title}</h3>
                <p className="text-3xl font-bold mb-4">{plan.price}</p>
                <Badge variant="secondary">{plan.bestFor}</Badge>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  {plan.features.map((feature, j) => (
                    <li key={j} className="flex items-center">
                      <CheckIcon className="mr-2 h-4 w-4 text-primary" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter className="mt-4">
                <Button className="w-full">Get Started</Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="mb-16">
        <div className="max-w-2xl mx-auto text-center">
          <blockquote className="text-xl italic mb-4">
            "This tool saved me HOURS of work and helped my students stay engaged!"
          </blockquote>
          <div className="flex items-center justify-center gap-2">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-primary-foreground">
              SM
            </div>
            <div className="text-left">
              <p className="font-semibold">Sarah M.</p>
              <p className="text-sm text-muted-foreground">Online Instructor</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h2>
        <div className="max-w-2xl mx-auto space-y-4">
          {[
            {
              question: "How does AI generate quizzes?",
              answer: "Our AI analyzes your topic and instantly creates accurate, engaging questions.",
            },
            {
              question: "Can I customize the quizzes?",
              answer: "Yes! Edit, add, or remove questions as needed.",
            },
            {
              question: "Do I need to install anything?",
              answer: "Nope! It's a fully online tool—just log in and start creating.",
            },
          ].map((faq, i) => (
            <Card key={i} className="p-6">
              <CardHeader className="font-semibold">{faq.question}</CardHeader>
              <CardContent className="text-muted-foreground">
                {faq.answer}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="bg-primary/10 p-8 rounded-lg text-center">
        <h2 className="text-2xl font-bold mb-4">Start Creating Smarter Assessments Today</h2>
        <p className="text-muted-foreground mb-8">
          Your first 3 quizzes are free! No credit card required.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" className="w-full sm:w-auto">
            Try It Free Now
          </Button>
          <Button variant="outline" size="lg" className="w-full sm:w-auto">
            Learn More
          </Button>
        </div>
      </section>
    </div>
  );
}