export function htmlToMarkdownFromDocs(html: string) {
  const doc = new DOMParser().parseFromString(html, "text/html");

  doc.querySelectorAll("style, meta, link, script").forEach((n) => n.remove());

  const mdForNode = (node: Node): string => {
    if (node.nodeType === Node.TEXT_NODE) {
      return (node as Text).data
        .replace(/\u00a0/g, " ")
        .replace(/\s+/g, (m) => (m.includes("\n") ? "\n" : " "));
    }

    if (node.nodeType !== Node.ELEMENT_NODE) return "";

    const el = node as HTMLElement;
    const tag = el.tagName.toLowerCase();

    const children = () => Array.from(el.childNodes).map(mdForNode).join("");

    switch (tag) {
      case "a": {
        const href = el.getAttribute("href") || "";
        const text = children().trim() || href;
        const safeHref = href.replace(/\)/g, "%29");
        return href ? `[${text}](${safeHref})` : text;
      }
      case "b":
      case "strong":
        return `**${children()}**`;
      case "i":
      case "em":
        return `_${children()}_`;
      case "u":
        return children();
      case "span": {
        let inner = children();
        const style = el.getAttribute("style") || "";
        const isBold = /font-weight:\s*(bold|[7-9]\d{2})/i.test(style);
        const isItalic = /font-style:\s*italic/i.test(style);
        if (isBold) inner = `**${inner}**`;
        if (isItalic) inner = `_${inner}_`;
        return inner;
      }
      case "br":
        return "\n";
      case "p":
      case "div": {
        const content = children().trim();
        return content ? content + "\n\n" : "";
      }
      case "li": {
        const content = children().trim();
        return content ? `- ${content}\n` : "";
      }
      case "ul":
      case "ol": {
        const items = Array.from(el.children)
          .filter((c) => c.tagName.toLowerCase() === "li")
          .map((li) => mdForNode(li))
          .join("");
        return items ? items + "\n" : "";
      }
      default:
        return children();
    }
  };

  let out = mdForNode(doc.body);

  out = out
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]+\n/g, "\n")
    .trimEnd();

  return out;
}
