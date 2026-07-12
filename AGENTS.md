<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Codebase knowledge graph (graphify)

`graphify-out/GRAPH_REPORT.md` is a generated one-page map of this codebase: god nodes, communities, and cross-module connections. **Read it before broad file searches or architecture questions** — navigate by structure instead of grepping raw files. For precise traversals: `graphify query "<question>"`, `graphify path "A" "B"`, `graphify explain "X"` (all read `graphify-out/graph.json`).

If `graphify-out/` is missing, build it: `uv tool install graphifyy && graphify install` then run `/graphify .` (or ask Claude to). Git hooks rebuild the graph after every commit and branch switch.
