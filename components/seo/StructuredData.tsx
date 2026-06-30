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