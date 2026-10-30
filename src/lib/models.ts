export type ModelId = "e1" | "e2" | "e3";

export type Model = {
  id: ModelId;
  name: string;
  nick: string;
  blurb: string;
  /** Relative, 1–5. */
  speed: number;
  depth: number;
  sourcing: number;
  bestFor: string[];
  /** How the simulated engine behaves for this model. */
  sim: { thinkMs: number; charsPerSecond: number; showsReasoning: boolean };
};

export const MODELS: Model[] = [
  {
    id: "e1",
    name: "E1",
    nick: "Swift",
    blurb: "Answers first, footnotes after. For quick facts, rewrites and small snippets.",
    speed: 5,
    depth: 2,
    sourcing: 2,
    bestFor: [
      "Definitions and quick facts",
      "Rewriting and tightening text",
      "One-function code snippets",
    ],
    sim: { thinkMs: 380, charsPerSecond: 420, showsReasoning: false },
  },
  {
    id: "e2",
    name: "E2",
    nick: "Balanced",
    blurb: "The everyday default. Checks its claims and cites the ones that matter.",
    speed: 4,
    depth: 3,
    sourcing: 4,
    bestFor: ["Explanations with sources", "Comparing options", "Debugging with context"],
    sim: { thinkMs: 900, charsPerSecond: 260, showsReasoning: true },
  },
  {
    id: "e3",
    name: "E3",
    nick: "Deep",
    blurb:
      "Slower and more thorough. Shows every step and says plainly where the evidence runs out.",
    speed: 2,
    depth: 5,
    sourcing: 5,
    bestFor: ["Research questions", "Long-form reasoning", "Decisions with trade-offs"],
    sim: { thinkMs: 1700, charsPerSecond: 190, showsReasoning: true },
  },
];

export const DEFAULT_MODEL: ModelId = "e2";

export function getModel(id: string | null | undefined): Model {
  return MODELS.find((m) => m.id === id) ?? (MODELS[1] as Model);
}
