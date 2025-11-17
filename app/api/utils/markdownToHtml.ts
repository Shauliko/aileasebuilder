import { remark } from "remark";
import html from "remark-html";

export async function markdownToHtml(md: string) {
  const processed = await remark().use(html).process(md);
  return processed.toString();
}
