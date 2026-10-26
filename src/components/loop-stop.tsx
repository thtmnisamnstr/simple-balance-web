import { motion } from "@/content/home";

/**
 * The control that stops a looping drawing, and the reason one can loop at
 * all (`web.md` 8.2).
 *
 * A native checkbox, so it needs no script, works before anything hydrates,
 * and tells a screen reader its state without an ARIA pattern to get wrong.
 * The stylesheet does the rest: `.mo-loop:has(.mo-stop-input:checked) .mo`
 * stops every part where it rests, which is the finished picture. It sits
 * beside the drawing rather than inside it, because the drawing is hidden
 * from assistive technology and the control must not be.
 */
export function LoopStop() {
  return (
    <label className="mo-stop">
      <input className="mo-stop-input" type="checkbox" />
      <span>{motion.stop}</span>
    </label>
  );
}
