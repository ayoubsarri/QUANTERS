import fs from "fs";

let content = fs.readFileSync("src/app/admin/explore/page.tsx", "utf8").replace(/\r\n/g, "\n");

// 1. Expand the formatting toolbar
const toolbarTarget = `                    <div className="flex flex-wrap items-center gap-1">
                      <button
                        type="button"
                        onClick={() => insertMarkdownHelper("\\n## Section Headline\\n")}
                        className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono text-[10px] font-bold cursor-pointer"
                        title="Heading 2"
                      >
                        H2
                      </button>
                      <button
                        type="button"
                        onClick={() => insertMarkdownHelper("\\n### Sub-heading\\n")}
                        className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono text-[10px] cursor-pointer"
                        title="Heading 3"
                      >
                        H3
                      </button>
                      <button
                        type="button"
                        onClick={() => insertMarkdownHelper("\\n> Key pull-quote or finding statement\\n")}
                        className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono text-[10px] cursor-pointer"
                        title="Quote Block"
                      >
                        &gt; Quote
                      </button>
                      <button
                        type="button"
                        onClick={() => insertMarkdownHelper("\\n- Scientific insight point\\n- Secondary observation")}
                        className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono text-[10px] cursor-pointer"
                        title="Bullet List"
                      >
                        • Bullets
                      </button>
                      <button
                        type="button"
                        onClick={() => insertMarkdownHelper("\\n--- \\n")}
                        className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono text-[10px] cursor-pointer"
                        title="Divider"
                      >
                        --- Divider
                      </button>`;

const toolbarRepl = `                    <div className="flex flex-wrap items-center gap-1">
                      <button
                        type="button"
                        onClick={() => insertMarkdownHelper("\\n## Section Headline\\n")}
                        className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono text-[10px] font-bold cursor-pointer"
                        title="Heading 2"
                      >
                        H2
                      </button>
                      <button
                        type="button"
                        onClick={() => insertMarkdownHelper("\\n### Sub-heading\\n")}
                        className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono text-[10px] cursor-pointer"
                        title="Heading 3"
                      >
                        H3
                      </button>
                      <button
                        type="button"
                        onClick={() => insertMarkdownHelper("**", "**")}
                        className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-800 font-mono text-[10px] font-bold cursor-pointer"
                        title="Bold Text"
                      >
                        B
                      </button>
                      <button
                        type="button"
                        onClick={() => insertMarkdownHelper("*", "*")}
                        className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-800 font-mono text-[10px] italic cursor-pointer"
                        title="Italic Text"
                      >
                        I
                      </button>
                      <button
                        type="button"
                        onClick={() => insertMarkdownHelper("\\n> Key pull-quote or finding statement\\n")}
                        className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono text-[10px] cursor-pointer"
                        title="Quote Block"
                      >
                        &gt; Quote
                      </button>
                      <button
                        type="button"
                        onClick={() => insertMarkdownHelper("\\n- Scientific insight point\\n- Secondary observation\\n")}
                        className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono text-[10px] cursor-pointer"
                        title="Bullet List"
                      >
                        • Bullets
                      </button>
                      <button
                        type="button"
                        onClick={() => insertMarkdownHelper("\\n\`\`\`python\\n# Scientific computational routine\\n\`\`\`\\n")}
                        className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono text-[10px] cursor-pointer"
                        title="Code Block"
                      >
                        &lt;/&gt; Code
                      </button>
                      <button
                        type="button"
                        onClick={() => insertMarkdownHelper(" [Reference Source](https://...) ")}
                        className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono text-[10px] cursor-pointer"
                        title="Hyperlink"
                      >
                        🔗 Link
                      </button>
                      <button
                        type="button"
                        onClick={() => insertMarkdownHelper("\\n--- \\n")}
                        className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono text-[10px] cursor-pointer"
                        title="Divider"
                      >
                        ---
                      </button>`;

if (content.includes(toolbarTarget)) {
  content = content.replace(toolbarTarget, toolbarRepl);
  console.log("Updated markdown editor toolbar");
}

// 2. Increase textarea rows from 11 to 16
content = content.replace("rows={11}", "rows={16}");

fs.writeFileSync("src/app/admin/explore/page.tsx", content);
console.log("Updated admin explore markdown studio");
