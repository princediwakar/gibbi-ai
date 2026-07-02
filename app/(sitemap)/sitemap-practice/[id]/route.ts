// File: app/(sitemap)/sitemap-practice/[id]/route.ts
import taxonomyData from "@/lib/taxonomies.json";

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://gibbi.vercel.app";
const entriesPerSitemap = 50000;

type TaxonomyMap = Record<string, Record<string, string[]>>;
const taxonomy = taxonomyData as unknown as TaxonomyMap;

interface RouteParams {
  id: string;
}

function getAllPracticeEntries(): { url: string; lastModified: string }[] {
  const entries: { url: string; lastModified: string }[] = [];
  for (const [exam, subjects] of Object.entries(taxonomy)) {
    if (exam === "_schema_version") continue;
    for (const [subject, domains] of Object.entries(subjects)) {
      for (const domain of domains) {
        entries.push({
          url: `/practice/${encodeURIComponent(exam)}/${encodeURIComponent(subject)}/${encodeURIComponent(domain)}`,
          lastModified: new Date().toISOString(),
        });
      }
    }
  }
  return entries;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<RouteParams> },
) {
  const resolvedParams = await params;
  console.log("[sitemap-practice] Request received for ID:", resolvedParams.id);

  const page = parseInt(resolvedParams.id) - 1;
  if (isNaN(page) || page < 0) {
    console.error("[sitemap-practice] Invalid ID format:", resolvedParams.id);
    return new Response(
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>',
      {
        status: 200,
        headers: { "Content-Type": "application/xml; charset=utf-8" },
      },
    );
  }

  console.log(`[sitemap-practice] Generating sitemap for practice page: ${page + 1}`);

  const allEntries = getAllPracticeEntries();
  const paginatedEntries = allEntries.slice(
    page * entriesPerSitemap,
    (page + 1) * entriesPerSitemap,
  );

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${paginatedEntries
    .map(
      (entry) =>
        `<url><loc>${baseUrl}${entry.url}</loc><lastmod>${entry.lastModified}</lastmod><changefreq>weekly</changefreq><priority>0.7</priority></url>`,
    )
    .join("\n")}
</urlset>`;

  console.log(`[sitemap-practice] Generated ${paginatedEntries.length} entries`);
  return new Response(xml, {
    status: 200,
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
