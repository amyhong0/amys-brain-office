# MCP Host Platform

AI Agent Platform with MCP-host tools, built with Next.js, TypeScript, and Tailwind CSS.

## Features

- **Web Search Tool** - Integrated web search capability using DuckDuckGo API
- **Google OAuth Login** - Secure authentication with Google OAuth
- **MCP Server Management** - Add, remove, and toggle MCP servers with a UI
- **Conversation History** - Sidebar for managing conversation history
- **Tool Log Viewer** - Real-time tool call logging and inspection
- **Model Settings** - Configure model, system prompt, temperature, and max tokens
- **Dark Mode** - Theme toggle with system preference detection
- **Markdown Export** - Export conversations to Markdown format
- **Token & Cost Tracking** - Real-time token usage and cost monitoring

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- NVIDIA API Key (for LLM integration)
- Google OAuth credentials (optional, for authentication)

### Installation

1. Clone the repository and navigate to the project:
```bash
cd mcp-host
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` and add your credentials:
```env
NVIDIA_API_KEY=your_nvidia_api_key_here
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
mcp-host/
├── app/
│   ├── api/
│   │   ├── auth/              # Google OAuth endpoint
│   │   ├── conversations/     # Conversation storage API
│   │   ├── mcp-servers/       # MCP server registry API
│   │   ├── search/            # Web search API
│   │   └── settings/          # Model settings API
│   ├── globals.css            # Global styles with Tailwind
│   ├── layout.tsx             # Root layout
│   └── page.tsx               # Main application page
├── components/
│   ├── ConversationSidebar.tsx    # Conversation history sidebar
│   ├── MCPServerManager.tsx       # MCP server management UI
│   ├── MarkdownExport.tsx        # Markdown export functionality
│   ├── SettingsPanel.tsx          # Model settings panel
│   ├── ThemeToggle.tsx           # Dark mode toggle
│   ├── ToolLogViewer.tsx          # Tool call log viewer
│   └── TokenCostBadge.tsx         # Token usage and cost display
├── lib/
│   ├── auth.ts               # Authentication utilities
│   └── search.ts             # Web search implementation
├── .env.example              # Environment variables template
├── .gitignore                # Git ignore rules
├── next.config.mjs           # Next.js configuration
├── package.json              # Dependencies and scripts
├── postcss.config.mjs        # PostCSS configuration
├── tailwind.config.ts        # Tailwind CSS configuration
└── tsconfig.json             # TypeScript configuration
```

## API Endpoints

### `/api/search`
Web search endpoint using DuckDuckGo API.

**Query Parameters:**
- `q` (required): Search query
- `num` (optional): Number of results (default: 5)

**Example:**
```bash
GET /api/search?q=artificial+intelligence&num=10
```

### `/api/auth`
Google OAuth authentication endpoint.

**Method:** POST  
**Body:** `{ code: string }`  
**Response:** User information and tokens

### `/api/conversations`
Conversation management endpoint.

**Methods:**
- `GET`: List all conversations
- `POST`: Create new conversation
- `DELETE`: Delete conversation (requires `id` query param)

### `/api/mcp-servers`
MCP server registry endpoint.

**Methods:**
- `GET`: List all MCP servers
- `POST`: Add new MCP server
- `PATCH`: Update MCP server (requires `id` query param)
- `DELETE`: Delete MCP server (requires `id` query param)

### `/api/settings`
Model settings endpoint.

**Methods:**
- `GET`: Get current settings
- `PATCH`: Update settings
- `POST`: Reset to default settings

## Components

### ConversationSidebar
Displays conversation history with create and delete functionality.

### ToolLogViewer
Shows real-time tool calls with expandable details for arguments and results.

### MCPServerManager
UI for managing MCP servers - add, remove, enable/disable servers.

### SettingsPanel
Configure model settings including model name, system prompt, temperature, and max tokens.

### ThemeToggle
Toggle between light and dark modes with system preference detection.

### MarkdownExport
Export conversations to Markdown format for documentation or sharing.

### TokenCostBadge
Display real-time token usage and cost estimates.

## Configuration

### Model Settings
Configure via the SettingsPanel or API:
- **Model**: LLM model identifier (default: `qwen/qwen3-next-80b-a3b-instruct`)
- **System Prompt**: Custom system prompt for the AI
- **Temperature**: Response randomness (0-2, default: 0.2)
- **Max Tokens**: Maximum response length (default: 400)

### MCP Servers
Add MCP servers via the UI or API:
- **Name**: Server identifier
- **URL**: Server connection URL
- **Description**: Optional server description
- **Enabled**: Toggle server on/off

## Development

### Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

### Adding New Features

1. **API Routes**: Add to `app/api/[feature]/route.ts`
2. **Components**: Add to `components/[Component].tsx`
3. **Utilities**: Add to `lib/[utility].ts`

## Deployment

### Vercel
```bash
vercel deploy
```

### Docker
Build and run with Docker:
```bash
docker build -t mcp-host .
docker run -p 3000:3000 mcp-host
```

## License

MIT

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.
