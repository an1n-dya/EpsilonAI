import type { Reply } from "./types";

/**
 * Epsilon has no model behind it in this build. These are hand-written
 * answers for the suggested prompts, so the interface can be shown doing its
 * full job; anything else gets an honest "not connected" reply.
 *
 * `[^n]` in the text cites `sources[n - 1]`.
 */

export type Suggestion = { label: string; prompt: string };

type Canned = Reply & { match: RegExp; suggestion?: Suggestion };

const FENCE = "```";

const BRAIN: Canned = {
  match:
    /\b(10|ten)\s*(%|percent|per cent).*\bbrains?\b|\bbrains?\b.*\b(10|ten)\s*(%|percent|per cent)/i,
  suggestion: { label: "Myth check", prompt: "Is it true we only use 10% of our brains?" },
  confidence: 0.97,
  reasoning: [
    "Restate the claim: only 10% of the brain is in use",
    "Check imaging evidence (fMRI, PET)",
    "Check what brain damage tells us",
    "Trace where the myth came from",
  ],
  sources: [
    {
      title: "Ten percent of the brain myth — Wikipedia",
      url: "https://en.wikipedia.org/wiki/Ten_percent_of_the_brain_myth",
    },
    {
      title: "Do people only use 10 percent of their brains? — Scientific American",
      url: "https://www.scientificamerican.com/article/do-people-only-use-10-percent-of-their-brains/",
    },
  ],
  content: `**No — it's a myth.** You use virtually all of your brain, just not all of it at the same moment.[^1]

### What the evidence shows
- **Imaging.** fMRI and PET scans show activity across essentially every region over the course of a day, even during sleep.[^1]
- **Damage.** Injury to almost any area of the brain produces some deficit. If 90% sat idle, most strokes would be harmless.[^2]
- **Energy.** The brain is about 2% of body mass but uses roughly 20% of the body's energy. Evolution doesn't keep that much expensive tissue doing nothing.

### Where the myth came from
It's usually traced to early-1900s remarks by psychologists such as William James, who wrote that people use only a fraction of their *mental potential* — a point about effort, not anatomy. Self-help writers did the rest.[^1]`,
};

const DEBOUNCE: Canned = {
  match: /\bdebounc/i,
  suggestion: { label: "Code", prompt: "Write a debounce function in TypeScript" },
  confidence: 0.93,
  reasoning: [
    "Pin down the semantics: trailing-edge debounce",
    "Keep arguments typed end to end",
    "Add cancel() and flush() for clean-up",
    "Note the timer-clamping caveat",
  ],
  sources: [
    {
      title: "setTimeout() — MDN Web Docs",
      url: "https://developer.mozilla.org/en-US/docs/Web/API/Window/setTimeout",
    },
  ],
  content: `Here's a small, typed \`debounce\` that also lets you cancel or flush a pending call.

${FENCE}ts
export function debounce<A extends unknown[]>(
  fn: (...args: A) => void,
  wait = 200,
) {
  let timer: ReturnType<typeof setTimeout> | undefined;
  let lastArgs: A | undefined;

  const debounced = (...args: A) => {
    lastArgs = args;
    clearTimeout(timer);
    timer = setTimeout(() => {
      timer = undefined;
      fn(...args);
    }, wait);
  };

  debounced.cancel = () => {
    clearTimeout(timer);
    timer = undefined;
  };

  debounced.flush = () => {
    if (timer === undefined || !lastArgs) return;
    debounced.cancel();
    fn(...lastArgs);
  };

  return debounced;
}
${FENCE}

### Using it
${FENCE}ts
const save = debounce((text: string) => api.saveDraft(text), 500);

input.addEventListener("input", (e) => save((e.target as HTMLInputElement).value));
window.addEventListener("beforeunload", () => save.flush());
${FENCE}

### Worth knowing
- Only the **last** call in a burst runs, after \`wait\` ms of quiet. If the first call should fire immediately too, you want a *leading-edge* debounce — or a throttle.
- \`setTimeout\` delays are minimums, not promises: browsers clamp timers in background tabs.[^1]
- In React, create the debounced function once (\`useMemo\` or \`useRef\`) and call \`cancel()\` when the component unmounts.`,
};

const DATABASE: Canned = {
  match: /\bsqlite\b.*\bpostgres|\bpostgres(ql)?\b.*\bsqlite\b|\b(which|what) database\b/i,
  suggestion: { label: "Trade-off", prompt: "SQLite or Postgres for a side project?" },
  confidence: 0.78,
  reasoning: [
    "Identify what decides it: concurrency, hosting, features",
    "Compare how each handles writes",
    "Check SQLite's own guidance on when to use it",
    "Flag the unknowns that would change the answer",
  ],
  sources: [
    {
      title: "Appropriate uses for SQLite — sqlite.org",
      url: "https://www.sqlite.org/whentouse.html",
    },
    { title: "PostgreSQL documentation", url: "https://www.postgresql.org/docs/current/" },
  ],
  content: `**For most side projects, start with SQLite.** Move to Postgres when you hit a specific limit, not in anticipation of one.

| | SQLite | Postgres |
|---|---|---|
| Setup | One file, no server | A server to run and back up |
| Concurrent writes | One writer at a time | Many, with row-level locking |
| Best fit | One app server, modest writes | Several app servers, heavy writes |
| Extras | Tiny, embedded, trivial to copy | JSONB, full-text search, extensions such as PostGIS |

### Pick Postgres from day one if…
- several processes or machines will write to the database at once,
- you need something SQLite lacks, like PostGIS or fine-grained roles, or
- your host offers managed Postgres and nothing else that persists.

### Why SQLite is a sensible default
SQLite's own guidance is that it handles most low-to-medium traffic websites well, and backing up is copying a file.[^1] Postgres earns its setup cost once you need many concurrent writers or its extensions.[^2]

My confidence is lower than usual because the right call depends on things I don't know yet: your host, your traffic, and whether you'll ever run more than one server.`,
};

const LIMITS: Canned = {
  match: /\bepsilon\b.*\bdelta\b|\bdelta\b.*\bepsilon\b|ε.*δ|\blimits?\b.*\b(calculus|programmer)/i,
  suggestion: { label: "Concept", prompt: "Explain epsilon–delta limits to a programmer" },
  confidence: 0.96,
  reasoning: [
    "State the formal definition",
    "Map ε and δ onto output and input tolerances",
    "Work a concrete example: f(x) = 2x + 1",
    "Call out the common misreadings",
  ],
  sources: [
    {
      title: "(ε, δ)-definition of limit — Wikipedia",
      url: "https://en.wikipedia.org/wiki/(%CE%B5,_%CE%B4)-definition_of_limit",
    },
    {
      title: "The Definition of the Limit — Paul's Online Notes",
      url: "https://tutorial.math.lamar.edu/Classes/CalcI/DefnOfLimit.aspx",
    },
  ],
  content: `Think of it as **a contract with a tolerance check**.

"The limit of *f(x)* as *x → a* is *L*" means: whatever error tolerance **ε** you demand on the output, I can hand back an input tolerance **δ** that guarantees it.[^1]

${FENCE}text
for every ε > 0
  there exists δ > 0 such that
    0 < |x − a| < δ   ⟹   |f(x) − L| < ε
${FENCE}

### The programmer's version
Picture a test an adversary gets to parameterise:

${FENCE}ts
// f(x) = 2x + 1, approaching a = 3, claimed limit L = 7.
// The adversary picks any tolerance on the output…
function proveLimit(epsilon: number): number {
  // …and you must return an input tolerance that always works.
  return epsilon / 2;
}
${FENCE}

Since |f(x) − 7| = 2·|x − 3|, keeping |x − 3| below ε/2 keeps the output error below ε, every time. The limit exists exactly when you can write \`proveLimit\` for **every** ε, however small.[^2]

### Two details people miss
- **0 < |x − a|** excludes the point itself. A limit is about approaching *a*; *f(a)* might not even be defined.
- **δ may depend on ε** (it usually does), but never on the particular *x*.

Which is where this assistant gets its name: ε is the smallest error you're willing to tolerate.`,
};

const WEATHER: Canned = {
  match: /\b(rain|weather|forecast|snow|sunny)\b/i,
  suggestion: { label: "Unknowable", prompt: "Will it rain on my birthday next year?" },
  confidence: 0.22,
  reasoning: [
    "Notice this asks for a forecast a year out",
    "Check the limits of forecast skill",
    "Offer what can be known: climatology",
    "Lower confidence and say so plainly",
  ],
  sources: [
    {
      title: "Weather forecasting — Wikipedia",
      url: "https://en.wikipedia.org/wiki/Weather_forecasting",
    },
    { title: "Forecasts — ECMWF", url: "https://www.ecmwf.int/en/forecasts" },
  ],
  content: `**Nobody can tell you that yet — me included.**

Day-to-day weather is chaotic: small errors in today's measurements grow until, after roughly two weeks, a forecast is no better than going by the calendar.[^1] A year out, the honest answer isn't a forecast at all.

### What you *can* know
- **Climatology.** How often it has rained on that week in your city over the past few decades. If it's 30%, that's your best estimate.
- **Seasonal outlooks.** A few months ahead, forecasting centres publish whether a season looks wetter or drier than usual.[^2] They nudge the odds; they don't name days.
- **A real forecast.** Check again about ten days out. Reliability improves sharply inside a week.

So: plan around the historical odds, and keep a backup for the day itself.`,
};

const ABOUT: Canned = {
  match: /\b(who|what) are you\b|\bwhat can you do\b|\babout (you|epsilon)\b|\bhow do you work\b/i,
  confidence: null,
  reasoning: [],
  sources: [],
  content: `I'm **Epsilon**, an assistant built around one idea: an answer is only as useful as your ability to check it.

So every reply comes with three things:
1. **Reasoning** you can expand, step by step.
2. **Sources**, cited next to the claims they support.
3. **Confidence**: a percentage and a margin of error (ε), with wording to match.

This build is a front-end preview. The interface is real, but answers are simulated in your browser, and nothing you type leaves this device.`,
};

const GREETING: Canned = {
  match: /^\s*(hi|hey|hello|hiya|yo|good (morning|afternoon|evening))\b[\s!.]*$/i,
  confidence: null,
  reasoning: [],
  sources: [],
  content:
    "Hi! What would you like to check? Ask anything — or try one of the sample questions to see a complete answer, with sources and a confidence score.",
};

const THANKS: Canned = {
  match: /^\s*(thanks|thank you|thx|ty|cheers)\b/i,
  confidence: null,
  reasoning: [],
  sources: [],
  content: "Any time.",
};

const FALLBACK: Reply = {
  confidence: null,
  reasoning: ["Look for a connected model", "None found: say so instead of guessing"],
  sources: [],
  content: `**This is a preview build, so there's no model behind me yet.**

I can't give you a real answer to that — and Epsilon's whole point is not pretending. Once a model is connected, this is where you'd get:

- a direct answer first, then the reasoning behind it,
- citations beside the claims they support, and
- a confidence score with its margin of error.

Until then, the sample questions show a complete answer from end to end.`,
};

const CANNED: Canned[] = [GREETING, THANKS, ABOUT, BRAIN, DEBOUNCE, DATABASE, LIMITS, WEATHER];

export const SUGGESTIONS: Suggestion[] = CANNED.flatMap((c) =>
  c.suggestion ? [c.suggestion] : [],
);

export function replyTo(prompt: string): Reply {
  const hit = CANNED.find((c) => c.match.test(prompt));
  if (!hit) return FALLBACK;
  const { match: _m, suggestion: _s, ...reply } = hit;
  return reply;
}
