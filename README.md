# Git Portfolio PDF

A web app that generates a polished, downloadable PDF portfolio from any GitHub profile.

Enter a GitHub username or profile URL, and the app fetches your public data — profile info, contribution heatmap, profile README, and pinned repositories — then renders it into a shareable PDF.

## Features

- **Instant profile lookup** — accepts a GitHub username or a full `github.com/` URL
- **Contribution heatmap** — renders the past year of contribution activity
- **Profile README** — pulls and renders the user's profile `README.md` with GFM support, filtering out badges and dynamic stat cards that don't render well in PDF
- **Pinned repositories** — highlights up to 6 pinned repos (with a fallback to top-starred repos)
- **PDF export** — one-click download via `html2canvas` + `jsPDF`
- **Dark mode** — persisted via `localStorage`

## Tech Stack

- [React 19](https://react.dev) + [TypeScript](https://www.typescriptlang.org)
- [Vite](https://vite.dev) for dev server and bundling
- [Axios](https://axios-http.com) for API requests
- [html2canvas](https://html2canvas.hertzen.com) + [jsPDF](https://artskydj.github.io/jsPDF/) for PDF generation
- [react-markdown](https://github.com/remarkjs/react-markdown) with `remark-gfm` and `rehype-raw` for README rendering
- [lucide-react](https://lucide.dev) for icons

## Data Sources

| Data | Source |
|---|---|
| User profile | [GitHub REST API](https://docs.github.com/en/rest/users) |
| Contribution calendar | [github-contributions-api.deno.dev](https://github-contributions-api.deno.dev) |
| Pinned repositories | [gh-pinned-repos.egoist.dev](https://gh-pinned-repos.egoist.dev) (falls back to GitHub REST API) |
| Profile README | `raw.githubusercontent.com/{user}/{user}/main/README.md` |

No GitHub token or authentication is required. All requests are made client-side.

## Getting Started

```bash
npm install
npm run dev
```

Then open [http://localhost:5173](http://localhost:5173).

### Build

```bash
npm run build
```

Output is in `dist/`.

## Limitations

- Contribution data depends on the third-party Deno API and may occasionally be unavailable
- PDF rendering quality depends on `html2canvas`, which captures the DOM as a canvas — very large profiles may produce large files
- Private repositories and private contributions are not accessible without authentication
