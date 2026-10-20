// §10.1 Baby — "Follow a turn": the copy and the four scripted scenarios.
// Utterances, replies, routes, gates and the router ladder are the spec's
// own words (the §10.1 table and ladder). Strings marked `new` aren't in the
// spec and wait for Tanishq's approval (docs/decisions.md).

export type NodeId =
  | "wake"
  | "vad"
  | "stt"
  | "router"
  | "cloud"
  | "local"
  | "tools"
  | "gate"
  | "voice";

export type Line = {
  who: "you" | "baby" | "note";
  text: string;
  /** The node whose (last) visit the line appears at. */
  at: NodeId;
  /** An honesty tag beside the line ("illustrative value"). */
  tag?: string;
};

export type Scenario = {
  name: string;
  /** "hi" for Devanagari text. */
  lang?: "hi";
  /** The nodes the pulse visits, in order (the real path). */
  route: readonly NodeId[];
  /** Router ladder rules that fired, in order (1-based). */
  rules: readonly number[];
  tool: string;
  verdict: "ALLOW" | "CONFIRM";
  /** The privacy pin: file content is redacted from the cloud. */
  redact?: boolean;
  lines: readonly Line[];
  /** The §10.1 table row, as written. */
  row: { route: string; gate: string; reply: string };
};

export type BabyDemo = {
  name: string;
  scenario: string;
  ladderTitle: string;
  transcript: string;
  rule: string;
  fired: string;
  redacted: string;
  you: string;
  baby: string;
  nodes: Record<NodeId, string>;
  ladder: readonly string[];
  columns: {
    scenario: string;
    utterance: string;
    route: string;
    gate: string;
    reply: string;
  };
  scenarios: readonly Scenario[];
};

const into = (to: "cloud" | "local") =>
  ["wake", "vad", "stt", "router", to, "tools", "gate", "voice"] as const;

export const babyDemo: BabyDemo = {
  name: "Follow a turn",
  scenario: "Scenario",
  ladderTitle: "Router ladder",
  transcript: "Transcript",
  rule: "Rule", // new
  fired: "Fired", // new
  redacted: "Redacted", // new
  you: "You", // new
  baby: "Baby",
  nodes: {
    wake: "Wake word",
    vad: "VAD",
    stt: "Speech-to-text",
    router: "Router",
    cloud: "Cloud brain",
    local: "Local 9B",
    tools: "Tools",
    gate: "Safety gate",
    voice: "Voice",
  },
  // §10.1, "this is the order to show".
  ladder: [
    "Privacy pin → local",
    "Game mode → cloud",
    "Devanagari → local",
    "Offline → local",
    "Degraded → Gemini, then local",
    'Orchestrator "best brain" → heavy, then primary, then local',
    "Internal capped calls → local",
    "Planning → heavy, then primary, then local",
    "Normal turn → primary, then Gemini, then local",
  ],
  columns: {
    scenario: "Scenario",
    utterance: "Utterance",
    route: "Route",
    gate: "Gate",
    reply: "Reply (shown)",
  },
  scenarios: [
    {
      name: "Hinglish",
      route: into("cloud"),
      rules: [9],
      tool: "get_sensors",
      verdict: "ALLOW",
      lines: [
        { who: "you", text: "CPU ka temperature kitna hai?", at: "stt" },
        {
          who: "baby",
          text: "CPU abhi 48°C par hai.",
          at: "voice",
          tag: "illustrative value",
        },
      ],
      row: {
        route: "Normal turn → cloud primary",
        gate: "get_sensors: ALLOW",
        reply: '"CPU abhi 48°C par hai." (illustrative value)',
      },
    },
    {
      name: "Privacy pin",
      // read_file runs on the cloud's call; the tool result comes back
      // through the router, which pins the rest of the turn to the local 9B.
      route: [
        ...into("cloud").slice(0, 7),
        "router",
        "local",
        "tools",
        "gate",
        "voice",
      ],
      rules: [9, 1],
      tool: "read_file",
      verdict: "ALLOW",
      redact: true,
      lines: [
        {
          who: "you",
          text: "Read notes.txt on my desktop and summarise it.",
          at: "stt",
        },
        {
          who: "note",
          text: "The privacy pin keeps the rest of the turn on the local 9B, and the file content is redacted from anything sent to the cloud.",
          at: "router",
        },
        {
          who: "baby",
          text: "Here's the gist: …",
          at: "voice",
          tag: "illustrative",
        },
      ],
      row: {
        route:
          "read_file runs; the privacy pin keeps the rest of the turn on the local 9B, and the file content is redacted from anything sent to the cloud",
        gate: "ALLOW",
        reply: '"Here\'s the gist: …" (illustrative)',
      },
    },
    {
      name: "Hindi (Devanagari)",
      lang: "hi",
      route: into("local"),
      rules: [3],
      tool: "app_control",
      verdict: "ALLOW",
      lines: [
        { who: "you", text: "मेरा डाउनलोड फ़ोल्डर खोलो", at: "stt" },
        { who: "baby", text: "डाउनलोड फ़ोल्डर खोल दिया।", at: "voice" },
      ],
      row: {
        route: "Devanagari pin → local 9B",
        gate: "app_control: ALLOW",
        reply: '"डाउनलोड फ़ोल्डर खोल दिया।"',
      },
    },
    {
      name: "Destructive",
      route: into("cloud"),
      rules: [9],
      tool: "run_shell",
      verdict: "CONFIRM",
      lines: [
        {
          who: "you",
          text: "Delete everything in my Downloads folder.",
          at: "stt",
        },
        { who: "baby", text: "Check the screen.", at: "gate" },
        {
          who: "note",
          // new wording: the spec's "it never confirms by voice" names Baby.
          text: "Baby never confirms by voice. No answer within 60 s means no.",
          at: "gate",
        },
        { who: "baby", text: "Okay — I didn't delete anything.", at: "voice" },
      ],
      row: {
        route: "Normal turn → cloud primary",
        gate: 'run_shell: CONFIRM. Baby says "Check the screen"; it never confirms by voice. No answer within 60 s means no',
        reply: '"Okay — I didn\'t delete anything."',
      },
    },
  ],
} as const satisfies BabyDemo;
