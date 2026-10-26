import { describe, expect, it, vi } from "vitest";
import { render } from "@testing-library/react";
import { section } from "@/content/sections";
import { BlogFront } from "@/components/blog-front";

/*
 * The blog with nothing in it. No build can show it, because a static export
 * with no posts has no pages to generate for the post route and fails
 * (`AGENTS.md`, on a dynamic route), so the front page is rendered here with
 * the collection emptied and every other export of the module left real.
 */
vi.mock(import("@/content/collections"), async (original) => ({
  ...(await original()),
  allEntries: () => [],
}));

describe("the blog's front page with no posts", () => {
  /*
   * The empty state says there is nothing to subscribe to, and the masthead
   * above it went on offering RSS, Atom and JSON Feed: a control leading
   * nowhere, directly above the sentence saying so (`web.md` 6.1).
   */
  it("says there is nothing to subscribe to and offers no feed", () => {
    const { container } = render(<BlogFront />);
    expect(container.textContent).toContain(section("blog").empty.title);
    expect(container.querySelectorAll(".blog-feed")).toHaveLength(0);
  });
});
