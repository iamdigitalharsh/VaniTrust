/**
 * Tavily AI Search Service
 * Real-time web ground-truth retrieval for live verification.
 */

export interface TavilySearchResult {
  title: string;
  url: string;
  content: string;
  score: number;
}

export interface TavilySearchResponse {
  answer?: string;
  query: string;
  results: TavilySearchResult[];
}

export class TavilyService {
  private apiKey: string;
  private baseUrl = "https://api.tavily.com";

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.TAVILY_API_KEY || "";
  }

  hasKey(): boolean {
    return Boolean(this.apiKey && this.apiKey.trim().length > 0);
  }

  /**
   * Search official government, medical, and news sources in real time
   */
  async search(query: string): Promise<TavilySearchResponse | null> {
    if (!this.hasKey()) {
      return null;
    }

    try {
      const response = await fetch(`${this.baseUrl}/search`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          api_key: this.apiKey,
          query: `${query} official government guidelines India`,
          search_depth: "basic",
          include_answer: true,
          max_results: 3,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.warn(`Tavily search failed (${response.status}):`, errorText);
        return null;
      }

      const data = await response.json();
      return {
        answer: data.answer,
        query: data.query,
        results: (data.results || []).map((r: any) => ({
          title: r.title,
          url: r.url,
          content: r.content,
          score: r.score || 0.9,
        })),
      };
    } catch (err) {
      console.error("Tavily service error:", err);
      return null;
    }
  }
}
