/**
 * Renders a policy section's admin-edited description. Blank-line-separated
 * blocks where every line starts with "- " render as a bullet list; every
 * other block renders as a plain paragraph. A description with no bullets at
 * all (the common case) just renders as a single paragraph, same as before.
 */
export default function PolicyBody({ text }: { text: string }) {
  const blocks = text.split(/\n\s*\n/).filter(Boolean);

  return (
    <>
      {blocks.map((block, i) => {
        const lines = block.split("\n").filter(Boolean);
        const isList = lines.length > 0 && lines.every((line) => line.trim().startsWith("- "));

        if (isList) {
          return (
            <ul key={i} className="list-disc space-y-1.5 pl-6">
              {lines.map((line, j) => (
                <li key={j}>{line.trim().slice(2)}</li>
              ))}
            </ul>
          );
        }

        return (
          <p key={i} className="whitespace-pre-line">
            {block}
          </p>
        );
      })}
    </>
  );
}
