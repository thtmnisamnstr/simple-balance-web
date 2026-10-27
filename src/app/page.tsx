import {
  hero,
  heroShot,
  jobs,
  jobsSection,
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
import { allEntries, entryBySlug } from "@/content/collections";
import { featureIcons, CheckIcon, LogoMark } from "@/components/icons";
import { Shot } from "@/components/shot";
import { SiteStructuredData } from "@/components/structured-data";
import { HeroArt, CorrectionArt } from "@/components/home-art";
import { LearnIntroArt, LearnThumb } from "@/components/learn-art/pieces";
import { LoopStop } from "@/components/loop-stop";
import { css } from "@/components/learn-art/frame";
import { typeset } from "@/lib/typeset";

/** A job's guide, which has to exist: a card linking nowhere fails the build. */
function guideTitle(slug: string): string {
  const entry = entryBySlug("learn", slug);
  if (!entry) throw new Error(`the homepage links a guide that does not exist: /learn/${slug}/`);
  return entry.frontmatter.title;
}

/**
 * The homepage.
 *
 * Section order is an argument, not a layout, and
 * `docs/standards/content.md` 3.2 holds the current one. The short version:
 * the hero says what this is, the screenshot
 * shows it, the jobs say it helps with the thing the reader came for, the
 * proof section makes the one case a competitor cannot copy by writing a
 * sentence, the features answer "does it do the normal things", the
 * assistant is a reason to stay rather than a reason to read on, privacy
 * answers the question a money product always raises, and the plans section
 * is where the reader goes next.
 *
 * **It draws the way /learn draws**, because the two were side by side and
 * the homepage was the plain one. The hero and the closing section are the
 * application's sign-in art panel, the jobs are the learn articles' own
 * pictures, and the motion obeys `web.md` 8.2: the hero, the correction and
 * the chat loop, each with a stop control; a card replays for a rested pointer
 * or builds by scroll on a touch screen; and the closing picture builds by scroll.
 *
 * Every section is a landmark with its own heading, and the headings step
 * h1 -> h2 -> h3 with nothing skipped, because a screen reader's document
 * outline is the only navigation this page has.
 */
export default function HomePage() {
  return (
    <>
      <SiteStructuredData />
      <section className="home-hero" aria-labelledby="hero-title">
        <div className="page home-hero-inner">
          <div>
            <p className="eyebrow">{hero.eyebrow}</p>
            <h1 id="hero-title">{hero.title}</h1>
            <p className="home-hero-lede">{typeset(hero.lede)}</p>
            <div className="hero-actions">
              <a className="button button-primary" href={site.appUrl}>
                {hero.primaryLabel}
              </a>
              <a className="button home-button-ghost" href={site.sourceUrl}>
                {hero.secondaryLabel}
              </a>
            </div>
            <p className="home-hero-note">{typeset(hero.note)}</p>
          </div>
          {/* It loops, building, holding the finished sum about five
              seconds and building again, so it carries a stop. */}
          <div className="mo-loop home-loop">
            <HeroArt />
            <LoopStop />
          </div>
        </div>
      </section>

      {/* The product itself, rising out of the hero: the one picture a
          reader sees before deciding to scroll, so it is the real screen
          rather than a drawing of one, and it carries the disclosure that
          the money in every picture on the page is made up, which
          `content.md` 2.2 requires to sit with the screenshots. */}
      <div className="page home-showcase">
        <figure className="home-showcase-figure">
          <Shot
            name={heroShot.name}
            alt={heroShot.alt}
            width={SHOT_WIDTH}
            height={SHOT_HEIGHT}
            priority
          />
          <figcaption className="shot-caption">{typeset(shotDisclosure)}</figcaption>
        </figure>
      </div>

      <section className="section" aria-labelledby="jobs-title">
        <div className="page">
          <p className="eyebrow">{typeset(jobsSection.eyebrow)}</p>
          <h2 id="jobs-title" className="section-title">
            {typeset(jobsSection.title)}
          </h2>
          <p className="lede">{typeset(jobsSection.lede)}</p>
          <ul className="home-job-grid">
            {jobs.map((job) => (
              <li key={job.guide}>
                {/* One link, the title, stretched over the card by CSS. The
                    picture is not a second link: an empty one fails "every
                    link says where it goes" and a duplicate is a second tab
                    stop to the same place. */}
                <article className="learn-card home-job">
                  <div className="learn-card-art">
                    <LearnThumb slug={job.guide} />
                  </div>
                  <div className="learn-card-body">
                    <h3 className="learn-card-title">
                      <a className="home-job-link" href={`/learn/${job.guide}/`}>
                        {typeset(job.title)}
                      </a>
                    </h3>
                    <p className="learn-card-summary">{typeset(job.body)}</p>
                    <p className="home-job-guide">
                      {jobsSection.guideLabel} {typeset(guideTitle(job.guide))}
                    </p>
                  </div>
                </article>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section" aria-labelledby="proofs-title">
        <div className="page">
          <p className="eyebrow">{proofSection.eyebrow}</p>
          <h2 id="proofs-title" className="section-title">
            {typeset(proofSection.title)}
          </h2>
          <ol className="home-proof-list">
            {proofs.map((entry, index) => (
              <li className="home-proof" key={entry.claim}>
                <div className="home-proof-text">
                  <p className="home-proof-num" aria-hidden="true">
                    {String(index + 1).padStart(2, "0")}
                  </p>
                  <h3 className="proof-claim">{typeset(entry.claim)}</h3>
                  {entry.body.map((paragraph) => (
                    <p className="proof-body" key={paragraph}>
                      {typeset(paragraph)}
                    </p>
                  ))}
                </div>
                {/* The shot sits beside the claim it proves, rather than in a
                    gallery of its own: a screenshot is evidence for a sentence
                    somebody has reason to doubt, and loses that job the moment
                    it is separated from the sentence. The correction has a
                    drawing instead, because you cannot photograph a figure
                    not being overwritten. */}
                <div className="home-proof-media">
                  {entry.shot ? (
                    <figure className="shot-figure">
                      <Shot
                        name={entry.shot.name}
                        alt={entry.shot.alt}
                        width={SHOT_WIDTH}
                        height={SHOT_HEIGHT}
                        span="half"
                      />
                      <figcaption className="shot-caption">
                        {typeset(entry.shot.caption)}
                      </figcaption>
                    </figure>
                  ) : (
                    <div className="mo-loop home-loop">
                      <CorrectionArt />
                      <LoopStop />
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="section home-features" aria-labelledby="features-title">
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
                  <h3>{typeset(feature.title)}</h3>
                  <p>{typeset(feature.body)}</p>
                </article>
              );
            })}
          </div>
          {/* The two screens the cards above describe, under the cards whose
              claims they show. */}
          <div className="showcase">
            {featureShots.map((shot) => (
              <figure className="shot-figure" key={shot.name}>
                <Shot
                  name={shot.name}
                  alt={shot.alt}
                  width={SHOT_WIDTH}
                  height={SHOT_HEIGHT}
                  span="pair"
                />
                <figcaption className="shot-caption">{typeset(shot.caption)}</figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="agents-title">
        <div className="page band-inner">
          <div>
            <p className="eyebrow">{agents.eyebrow}</p>
            <h2 id="agents-title" className="section-title">
              {typeset(agents.title)}
            </h2>
            <p className="prose">{typeset(agents.body)}</p>
          </div>
          {/* An exchange, not a shell session. It rendered `$ ledger:stage`
              once, which told a reader who is not a developer that this page
              was not for them, and then a terminal with "You:" in it, which
              was a conversation dressed as a command line.

              Then the answer arrived the instant the question did, which is
              no chat with a model anybody has had. So it plays as one: the
              question, a moment of thinking, the two tools it calls on
              Simple Balance's MCP server with each one finishing, and the
              answer arriving a word at a time. At rest, and for a reader who
              asked for less motion, it's the finished exchange: the thinking
              indicator and the spinners are only there while it plays. */}
          <div className="mo-loop home-loop home-chat-loop">
            <ol
              className="home-chat"
              aria-label="Asking an assistant when a bill was paid: it looks in Simple Balance, then answers"
            >
              {agents.sample
                .filter((line) => line.kind === "prompt")
                .map((line) => (
                  <li className="home-chat-msg home-chat-you mo mo-chat-you" key={line.text}>
                    <span className="home-chat-who">{agents.you}</span>
                    {typeset(line.text)}
                  </li>
                ))}
              <li className="home-chat-msg home-chat-bot mo mo-chat-bot">
                <span className="home-chat-who">{agents.assistant}</span>
                <span className="home-chat-status">
                  <span className="home-chat-thinking mo" aria-hidden="true">
                    {agents.thinking}
                    <span className="home-chat-dots">
                      {[0, 1, 2].map((dot) => (
                        <span className="home-chat-dot mo" key={dot} style={css({ "--s": dot })} />
                      ))}
                    </span>
                  </span>
                  <span className="home-chat-thought mo">{agents.thought}</span>
                </span>
                <ul className="home-chat-tools">
                  {agents.tools.map((tool, index) => {
                    // The second call starts about a second after the first.
                    const step = css({ "--s": index * 9 });
                    return (
                      <li className="home-chat-tool mo" key={tool} style={step}>
                        <LogoMark size={14} />
                        <span className="home-chat-connector">{agents.connector}</span>
                        <code className="home-chat-tool-name">{tool}</code>
                        <span className="home-chat-tool-state" aria-hidden="true">
                          <span className="home-chat-spin mo" style={step} />
                          <span className="home-chat-done mo" style={step}>
                            <CheckIcon size={14} />
                          </span>
                        </span>
                      </li>
                    );
                  })}
                </ul>
                {agents.sample
                  .filter((line) => line.kind === "out")
                  .reduce<{ text: string; words: { word: string; s: number }[] }[]>(
                    (lines, line) => {
                      const text = typeset(line.text);
                      const first = lines.flatMap((done) => done.words).length;
                      const words = text.split(" ").map((word, at) => ({ word, s: first + at }));
                      return [...lines, { text, words }];
                    },
                    [],
                  )
                  .map(({ text, words }) => (
                    // Streamed a word at a time, which a screen reader would
                    // hear as a word at a time too, so it reads the line whole
                    // and the words are only drawn.
                    <span className="home-chat-line" key={text}>
                      <span className="visually-hidden">{text}</span>
                      <span aria-hidden="true">
                        {words.map(({ word, s: step }) => (
                          <span
                            className="home-chat-word mo"
                            key={step}
                            style={css({ "--s": step })}
                          >
                            {`${word} `}
                          </span>
                        ))}
                      </span>
                    </span>
                  ))}
              </li>
            </ol>
            <LoopStop />
          </div>
        </div>
      </section>

      <section className="section band" aria-labelledby="privacy-title">
        <div className="page band-inner home-privacy">
          <div>
            <p className="eyebrow">{privacy.eyebrow}</p>
            <h2 id="privacy-title" className="section-title">
              {typeset(privacy.title)}
            </h2>
            <p className="prose">{typeset(privacy.body)}</p>
          </div>
          <ul className="checklist home-privacy-list">
            {privacy.points.map((point) => (
              <li key={point}>
                <span className="check" aria-hidden="true">
                  <CheckIcon size={18} />
                </span>
                <span>{typeset(point)}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* The page used to end on privacy, which is a good last impression and
          a bad last sentence: every reason to trust the product and no reason
          to find out what it costs. It ends on the plans, drawn as /learn's
          own intro is, with every guide's mark around the logo. */}
      <section className="section" aria-labelledby="plans-title">
        <div className="page">
          <div className="art-panel home-closing">
            <div className="home-closing-text">
              <p className="eyebrow">{plans.eyebrow}</p>
              <h2 id="plans-title" className="section-title">
                {typeset(plans.title)}
              </h2>
              <p className="prose">{typeset(plans.body)}</p>
              <p className="hero-actions">
                <a className="button button-primary" href={site.appUrl}>
                  {hero.primaryLabel}
                </a>
                <a className="button home-button-ghost" href={plans.ctaHref}>
                  {plans.ctaLabel}
                </a>
              </p>
            </div>
            <div className="home-closing-art">
              <LearnIntroArt slugs={allEntries("learn").map((entry) => entry.slug)} />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
