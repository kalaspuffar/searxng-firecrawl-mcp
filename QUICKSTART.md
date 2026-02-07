# 🚀 Quick Setup Guide

## The Problem You Had

The original `mcp-searxng` package has a schema bug where:
- LLMs correctly pass `safesearch` as a **number** (0, 1, 2) - which matches SearXNG's API
- The schema validation incorrectly expects a **string** enum ("0", "1", "2")
- Result: "params.safesearch is not of a type(s) string" error

## The Solution

This implementation:
✅ Properly types `safesearch` as `number` with enum `[0, 1, 2]`
✅ Adds optional Firecrawl support for better content extraction
✅ Falls back gracefully when Firecrawl isn't available
✅ Clean, well-typed codebase

## Installation Steps

### 1. Install dependencies
```bash
cd searxng-firecrawl-mcp
npm install
```

### 2. Build the project
```bash
npm run build
```

### 3. Configure your MCP client

**Option A: Direct path (recommended for testing)**
```json
{
  "mcpServers": {
    "searxng": {
      "command": "node",
      "args": ["/absolute/path/to/searxng-firecrawl-mcp/dist/index.js"],
      "env": {
        "SEARXNG_API_URL": "http://localhost:8888",
        "SEARXNG_API_KEY": "key"
      }
    }
  }
}
```

**Option B: Global install**
```bash
npm install -g .
```

Then:
```json
{
  "mcpServers": {
    "searxng": {
      "command": "searxng-firecrawl-mcp",
      "env": {
        "SEARXNG_API_URL": "http://localhost:8888",
        "SEARXNG_API_KEY": "key"
      }
    }
  }
}
```

### 4. Optional: Add Firecrawl

If you want enhanced content extraction, add these env vars:
```json
"env": {
  "SEARXNG_API_URL": "http://localhost:8888",
  "SEARXNG_API_KEY": "key",
  "FIRECRAWL_API_URL": "http://localhost:3002",
  "FIRECRAWL_API_KEY": "your-firecrawl-key",
  "FIRECRAWL_VERSION": "v2"
}
```

If not configured, it automatically falls back to basic HTTP scraping.

## Testing

### Test the build
```bash
npm run build
node dist/index.js
# Should output: "SearXNG + Firecrawl MCP Server"
```

### Test with MCP Inspector
```bash
npx @modelcontextprotocol/inspector dist/index.js
```

### Test a search
The LLM can now call:
```json
{
  "query": "AI models 2024",
  "safesearch": 1,
  "time_range": "month"
}
```

And it will work! No more type errors.

## Development Mode

```bash
npm run watch
```

This watches for file changes and rebuilds automatically.

## Key Differences from Original

| Feature | Original mcp-searxng | This Implementation |
|---------|---------------------|---------------------|
| safesearch type | string (broken) | number (correct) ✅ |
| Firecrawl support | ❌ | ✅ Optional |
| Fallback scraping | ❌ | ✅ Automatic |
| Type safety | Partial | Full ✅ |
| Error messages | Basic | Detailed ✅ |

## Need Help?

Check:
- `README.md` - Full documentation
- `EXAMPLES.md` - Configuration examples
- `.env.example` - Environment variable template

## Vibe Check ✨

Your LLM should now be able to search without errors. The safesearch parameter works as expected (0, 1, or 2), and you've got optional Firecrawl integration if you want better content extraction.

If you don't need Firecrawl, just don't set FIRECRAWL_API_URL and it'll use basic HTTP scraping. Clean and simple.

Happy coding! 🎉
