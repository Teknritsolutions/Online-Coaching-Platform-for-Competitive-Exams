const hints = {
  "contact-name": "Enter your full name",
  "full-name": "Enter your full name",
  "contact-email": "you@example.com",
  email: "you@example.com",
  password: "Enter your password",
  "confirm-password": "Re-enter your password",
  "contact-message": "Tell us your exam goal and how we can help…",
  "lesson-notes": "Add lesson notes, examples, and revision tips…",
  "resource-search": "Search by resource title or topic…",
};
function placeholderFor(id, type, label = "") {
  if (hints[id]) return hints[id];
  if (type === "email") return "you@example.com";
  if (type === "tel") return "Enter your phone number";
  if (type === "url") return "https://example.com";
  if (type === "password") return "Enter your password";
  if (type === "search")
    return `Search ${label.toLowerCase().replace(/^search\s*/, "") || "by keyword"}…`;
  if (type === "number") return `Enter ${label.toLowerCase() || "a number"}`;
  return `Enter ${label.toLowerCase() || "your response"}`;
}
export function withFormPlaceholders(html) {
  return html.replace(/<(input|textarea)\b[^>]*>/g, (tag, kind) => {
    if (/\bplaceholder=/.test(tag)) return tag;
    const attr = (name) => tag.match(new RegExp(`\\b${name}="([^"]*)"`))?.[1] || "";
    const type = attr("type") || "text";
    if (
      kind === "input" &&
      !["text", "email", "tel", "url", "password", "search", "number"].includes(type)
    )
      return tag;
    const id = attr("id");
    const label =
      html.match(new RegExp(`<label[^>]*for="${id}"[^>]*>([^<]+)`))?.[1]?.trim() ||
      attr("name").replaceAll("-", " ");
    let hint = placeholderFor(id, type, label);
    if (id === "password" && /new-password/.test(tag))
      hint = "Create a password (8+ characters, a letter and a number)";
    return tag.replace(
      />$/,
      ` placeholder="${hint.replaceAll("&", "&amp;").replaceAll('"', "&quot;")}">`,
    );
  });
}
export function refreshFormPlaceholders(root = document) {
  const fields = [
    ...(root.matches?.("input,textarea") ? [root] : []),
    ...root.querySelectorAll("input,textarea"),
  ];
  for (const field of fields) {
    if (field.hasAttribute("placeholder")) continue;
    const type = field.type || "text";
    if (
      field.tagName === "INPUT" &&
      !["text", "email", "tel", "url", "password", "search", "number"].includes(type)
    )
      continue;
    const label = field.labels?.[0]?.textContent.trim() || field.name.replaceAll("-", " ");
    field.placeholder = placeholderFor(field.id, type, label);
  }
}
