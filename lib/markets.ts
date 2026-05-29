export interface Market {
  id: string;
  question: string;
  category: "Demo Gods" | "Hackathon Life" | "Tech" | "Startup" | "Totally Normal";
  emoji: string;
  /** Price of a YES share in cents (1–99). NO = 100 − yes. */
  yes: number;
  /** Fake total $KESTO traded. */
  volume: number;
  closes: string;
  description: string;
}

/** The comedy lives here. All markets are fictional and resolve in vibes. */
export const MARKETS: Market[] = [
  {
    id: "demo-first-try",
    question: "Will the live demo work on the first try?",
    category: "Demo Gods",
    emoji: "🎬",
    yes: 6,
    volume: 1_240_000,
    closes: "at showtime",
    description:
      "Resolves YES if nothing is unplugged, refreshed, or quietly restarted on stage. History is not on your side.",
  },
  {
    id: "basically-done",
    question: "Will someone say 'we're basically done' before we actually are?",
    category: "Hackathon Life",
    emoji: "🫠",
    yes: 93,
    volume: 880_000,
    closes: "T-minus 6 hours",
    description: "Resolves YES the instant the words leave anyone's mouth. The market has never resolved NO.",
  },
  {
    id: "ai-mentions",
    question: "Will the pitch say 'AI' more than 50 times?",
    category: "Startup",
    emoji: "🤖",
    yes: 78,
    volume: 640_000,
    closes: "end of pitch",
    description: "Counter includes 'agentic', 'LLM', and any sentence containing the word 'autonomous'.",
  },
  {
    id: "wifi-keynote",
    question: "Will the venue WiFi survive the keynote?",
    category: "Tech",
    emoji: "📶",
    yes: 19,
    volume: 410_000,
    closes: "during keynote",
    description: "Resolves NO if anyone tethers to their phone. They will tether to their phone.",
  },
  {
    id: "claude-new-model",
    question: "Will Anthropic ship a new model before this market resolves?",
    category: "Tech",
    emoji: "🧠",
    yes: 88,
    volume: 1_010_000,
    closes: "any minute now",
    description: "Genuinely a coin flip on any given week. Currently trading high for unrelated reasons.",
  },
  {
    id: "commit-4am",
    question: "Will someone commit code after 4am?",
    category: "Hackathon Life",
    emoji: "🌙",
    yes: 96,
    volume: 720_000,
    closes: "sunrise",
    description: "Commit message quality inversely correlated with the hour. Resolves on the timestamp, not the diff.",
  },
  {
    id: "deploy-friday",
    question: "Will someone deploy to prod on a Friday?",
    category: "Tech",
    emoji: "🚀",
    yes: 71,
    volume: 530_000,
    closes: "Friday 5pm",
    description: "What could possibly go wrong. (A lot. The answer is a lot.)",
  },
  {
    id: "coffee-noon",
    question: "Will the coffee run out before noon?",
    category: "Totally Normal",
    emoji: "☕",
    yes: 84,
    volume: 290_000,
    closes: "noon",
    description: "Supply: finite. Demand: a room full of people who slept four hours combined.",
  },
  {
    id: "pivot-before-a",
    question: "Will this startup pivot before its Series A?",
    category: "Startup",
    emoji: "🔄",
    yes: 67,
    volume: 450_000,
    closes: "next funding round",
    description: "Currently a B2B SaaS. By Tuesday, a marketplace. By Friday, 'an AI-native platform company'.",
  },
  {
    id: "standup-overrun",
    question: "Will standup go over 15 minutes?",
    category: "Totally Normal",
    emoji: "⏱️",
    yes: 89,
    volume: 180_000,
    closes: "daily, 9:15am",
    description: "Someone will say 'quick question'. It will not be quick. It will not be a question.",
  },
];

export function getMarket(id: string): Market | undefined {
  return MARKETS.find((m) => m.id === id);
}
