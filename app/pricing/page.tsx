 import { PricingCard } from "@/components/PricingCard";

 const pricingPlans: PricingPlan[] = [
		{
			name: "Free",
			price: "$0/month",
			description: "Perfect for getting started",
			features: [
				"Basic quizzes",
				"Community content",
				"Limited analytics",
				"Ad-supported",
			],
			ctaText: "Get Started",
			ctaVariant: "outline",
		},
		{
			name: "Pro",
			price: "$10/month",
			description: "For serious learners",
			features: [
				"Unlimited quizzes",
				"Advanced analytics",
				"Ad-free experience",
				"Priority support",
				"Custom quiz creation",
			],
			mostPopular: true,
			ctaText: "Go Pro",
			ctaVariant: "default",
		},
		{
			name: "Team",
			price: "$50/month",
			description: "For classrooms and groups",
			features: [
				"Everything in Pro",
				"Up to 10 users",
				"Collaborative features",
				"Progress tracking",
				"Custom branding",
			],
			ctaText: "Contact Us",
			ctaVariant: "secondary",
		},
 ];

 export default function PricingPage() {
		return (
			<div className="container mx-auto py-12">
				<div className="text-center mb-12">
					<h1 className="text-4xl font-bold mb-4">
						Pricing Plans
					</h1>
					<p className="text-muted-foreground text-lg">
						Choose the plan that fits your
						learning needs
					</p>
				</div>
				<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
					{pricingPlans.map((plan) => (
						<PricingCard
							key={plan.name}
							plan={plan}
						/>
					))}
				</div>
			</div>
		);
 }