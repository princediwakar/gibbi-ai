// File: components/seo/StructuredData.tsx
import { WithContext, WebSite, Organization } from "schema-dts";

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://gibbi.vercel.app";

export const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "GibbiAI - Test Your Knowledge",
  "url": baseUrl,
  "description": "Create, share, and take quizzes on any topic. Join GibbiAI to challenge yourself and others!",
  "potentialAction": {
    "@type": "SearchAction",
    "target": `${baseUrl}/quizzes?search={search_term_string}`,
    "query-input": "required name=search_term_string"
  }
} as WithContext<WebSite>;

export const organizationSchema: WithContext<Organization> = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "GibbiAI",
  "url": baseUrl,
  "logo": `${baseUrl}/logo.png`,
  "sameAs": [
    "https://github.com/gibbi-ai"
  ]
};

export const educationalAppSchema: WithContext<any> = {
  "@context": "https://schema.org",
  "@type": "EducationalApplication",
  "name": "GibbiAI",
  "url": baseUrl,
  "description": "AI-powered exam preparation platform using cognitive science and spaced repetition for JEE Main, NEET, UPSC CSE, and more.",
  "applicationCategory": "EducationalApplication",
  "operatingSystem": "Web",
  "educationalLevel": "High School, Undergraduate, Graduate",
  "teaches": "Physics, Chemistry, Mathematics, Biology, Logical Reasoning, Quantitative Aptitude",
  "educationalUse": "Personalized adaptive practice, knowledge assessment, spaced repetition review",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  }
};

export const breadcrumbSchema = (items: { name: string; url: string }[]) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": items.map((item, index) => ({
    "@type": "ListItem",
    "position": index + 1,
    "name": item.name,
    "item": item.url
  }))
});

export const educationalOrgSchema: WithContext<any> = {
  "@context": "https://schema.org",
  "@type": "EducationalOrganization",
  "name": "GibbiAI",
  "url": baseUrl,
  "logo": `${baseUrl}/logo.png`,
  "description": "Free AI-powered exam preparation platform for JEE Main, NEET, UPSC, GMAT, SAT, GRE, CAT, GATE, CLAT, and CA Foundation. Practice with adaptive spaced repetition.",
  "sameAs": ["https://github.com/gibbi-ai"],
  "audience": {
    "@type": "EducationalAudience",
    "educationalRole": "student",
    "audienceType": "exam aspirants"
  },
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD",
    "description": "Free AI-powered exam practice with no credit card required"
  }
};

export const practiceQuizSchema = (params: {
  url: string;
  examName: string;
  domain: string;
  subject: string;
  description: string;
  questions: Array<{
    questionText: string;
    options: { label: string; text: string }[];
    correctOption: string;
    correctText: string;
  }>;
}) => ({
  "@context": "https://schema.org",
  "@type": "Quiz",
  "name": `${params.domain} Practice Questions - ${params.examName}`,
  "description": params.description,
  "url": params.url,
  "educationalLevel": params.examName,
  "about": { "@type": "Thing", "name": params.domain },
  "hasPart": params.questions.map((q) => ({
    "@type": "Question",
    "name": q.questionText.length > 110 ? q.questionText.slice(0, 107) + "..." : q.questionText,
    "suggestedAnswer": q.options.map((opt) => ({
      "@type": "Answer",
      "text": `${opt.label}) ${opt.text}`,
    })),
    "acceptedAnswer": {
      "@type": "Answer",
      "text": `${q.correctOption}) ${q.correctText}`,
    },
  })),
});

export const insightsDatasetSchema = (params: {
  url: string;
  examName: string;
  reportType: string;
  description: string;
  datePublished: string;
}) => ({
  "@context": "https://schema.org",
  "@type": "Dataset",
  "name": `${params.examName} ${params.reportType} — GibbiAI`,
  "description": params.description,
  "url": params.url,
  "creator": { "@type": "Organization", "name": "GibbiAI", "url": baseUrl },
  "datePublished": params.datePublished,
  "educationalLevel": params.examName,
});

export const learningResourceSchema = (params: {
  url: string;
  examName: string;
  domains: string[];
  scorePct: number;
}) => ({
  "@context": "https://schema.org",
  "@type": "LearningResource",
  "name": `${params.examName} Practice Session — ${params.scorePct}%`,
  "url": params.url,
  "educationalLevel": params.examName,
  "teaches": params.domains,
  "educationalUse": "Practice Session",
  "provider": { "@type": "Organization", "name": "GibbiAI", "url": baseUrl },
});

interface StructuredDataProps {
  schema: WithContext<any>;
}

export function StructuredData({ schema }: StructuredDataProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export default StructuredData;