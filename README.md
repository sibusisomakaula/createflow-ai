# CreateFlow AI

CreateFlow AI is a lightweight AI-powered content generation workspace for turning a short brief into a useful first draft. The app supports text, code, and image generation through a clean multi-page interface with secure server-side AI requests and browser-local history.

> Choose a format, add a little context, and let CreateFlow shape the first draft.

## Product overview

CreateFlow AI is organized around three focused areas:

| Area | Purpose |
| --- | --- |
| **Create** | Generate emails, blog posts, social media copy, product descriptions, code, and images. |
| **Prompt Library** | Search and filter curated prompts, then use a prompt to prefill the matching generator. |
| **History** | Review, copy, download, view, and delete recent saved generations stored in the current browser. |
| **Dashboard** | See LocalStorage-backed creation metrics, quick actions, and recent work in one workspace overview. |

The interface uses a calm cyan workspace with deep navy actions, lavender active states, teal borders, and a creativity-focused image logo. The layout is responsive and stacks the generator form and result panel on smaller screens.

## Features

- Six generator types: Email, Blog, Social Media, Product Description, Code, and Image.
- Dynamic input forms with type-specific fields, validation, loading states, and sanitized user-facing errors.
- Server-side LLM calls for text and code generation so provider credentials are not exposed to the browser.
- Server-side image generation with View, Download, Save, Regenerate, and Delete actions.
- Syntax-highlighted code output with a dedicated Copy Code action.
- Twenty curated prompt cards with search, category filters, and Use Prompt navigation.
- Prompt prefill flow from the Prompt Library into the Create workspace.
- LocalStorage history capped at the latest 20 saved generations and ordered newest-first.
- Dashboard overview with creation counts, format coverage, quick actions, recent-work summaries, and empty states.
- Login and Signup routes connected to the secure account portal without forcing authentication before app use.
- Empty states and responsive navigation for desktop and mobile use.

## Technology

| Layer | Technology |
| --- | --- |
| Frontend | React 19, TypeScript, Vite, Tailwind CSS 4, Wouter, Lucide React |
| Backend | Node.js, Express, tRPC 11 |
| AI | Server-side Manus LLM and image-generation helpers |
| Persistence | Browser LocalStorage for saved generations and image data where practical |
| Validation | Vitest and TypeScript checking |
| Deployment | Managed Manus WebDev hosting with project checkpoints |

## Repository structure

```text
client/
  src/
    components/       Shared UI and template components
    lib/               Client helpers, including LocalStorage history utilities
    pages/             Dashboard, Create, Prompt Library, History, Login, and Signup experiences
    App.tsx            Application routes and providers
    index.css          Global theme and responsive visual system
server/
  _core/              Managed server infrastructure and AI integrations
  promptTemplates.ts  Structured prompt construction and required-field logic
  routers.ts          tRPC procedures for generation and authentication
  *.test.ts           Server-side Vitest coverage
drizzle/              Database schema and migrations from the project template
shared/                Shared constants and types
todo.md               Implementation and acceptance checklist
README.md             Project documentation
```

## Requirements

Use Node.js 22 or a compatible current Node.js release and pnpm. The project template supplies the required application dependencies and development tooling.

The generation procedures rely on server-side environment values supplied by the managed project runtime. In a local environment, configure the values required by the project template, including the built-in API URL and key and session values. Do not commit `.env` files or provider credentials.

Common managed environment variables include:

```text
BUILT_IN_FORGE_API_URL
BUILT_IN_FORGE_API_KEY
JWT_SECRET
OAUTH_SERVER_URL
VITE_APP_ID
VITE_OAUTH_PORTAL_URL
DATABASE_URL
```

## Local development

Install dependencies and start the development server:

```bash
pnpm install
pnpm dev
```

The development server runs the full application stack and exposes the Vite client through the managed project preview URL.

## Available scripts

| Command | Description |
| --- | --- |
| `pnpm dev` | Start the development server with TypeScript watch mode. |
| `pnpm check` | Run the TypeScript compiler without emitting files. |
| `pnpm test` | Run the complete Vitest suite for server and client tests. |
| `pnpm build` | Build the Vite client and bundled production server. |
| `pnpm start` | Start the production bundle. |
| `pnpm format` | Format project files with Prettier. |

## Testing

The repository includes coverage for authentication logout behavior, protected history behavior when a session is present, structured prompt construction, required-field validation, sanitized upstream generation failures, and LocalStorage history limits.

Run the validation suite with:

```bash
pnpm check
pnpm test
pnpm build
```

The browser should also be used to verify the primary user flows: switching generator types, generating a result, copying or saving output, using a library prompt, reviewing history, and testing the responsive mobile navigation.

## AI request architecture

AI requests are initiated from the Create workspace through typed tRPC mutations. The browser sends the selected generator type and structured form fields to the server. The server validates required input, builds a type-specific prompt, calls the configured AI helper, and returns a normalized result. Provider failures are logged server-side while the client receives a sanitized error message.

This approach keeps provider credentials on the server and gives the frontend a typed contract through the tRPC router. Image results are returned as image content and can be saved locally when the user chooses to keep them.

## Data and privacy notes

Saved history is stored in the current browser using LocalStorage. Clearing browser storage removes those saved items. The application should not be used to submit confidential, regulated, or personally sensitive information unless the deployment's privacy and retention requirements have been reviewed.

The repository does not seed or fabricate customer reviews, ratings, or testimonials. Prompt Library entries are curated product content, not user testimonials.

## Deployment

This project is designed for the managed Manus WebDev workflow. Create a checkpoint after a verified change; the project configuration may publish the checkpoint automatically. For a normal change, the recommended sequence is:

```bash
pnpm check
pnpm test
pnpm build
```

Then review the desktop and mobile preview and save a descriptive project checkpoint.

## Contributing

Keep feature work focused and update `todo.md` whenever requirements or bugs are added. Prefer shared UI components and existing template conventions. Keep server-side AI calls behind typed procedures, validate user input before invoking providers, and add Vitest coverage for new business logic.

## License

This repository does not currently declare a project-specific license. Add a license file before distributing the code publicly or accepting external contributions.
