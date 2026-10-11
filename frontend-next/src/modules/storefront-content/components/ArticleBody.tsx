import Image from "next/image";
import { getOptimizedImageUrl } from "@/lib/cloudinary";
import type { UserBlogBlock } from "@/modules/blog/types/blog.type";
import { ArticleProducts } from "./ArticleExtras";

const H2 = "mb-0 mt-3.5 text-balance break-words font-display text-[32px] font-semibold leading-[1.15] text-ka-green";

/** Renders an article's blocks in the Journal's typography - the admin never controls styling, only content and order. */
export default function ArticleBody({ blocks }: { blocks: UserBlogBlock[] }) {
  return (
    <>
      {blocks.map((block, i) => {
        switch (block.type) {
          case "paragraph":
            return (
              <p key={i} className="m-0 whitespace-pre-line text-pretty break-words">
                {block.text}
              </p>
            );
          case "heading":
            return (
              <h2 key={i} className={H2}>
                {block.text}
              </h2>
            );
          case "list":
            return (
              <ul key={i} className="m-0 flex list-disc flex-col gap-2.5 pl-[22px]">
                {block.items.map((item, j) => (
                  <li key={j} className="break-words">
                    {item}
                  </li>
                ))}
              </ul>
            );
          case "quote":
            return (
              <blockquote key={i} className="my-3.5 border-l-2 border-ka-gold py-2 pl-7 font-display text-[clamp(24px,3vw,28px)] italic leading-[1.35] text-ka-green">
                &ldquo;{block.text}&rdquo;
              </blockquote>
            );
          case "image":
            return (
              <figure key={i} className="m-0 my-2 flex flex-col gap-2.5">
                <span className="relative block aspect-[3/2] w-full overflow-hidden rounded-xl bg-ka-sand">
                  <Image src={getOptimizedImageUrl(block.image.url, 1400, 934)} alt={block.caption} fill sizes="(max-width: 780px) 100vw, 700px" className="object-cover" />
                </span>
                {block.caption && <figcaption className="text-center text-[13.5px] italic leading-normal text-ka-muted">{block.caption}</figcaption>}
              </figure>
            );
          case "products":
            return <ArticleProducts key={i} products={block.products} />;
        }
      })}
    </>
  );
}
