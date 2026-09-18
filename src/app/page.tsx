import {
  hero,
  heroShot,
  problems,
  features,
  showcase,
  privacy,
  agents,
  site,
  shotDisclosure,
  SHOT_WIDTH,
  SHOT_HEIGHT,
} from "@/content/home";
import { featureIcons, CheckIcon } from "@/components/icons";
import { Shot } from "@/components/shot";

/**
 * The homepage.
 *
 * Section order is an argument, not a layout: the reader arrives not knowing
 * what this is, so the hero says what it is, the problems say why they would
 * want it, the features say what else is in the box, self-hosting answers the
 * question a finance product always raises, and agents is the one thing here
 * nothing else does. Reordering it is fine; doing so without a reason is what
 * `docs/standards/content.md` 3.2 is about.
 *
 * Every section is a landmark with its own heading, and the headings step
 * h1 -> h2 -> h3 with nothing skipped, because a screen reader's document
 * outline is the only navigation this page has.
 */
export default function HomePage() {
  return (
    <>
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
          />
        </div>
      </section>

      <section className="section" aria-labelledby="problems-title">
        <div className="page">
          <p className="eyebrow">Why bother</p>
          <h2 id="problems-title" className="section-title">
            Four things that are true of almost every other way of doing this.
          </h2>
          <div className="problems">
            {problems.map((entry) => (
              <article className="problem" key={entry.problem}>
                <h3 className="problem-q">{entry.problem}</h3>
                <div>
                  {entry.answer.map((paragraph) => (
                    <p className="problem-a" key={paragraph}>
                      {paragraph}
                    </p>
                  ))}
                </div>
                {entry.shot ? (
                  <figure className="shot-figure problem-shot">
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

      <section className="section" aria-labelledby="showcase-title">
        <div className="page">
          <p className="eyebrow">{showcase.eyebrow}</p>
          <h2 id="showcase-title" className="section-title">
            {showcase.title}
          </h2>
          <div className="showcase">
            {showcase.shots.map((shot) => (
              <figure className="shot-figure" key={shot.name}>
                <Shot name={shot.name} alt={shot.alt} width={SHOT_WIDTH} height={SHOT_HEIGHT} />
                <figcaption className="shot-caption">{shot.caption}</figcaption>
              </figure>
            ))}
          </div>
          <p className="shot-caption shot-disclosure">{shotDisclosure}</p>
        </div>
      </section>

      <section className="section" aria-labelledby="features-title">
        <div className="page">
          <p className="eyebrow">What else is in it</p>
          <h2 id="features-title" className="section-title">
            The parts you only notice when they are missing.
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

      <section className="section" aria-labelledby="agents-title">
        <div className="page band-inner">
          <div>
            <p className="eyebrow">{agents.eyebrow}</p>
            <h2 id="agents-title" className="section-title">
              {agents.title}
            </h2>
            <p className="prose">{agents.body}</p>
          </div>
          <pre className="terminal" aria-label="An agent staging rows for review">
            <code>
              {agents.sample.map((line) => (
                <span key={line.text} className={line.kind === "out" ? undefined : line.kind}>
                  {line.kind === "prompt" ? `$ ${line.text}` : line.text}
                  {"\n"}
                </span>
              ))}
            </code>
          </pre>
        </div>
      </section>
    </>
  );
}
