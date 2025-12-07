import { Metadata } from "next";
import { metadata as quizzesMetadata } from "./metadata";

export const metadata: Metadata = quizzesMetadata;

export default function QuizzesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}