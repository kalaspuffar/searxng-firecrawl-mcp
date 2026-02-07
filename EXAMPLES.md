# Configuration Examples

## Scenario 1: Just SearXNG (minimal)

```json
{
  "mcpServers": {
    "searxng": {
      "command": "node",
      "args": ["/absolute/path/to/searxng-firecrawl-mcp/dist/index.js"],
      "env": {
        "SEARXNG_URL": "http://localhost:8888"
      }
    }
  }
}
```

## Scenario 2: SearXNG with authentication

```json
{
  "mcpServers": {
    "searxng": {
      "command": "node",
      "args": ["/absolute/path/to/searxng-firecrawl-mcp/dist/index.js"],
      "env": {
        "SEARXNG_URL": "http://localhost:8888",
        "SEARXNG_KEY": "your-secret-key-here"
      }
    }
  }
}
```

## Scenario 3: SearXNG + Firecrawl (full setup)

```json
{
  "mcpServers": {
    "searxng": {
      "command": "node",
      "args": ["/absolute/path/to/searxng-firecrawl-mcp/dist/index.js"],
      "env": {
        "SEARXNG_URL": "http://localhost:8888",
        "SEARXNG_KEY": "searxng-key",
        "FIRECRAWL_URL": "http://localhost:3002",
        "FIRECRAWL_KEY": "firecrawl-key"
      }
    }
  }
}
```

## Scenario 4: After global install

```bash
# Install globally
npm install -g .
```

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

## Example Search Requests

### Basic search
```json
{
  "query": "machine learning 2024"
}
```

### Search with safesearch (FIXED - now accepts numbers!)
```json
{
  "query": "artificial intelligence",
  "safesearch": 1,
  "time_range": "month",
  "language": "en"
}
```

### Filtered search
```json
{
  "query": "quantum computing",
  "categories": "science,news",
  "engines": "google,duckduckgo",
  "pageno": 2
}
```

### Scrape a URL
```json
{
  "url": "https://example.com/article"
}
```

## Running Firecrawl Locally

If you want to use Firecrawl for enhanced content extraction:

```bash
# Using Docker
docker run -p 3002:3002 \
  -e FIRECRAWL_API_KEY=your-key \
  mendableai/firecrawl:latest
```

Or follow the Firecrawl documentation for local setup.

## Testing Your Setup

### Test SearXNG connection
```bash
curl "http://localhost:8888/search?q=test&format=json"
```

### Test Firecrawl connection (if configured)
```bash
curl -X POST "http://localhost:3002/scrape" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com"}'
```

### Test MCP server
```bash
cd searxng-firecrawl-mcp
npm run build
npx @modelcontextprotocol/inspector dist/index.js
```
