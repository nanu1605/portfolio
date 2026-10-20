// Gives each `##` heading in a case study an id and exports the list as
// `headings`, for the sticky TOC (§8.4), and names each table after the
// section it's in (its scroll region needs a label). Plain .mjs, because
// Turbopack passes remark plugins to the MDX loader as a name or a path,
// never as a function.

const textOf = (node) =>
  "value" in node ? node.value : (node.children ?? []).map(textOf).join("");

export const slug = (text) =>
  text
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const literal = (value) => ({ type: "Literal", value });
const property = (key, value) => ({
  type: "Property",
  kind: "init",
  method: false,
  shorthand: false,
  computed: false,
  key: { type: "Identifier", name: key },
  value: literal(value),
});

export default function remarkHeadings() {
  return (tree) => {
    const headings = [];
    for (const node of tree.children) {
      if (node.type === "table" && headings.length > 0)
        node.data = { hProperties: { "data-label": headings.at(-1).text } };
      if (node.type !== "heading" || node.depth !== 2) continue;
      const text = textOf(node);
      const id = slug(text);
      node.data = { ...node.data, hProperties: { id } };
      headings.push({ id, text });
    }
    // export const headings = [{ id, text }, …]
    tree.children.push({
      type: "mdxjsEsm",
      value: "",
      data: {
        estree: {
          type: "Program",
          sourceType: "module",
          body: [
            {
              type: "ExportNamedDeclaration",
              specifiers: [],
              source: null,
              declaration: {
                type: "VariableDeclaration",
                kind: "const",
                declarations: [
                  {
                    type: "VariableDeclarator",
                    id: { type: "Identifier", name: "headings" },
                    init: {
                      type: "ArrayExpression",
                      elements: headings.map((h) => ({
                        type: "ObjectExpression",
                        properties: [
                          property("id", h.id),
                          property("text", h.text),
                        ],
                      })),
                    },
                  },
                ],
              },
            },
          ],
        },
      },
    });
  };
}
