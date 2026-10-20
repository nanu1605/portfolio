// §10.4 "Table to bill": the four steps (A.4.4 "How it works") and the
// captured demo screen each one shows (assets/source/screens/manifest.json).

export const tableToBill = {
  steps: [
    {
      name: "Scan",
      text: "Each table has its own QR code. Guests scan it and the menu opens, already tied to their table — no app, no login.",
      screen: "menumesh/menumesh-demo-start-guest.png",
    },
    {
      name: "Order",
      text: "They pick dishes, options and add-ons, in English or Hindi. Friends at the same table can order from their own phones, round after round.",
      screen: "menumesh/menumesh-demo-ordered-guest.png",
    },
    {
      name: "Cook and serve",
      text: "Waiters see the order straight away, and the kitchen gets it once a waiter takes the table. Every dish moves from placed to preparing, ready and served, and the guest sees it move too.",
      screen: "menumesh/menumesh-demo-ready-kitchen.png",
    },
    {
      name: "Bill and pay",
      text: "One tap makes the bill with the table's dishes, GST and other charges. It prints on 80 mm or 58 mm receipt printers, payment is recorded as cash, UPI or card, and the table is free for the next guests.",
      screen: "menumesh/menumesh-demo-billed-counter.png",
    },
  ],
  /** The Order step's English/हिंदी toggle (§10.4) shows the menu in Hindi. */
  hindi: { step: 1, screen: "menumesh/menumesh-demo-start-guest-hindi.png" },
  /** §10.4's title, the stepper's accessible name. */
  title: "Table to bill",
  caption: "The browser demo, one step per screen",
  languages: {
    /** The toggle's accessible name (a new string). */
    label: "Menu language",
    en: "English",
    hi: "हिंदी",
  },
} as const;
