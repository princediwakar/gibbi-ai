// File: app/(sitemap)/sitemap-insights/[id]/route.ts
import taxonomyData from "@/lib/taxonomies.json";

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://gibbi.vercel.app";
const entriesPerSitemap = 50000;

type TaxonomyMap = Record<string, Record<string, string[]>>;
const taxonomy = taxonomyData as unknown as TaxonomyMap;

interface RouteParams {
  id: string;
}

interface SitemapEntry {
  url: string;
  lastModified: string;
  priority: number;
}

function getAllInsightsEntries(): SitemapEntry[] {
  const entries: SitemapEntry[] = [];
  const lastModified = new Date().toISOString();

  // Top-level insights landing page
  entries.push({
    url: "/insights",
    lastModified,
    priority: 0.8,
  });

  // Per-exam insight pages
  for (const exam of Object.keys(taxonomy)) {
    if (exam === "_schema_version") continue;
    entries.push({
      url: `/insights/${encodeURIComponent(exam)}/most-failed-concepts`,
      lastModified,
      priority: 0.7,
    });
    entries.push({
      url: `/insights/${encodeURIComponent(exam)}/hardest-topics`,
      lastModified,
      priority: 0.7,
    });
  }

  return entries;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<RouteParams> },
) {
  const resolvedParams = await params;
  console.log("[sitemap-insights] Request received for ID:", resolvedParams.id);

  const page = parseInt(resolvedParams.id) - 1;
  if (isNaN(page) || page < 0) {
    console.error("[sitemap-insights] Invalid ID format:", resolvedParams.id);
    return new Response(
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>',
      {
        status: 200,
        headers: { "Content-Type": "application/xml; charset=utf-8" },
      },
    );
  }

  console.log(`[sitemap-insights] Generating sitemap for insights page: ${page + 1}`);

  const allEntries = getAllInsightsEntries();
  const paginatedEntries = allEntries.slice(
    page * entriesPerSitemap,
    (page + 1) * entriesPerSitemap,
  );

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${paginatedEntries
    .map(
      (entry) =>
        `<url><loc>${baseUrl}${entry.url}</loc><lastmod>${entry.lastModified}</lastmod><changefreq>daily</changefreq><priority>${entry.priority}</priority></url>`,
    )
    .join("\n")}
</urlset>`;

  console.log(`[sitemap-insights] Generated ${paginatedEntries.length} entries`);
  return new Response(xml, {
    status: 200,
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
