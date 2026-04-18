import { tavily } from "@tavily/core";

const getTavilyClient = () => {
  const apiKey = process.env.TAVILY_API_KEY;
  if (!apiKey) {
    throw new Error("TAVILY_API_KEY is not configured");
  }
  return tavily({ apiKey });
};

export interface TavilySearchResult {
  title: string;
  url: string;
  content: string;
  score: number;
}

export interface TavilySearchResponse {
  results: TavilySearchResult[];
  responseTime: number;
}

export async function searchCurrentAffairs(
  query: string,
  maxResults: number = 5
): Promise<TavilySearchResponse | null> {
  try {
    const client = getTavilyClient();
    
    const response = await client.search(query, {
      max_results: maxResults,
      search_depth: "basic",
      topic: "general",
    });

    return {
      results: response.results.map((r: { title: string; url: string; content: string; score: number }) => ({
        title: r.title,
        url: r.url,
        content: r.content,
        score: r.score,
      })),
      responseTime: (response as unknown as { response_time?: number }).response_time ?? 0,
    };
  } catch (error) {
    console.error("Tavily search error:", error);
    return null;
  }
}

export function formatSearchContext(results: TavilySearchResponse): string {
  const formatted = results.results
    .slice(0, 3)
    .map((r, i) => `${i + 1}. ${r.title}: ${r.content}`)
    .join("\n\n");
  
  return `CURRENT INFORMATION (from web search):\n${formatted}\n\nUse this information to ensure the quiz contains accurate, up-to-date content.`;
}