// Renders a schema.org JSON-LD block. Server component — the payload is in the
// server-rendered HTML, so crawlers and answer engines read it without JS.
export default function JsonLd({ data }: { data: unknown }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
