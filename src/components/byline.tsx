import { authors, initialsOf, type AuthorKey } from "@/content/authors";
import { formatDate } from "@/lib/format";

/**
 * Who wrote it, and when.
 *
 * Several authors are the normal case rather than an afterthought: the list is
 * rendered as a list, with every photo shown, rather than "Gavin Johnson and 2
 * others". A co-author who is only visible in a tooltip is a co-author who was
 * not credited.
 *
 * A missing photo renders initials rather than a placeholder silhouette. The
 * silhouette says "this person has no face"; initials say "this is who it is",
 * which is the actual job.
 */
export function Byline({
  keys,
  date,
  updated,
  readingMinutes,
}: {
  readonly keys: readonly AuthorKey[];
  readonly date?: string;
  readonly updated?: string;
  readonly readingMinutes?: number;
}) {
  const people = keys.map((key) => ({ key, ...authors[key] }));

  return (
    <div className="byline">
      {people.length > 0 ? (
        <ul className="byline-people">
          {people.map((person) => (
            <li className="byline-person" key={person.key}>
              {person.avatar ? (
                // The alt is empty on purpose: the name is rendered as text
                // immediately beside it, and a photo captioned with the same
                // name reads it twice.
                <img className="avatar" src={person.avatar} alt="" width={36} height={36} />
              ) : (
                <span className="avatar avatar-initials" aria-hidden="true">
                  {initialsOf(person.name)}
                </span>
              )}
              <span className="byline-names">
                {person.url ? (
                  <a className="byline-name" href={person.url}>
                    {person.name}
                  </a>
                ) : (
                  <span className="byline-name">{person.name}</span>
                )}
                {person.title ? <span className="byline-title">{person.title}</span> : null}
              </span>
            </li>
          ))}
        </ul>
      ) : null}

      <p className="entry-meta">
        {date ? <time dateTime={date}>{formatDate(date)}</time> : null}
        {readingMinutes ? (
          <>
            <span aria-hidden="true"> · </span>
            {readingMinutes} min read
          </>
        ) : null}
        {updated ? (
          <>
            <span aria-hidden="true"> · </span>
            {/* Said plainly rather than as a bare second date, which reads as
                a correction nobody explained. */}
            Updated <time dateTime={updated}>{formatDate(updated)}</time>
          </>
        ) : null}
      </p>
    </div>
  );
}
