import {
  hero,
  heroShot,
  proofs,
  proofSection,
  features,
  featuresSection,
  featureShots,
  plans,
  privacy,
  agents,
  site,
  shotDisclosure,
  SHOT_WIDTH,
  SHOT_HEIGHT,
} from "@/content/home";
import { featureIcons, CheckIcon } from "@/components/icons";
import { Shot } from "@/components/shot";
import { SiteStructuredData } from "@/components/structured-data";
import { AdBanner } from "@/components/ad-banner";

/**
 * The homepage.
 *
 * Section order is an argument, not a layout, and
 * `docs/standards/content.md` 3.2 holds the current one. The short version:
 * the hero says what this is, the proof section makes the one case a
 * competitor cannot copy by writing a sentence, the features answer "does it
 * do the normal things", the assistant is a reason to stay rather than a
 * reason to read on, privacy answers the question a money product always
 * raises, and the plans section is where the reader goes next.
 *
 * The assistant has been last, first and third. It is fourth because the
 * capability stopped being distinctive: PocketSmith ships the same idea down
 * to the permission levels, so a page that spends its third section on it is
 * spending it on a tie.
 *
 * Every section is a landmark with its own heading, and the headings step
 * h1 -> h2 -> h3 with nothing skipped, because a screen reader's document
 * outline is the only navigation this page has.
 */
export default function HomePage() {
  return (
    <>
      <SiteStructuredData />
      <section className="hero" aria-labelledby="hero-title">
        <div className="page hero-inner">
          <div>
            <h1 id="hero-title">{hero.title}</h1>
            <p className="hero-lede">{hero.lede}</p>
            <div className="hero-actions">
              <span className="button button-pending">{hero.primaryLabel}</span>
              <a className="button button-primary" href={site.sourceUrl}>
                {hero.secondaryLabel}
              </a>
            </div>
            <p className="hero-note">{hero.note}</p>
          </div>
          <Shot
            name={heroShot.name}
            alt={heroShot.alt}
            width={SHOT_WIDTH}
            height={SHOT_HEIGHT}
            priority
            span="half"
          />
        </div>
      </section>

      <section className="section" aria-labelledby="proofs-title">
        <div className="page">
          <p className="eyebrow">{proofSection.eyebrow}</p>
          <h2 id="proofs-title" className="section-title">
            {proofSection.title}
          </h2>
          <div className="proofs">
            {proofs.map((entry) => (
              <article className="proof" key={entry.claim}>
                <h3 className="proof-claim">{entry.claim}</h3>
                <div>
                  {entry.body.map((paragraph) => (
                    <p className="proof-body" key={paragraph}>
                      {paragraph}
                    </p>
                  ))}
                </div>
                {/* The shot sits inside the card whose claim it proves, rather
                    than in a gallery of its own: a screenshot is evidence for a
                    sentence somebody has reason to doubt, and loses that job the
                    moment it is separated from the sentence. */}
                {entry.shot ? (
                  <figure className="shot-figure proof-shot">
                    <Shot
                      name={entry.shot.name}
                      alt={entry.shot.alt}
                      width={SHOT_WIDTH}
                      height={SHOT_HEIGHT}
                    />
                    <figcaption className="shot-caption">{entry.shot.caption}</figcaption>
                  </figure>
                ) : null}
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="features-title">
        <div className="page">
          <p className="eyebrow">{featuresSection.eyebrow}</p>
          <h2 id="features-title" className="section-title">
            {featuresSection.title}
          </h2>
          <div className="grid">
            {features.map((feature) => {
              const Icon = featureIcons[feature.icon];
              return (
                <article className="card" key={feature.title}>
                  <span className="card-icon">
                    <Icon />
                  </span>
                  <h3>{feature.title}</h3>
                  <p>{feature.body}</p>
                </article>
              );
            })}
          </div>
          {/* The two screens the cards above describe, and the disclosure that
              the money in them is invented, which `content.md` 2.2 requires to
              sit with the screenshots rather than in a footer nobody reaches. */}
          <div className="showcase">
            {featureShots.map((shot) => (
              <figure className="shot-figure" key={shot.name}>
                <Shot
                  name={shot.name}
                  alt={shot.alt}
                  width={SHOT_WIDTH}
                  height={SHOT_HEIGHT}
                  span="half"
                />
                <figcaption className="shot-caption">{shot.caption}</figcaption>
              </figure>
            ))}
          </div>
          <p className="shot-caption shot-disclosure">{shotDisclosure}</p>
        </div>
      </section>

      <section className="section" aria-labelledby="agents-title">
        <div className="page band-inner">
          <div>
            <p className="eyebrow">{agents.eyebrow}</p>
            <h2 id="agents-title" className="section-title">
              {agents.title}
            </h2>
            <p className="prose">{agents.body}</p>
          </div>
          {/* An exchange, not a shell session. It used to render `$ ledger:stage`
              and the name of a CSV file, which told a reader who is not a
              developer that this page was not for them — and the thing being
              shown is a conversation with an assistant, not a command. */}
          <pre
            className="terminal"
            aria-label="Asking an assistant when a bill was paid, and the answer it gives"
          >
            <code>
              {agents.sample.map((line) => (
                <span key={line.text} className={line.kind === "out" ? undefined : line.kind}>
                  {line.kind === "prompt" ? `You: ${line.text}` : line.text}
                  {"\n"}
                </span>
              ))}
            </code>
          </pre>
        </div>
      </section>

      <section className="section band" aria-labelledby="privacy-title">
        <div className="page band-inner">
          <div>
            <p className="eyebrow">{privacy.eyebrow}</p>
            <h2 id="privacy-title" className="section-title">
              {privacy.title}
            </h2>
            <p className="prose">{privacy.body}</p>
          </div>
          <ul className="checklist">
            {privacy.points.map((point) => (
              <li key={point}>
                <span className="check" aria-hidden="true">
                  <CheckIcon size={18} />
                </span>
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* The page used to end on privacy, which is a good last impression and
          a bad last sentence: every reason to trust the product and no reason
          to find out what it costs. */}
      <section className="section" aria-labelledby="plans-title">
        <div className="page">
          <p className="eyebrow">{plans.eyebrow}</p>
          <h2 id="plans-title" className="section-title">
            {plans.title}
          </h2>
          <p className="prose">{plans.body}</p>
          <p className="hero-actions">
            <a className="button button-primary" href={plans.ctaHref}>
              {plans.ctaLabel}
            </a>
          </p>
        </div>
      </section>

      <div className="page">
        <AdBanner />
      </div>
    </>
  );
}
