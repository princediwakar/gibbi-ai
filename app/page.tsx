import { QuizDashboard } from "@/components/QuizDashboard";
import { metadata } from "./metadata"; // Ensure correct path
import { Metadata } from "next";
// import Header from "@/components/Header";
export const generateMetadata = (): Metadata => metadata;


export default function Dashboard() {
	return (
			<QuizDashboard />
	);
}
