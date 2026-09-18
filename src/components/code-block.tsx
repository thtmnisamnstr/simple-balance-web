import type { ReactNode } from "react";
import { Children, isValidElement } from "react";
import { CopyButton } from "@/components/client/copy-button";

/**
 * A fenced code block, with a copy control.
 *
 * This replaces `<pre>` in the MDX component map, which is why it takes React
 * children rather than a string: by the time MDX reaches here the code has
 * already been through Shiki and is a tree of coloured spans. `textOf` walks
 * that tree to recover what the author actually typed, because copying the
 * highlighted markup would paste colour classes into somebody's terminal.
 *
 * The alternative — asking `rehype-pretty-code` for the raw source through a
 * transformer — works too and couples this component to that plugin's option
 * shape. Walking the children depends only on React.
 */
function textOf(node: ReactNode): string {
  if (typeof node === "string") return node;
  if (typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(textOf).join("");
  if (isValidElement<{ children?: ReactNode }>(node)) return textOf(node.props.children);
  return "";
}

export function CodeBlock({
  children,
  ...rest
}: {
  readonly children?: ReactNode;
  readonly "data-language"?: string;
}) {
  const code = textOf(children);
  const language = rest["data-language"];

  return (
    <div className="code-block">
      <div className="code-block-bar">
        {/* The language is information, not decoration: it tells somebody
            whether they are looking at shell or YAML before they read it. */}
        {language ? <span className="code-language">{language}</span> : <span />}
        <CopyButton code={code} />
      </div>
      <pre {...rest}>{Children.toArray(children)}</pre>
    </div>
  );
}
