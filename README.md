# SearXNG + Firecrawl MCP Server

A clean, properly-typed MCP server that integrates SearXNG for web search with optional Firecrawl support for enhanced content extraction.

## Features

- ✅ **Proper Type Safety**: Safesearch is correctly typed as `number` (0, 1, 2)
- 🔍 **SearXNG Integration**: Full search capabilities with all parameters
- 🔥 **Optional Firecrawl**: Enhanced content scraping when configured
- 📄 **Graceful Fallback**: Uses basic HTTP when Firecrawl unavailable
- 🎯 **Clean Error Handling**: Informative error messages

## Installation

### Local Development

```bash
cd searxng-firecrawl-mcp
npm install
npm run build
```

### Global Installation

```bash
npm install -g .
```

## Configuration

### Minimal (SearXNG only)

```json
{
  "mcpServers": {
    "searxng": {
      "command": "node",
      "args": ["/path/to/searxng-firecrawl-mcp/dist/index.js"],
      "env": {
        "SEARXNG_URL": "http://localhost:8888",
        "SEARXNG_KEY": "your-optional-key"
      }
    }
  }
}
```

### With Firecrawl

```json
{
  "mcpServers": {
    "searxng": {
      "command": "node",
      "args": ["/path/to/searxng-firecrawl-mcp/dist/index.js"],
      "env": {
        "SEARXNG_URL": "http://localhost:8888",
        "SEARXNG_KEY": "your-optional-key",
        "FIRECRAWL_URL": "http://localhost:3002",
        "FIRECRAWL_KEY": "your-optional-firecrawl-key"
      }
    }
  }
}
```

### After Global Install

```json
{
  "mcpServers": {
    "searxng": {
      "command": "searxng-firecrawl-mcp",
      "env": {
        "SEARXNG_URL": "http://localhost:8888"
      }
    }
  }
}
```

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `SEARXNG_URL` | No | `http://localhost:8888` | Your SearXNG instance URL |
| `SEARXNG_KEY` | No | - | Optional API key for SearXNG |
| `FIRECRAWL_URL` | No | - | Firecrawl server URL (enables Firecrawl) |
| `FIRECRAWL_KEY` | No | - | Optional Firecrawl API key |

## Tools

### `search`

Search the web using SearXNG.

**Parameters:**
- `query` (required): The search query string
- `categories` (optional): Comma-separated categories (e.g., "general,news")
- `engines` (optional): Comma-separated engines (e.g., "google,duckduckgo")
- `language` (optional): Language code (e.g., "en", "fr")
- `pageno` (optional): Page number for pagination (default: 1)
- `time_range` (optional): "day", "month", or "year"
- `safesearch` (optional): 0 (None), 1 (Moderate), or 2 (Strict)

**Example:**
```json
{
  "query": "AI language models",
  "safesearch": 1,
  "time_range": "month",
  "language": "en"
}
```

### `scrape`

Scrape content from a URL. Uses Firecrawl if configured, falls back to basic HTTP fetch.

**Parameters:**
- `url` (required): The URL to scrape

**Example:**
```json
{
  "url": "https://example.com/article"
}
```

## Why This Fork?

The original `mcp-searxng` has a schema issue where LLMs pass `safesearch` as a number (which is correct per SearXNG API), but the schema validation expects a string enum. This implementation:

1. **Fixes the type issue**: `safesearch` is properly typed as `number` with enum values `[0, 1, 2]`
2. **Adds Firecrawl support**: Optional integration for better content extraction
3. **Cleaner codebase**: Simplified, well-typed, and easier to maintain
4. **Better error handling**: More informative error messages

## Development

```bash
# Watch mode
npm run watch

# Build
npm run build

# Test with MCP inspector
npx @modelcontextprotocol/inspector dist/index.js
```

## Troubleshooting

### "safesearch is not of a type(s) string"

This means you're using the old `mcp-searxng` package. This implementation fixes that by properly typing `safesearch` as a number.

### Firecrawl not working

Firecrawl is optional. If `FIRECRAWL_URL` is not set, the server automatically falls back to basic HTTP scraping. Check the server logs to confirm which mode is active.

### Connection refused

Ensure your SearXNG instance is running:
```bash
curl http://localhost:8888/search?q=test&format=json
```

## License

MIT
