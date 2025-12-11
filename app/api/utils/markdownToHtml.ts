import { remark } from "remark";
import html from "remark-html";

// NOTE: remark-html encodes &, <, >. We must decode them for clean PDF output.
function decodeHtmlEntities(str: string) {
  return str
    .replace(/&#x26;/g, "&")   // fix & -> &#x26;
    .replace(/&amp;/g, "&")   // fix &amp; -> &
    .replace(/&#38;/g, "&")   // numeric alternative
    .replace(/&#x3C;/g, "<")  // < 
    .replace(/&lt;/g, "<")    
    .replace(/&#x3E;/g, ">")  // >
    .replace(/&gt;/g, ">");  
}

export async function markdownToHtml(md: string) {
  const processed = await remark().use(html).process(md);
  let htmlStr = processed.toString();

  // decode entities before sending to the PDF generator
  htmlStr = decodeHtmlEntities(htmlStr);

  return htmlStr;
}
