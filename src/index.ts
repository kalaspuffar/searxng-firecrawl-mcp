#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from "@modelcontextprotocol/sdk/types.js";
import axios, { AxiosInstance } from "axios";

// Environment configuration
const SEARXNG_URL = process.env.SEARXNG_URL || "http://localhost:8888";
const SEARXNG_KEY = process.env.SEARXNG_KEY;
const FIRECRAWL_URL = process.env.FIRECRAWL_URL;
const FIRECRAWL_KEY = process.env.FIRECRAWL_KEY;

// Interfaces
interface SearXNGResult {
  title: string;
  url: string;
  content?: string;
  engine?: string;
  score?: number;
  category?: string;
  publishedDate?: string;
}

interface SearXNGResponse {
  query: string;
  number_of_results: number;
  results: SearXNGResult[];
  answers?: string[];
  corrections?: string[];
  infoboxes?: any[];
  suggestions?: string[];
}

interface SearchParams {
  query: string;
  categories?: string;
  engines?: string;
  language?: string;
  pageno?: number;
  time_range?: "day" | "month" | "year";
  safesearch?: 0 | 1 | 2;
}

interface FirecrawlResponse {
  success: boolean;
  data?: {
    markdown?: string;
    html?: string;
    metadata?: any;
  };
  error?: string;
}

// Create axios instance for SearXNG
const createSearXNGClient = (): AxiosInstance => {
  const headers: Record<string, string> = {
    "User-Agent": "SearXNG-MCP-Server/1.0",
  };

  if (SEARXNG_KEY) {
    headers["Authorization"] = `Bearer ${SEARXNG_KEY}`;
  }

  return axios.create({
    baseURL: SEARXNG_URL,
    headers,
    timeout: 30000,
  });
};

// Create axios instance for Firecrawl
const createFirecrawlClient = (): AxiosInstance | null => {
  if (!FIRECRAWL_URL) return null;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (FIRECRAWL_KEY) {
    headers["Authorization"] = `Bearer ${FIRECRAWL_KEY}`;
  }

  return axios.create({
    baseURL: FIRECRAWL_URL,
    headers,
    timeout: 30000,
  });
};

const searxngClient = createSearXNGClient();
const firecrawlClient = createFirecrawlClient();

// Search function
async function searchSearXNG(params: SearchParams): Promise<SearXNGResponse> {
  try {
    const searchParams: Record<string, any> = {
      q: params.query,
      format: "json",
    };

    if (params.categories) searchParams.categories = params.categories;
    if (params.engines) searchParams.engines = params.engines;
    if (params.language) searchParams.language = params.language;
    if (params.pageno) searchParams.pageno = params.pageno;
    if (params.time_range) searchParams.time_range = params.time_range;
    if (params.safesearch !== undefined) searchParams.safesearch = params.safesearch;

    const response = await searxngClient.get("/search", {
      params: searchParams,
    });

    return response.data;
  } catch (error: any) {
    throw new Error(
      `SearXNG search failed: ${error.response?.data?.error || error.message}`
    );
  }
}

// Scrape URL function
async function scrapeURL(url: string): Promise<string> {
  if (firecrawlClient) {
    try {
      const response = await firecrawlClient.post<FirecrawlResponse>("/scrape", {
        url,
        formats: ["markdown"],
      });

      if (response.data.success && response.data.data?.markdown) {
        return response.data.data.markdown;
      }
      throw new Error(response.data.error || "Firecrawl scrape failed");
    } catch (error: any) {
      console.error("Firecrawl failed, falling back to basic scrape:", error.message);
    }
  }

  // Fallback to basic axios fetch
  try {
    const response = await axios.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; MCP-Server/1.0)",
      },
      timeout: 15000,
    });

    return response.data;
  } catch (error: any) {
    throw new Error(`Failed to scrape URL: ${error.message}`);
  }
}

// MCP Server
const server = new Server(
  {
    name: "searxng-firecrawl-mcp",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Define tools
const tools: Tool[] = [
  {
    name: "search",
    description:
      "Search the web using SearXNG. Returns a list of search results with titles, URLs, and snippets.",
    inputSchema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "The search query",
        },
        categories: {
          type: "string",
          description:
            "Comma-separated list of categories (e.g., 'general,news,science')",
        },
        engines: {
          type: "string",
          description:
            "Comma-separated list of search engines to use (e.g., 'google,duckduckgo')",
        },
        language: {
          type: "string",
          description: "Language code (e.g., 'en', 'fr', 'de')",
        },
        pageno: {
          type: "number",
          description: "Page number for pagination (default: 1)",
        },
        time_range: {
          type: "string",
          enum: ["day", "month", "year"],
          description: "Filter results by time range",
        },
        safesearch: {
          type: "number",
          enum: [0, 1, 2],
          description: "Safe search level: 0 = None, 1 = Moderate, 2 = Strict",
        },
      },
      required: ["query"],
    },
  },
  {
    name: "scrape",
    description:
      "Scrape content from a URL. Uses Firecrawl if configured, otherwise falls back to basic HTTP fetch.",
    inputSchema: {
      type: "object",
      properties: {
        url: {
          type: "string",
          description: "The URL to scrape",
        },
      },
      required: ["url"],
    },
  },
];

// List tools handler
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools };
});

// Call tool handler
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    if (name === "search") {
      const params = args as SearchParams;
      const results = await searchSearXNG(params);

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(results, null, 2),
          },
        ],
      };
    }

    if (name === "scrape") {
      const { url } = args as { url: string };
      const content = await scrapeURL(url);

      return {
        content: [
          {
            type: "text",
            text: content,
          },
        ],
      };
    }

    throw new Error(`Unknown tool: ${name}`);
  } catch (error: any) {
    return {
      content: [
        {
          type: "text",
          text: `Error: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
});

// Start server
async function main() {
  console.error("SearXNG + Firecrawl MCP Server");
  console.error(`SearXNG URL: ${SEARXNG_URL}`);
  console.error(`Firecrawl: ${FIRECRAWL_URL ? "Enabled" : "Disabled (using fallback)"}`);

  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
