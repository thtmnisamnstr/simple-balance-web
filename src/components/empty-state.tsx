/**
 * What a section says when it holds nothing.
 *
 * The application's own rule (`web.md` 12.1 there) is that a list
 * distinguishes "nothing yet" from "nothing matches" because the way out of
 * each is opposite. Neither of this site's collections can be filtered, so
 * there is one situation and one message — and the message says plainly that
 * there is nothing to miss, rather than implying the reader has arrived at a
 * broken page.
 */
export function EmptyState({ title, body }: { readonly title: string; readonly body: string }) {
  return (
    <div className="empty-state">
      <p className="empty-title">{title}</p>
      <p className="empty-body">{body}</p>
    </div>
  );
}
