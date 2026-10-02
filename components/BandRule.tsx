// A hairline across the page, with a cross where it meets the content column.
// The landing page was a scroll of blocks floating in space; the rules give it
// the structure of a schematic, which is what makes a page like vite.dev feel
// built rather than assembled.
//
// The cross is drawn here rather than in a utility class so this stands on its
// own — two branches were touching globals.css at once.
const CROSS = {
  width: 9,
  height: 9,
  backgroundImage:
    "linear-gradient(var(--color-border-crisp) 0 0), linear-gradient(var(--color-border-crisp) 0 0)",
  backgroundSize: "100% 1px, 1px 100%",
  backgroundPosition: "center, center",
  backgroundRepeat: "no-repeat",
} as const;

export default function BandRule({ width = "max-w-[1180px]" }: { width?: string }) {
  return (
    <div aria-hidden="true" className="border-t border-border-crisp">
      <div className={`relative mx-auto ${width} px-5 md:px-8`}>
        <span className="absolute -top-[5px] left-5 md:left-8" style={CROSS} />
        <span className="absolute -top-[5px] right-5 md:right-8" style={CROSS} />
      </div>
    </div>
  );
}
