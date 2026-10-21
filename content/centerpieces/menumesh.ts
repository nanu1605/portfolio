// §10.4 "Table to bill": the four steps (A.4.4 "How it works") and the
// captured demo screen each one shows (assets/source/screens/manifest.json).
//
// `detail` is the part of the screen shown where room is short (phones,
// and the landscape captures everywhere), as [x, y, width, height] in the
// capture's pixels: the top of the guest menu, the kitchen board without
// its empty half, the bill without the sidebar.
//
// `phone` is the same screen captured at phone width, for the phone stepper
// (the sticky story keeps the landscape capture): the kitchen inside its
// bezel, the bill inside the laptop's screen, both without the empty space
// below.

/** The guest menu down to Butter Naan, in either language. */
const menu = [0, 0, 640, 960] as const;

export const tableToBill = {
  steps: [
    {
      name: "Scan",
      text: "Each table has its own QR code. Guests scan it and the menu opens, already tied to their table — no app, no login.",
      screen: "menumesh/menumesh-demo-start-guest.png",
      detail: menu,
    },
    {
      // The same menu as Scan, so the toggle switches only the language.
      name: "Order",
      text: "They pick dishes, options and add-ons, in English or Hindi. Friends at the same table can order from their own phones, round after round.",
      screen: "menumesh/menumesh-demo-start-guest.png",
      detail: menu,
    },
    {
      name: "Cook and serve",
      text: "Waiters see the order straight away, and the kitchen gets it once a waiter takes the table. Every dish moves from placed to preparing, ready and served, and the guest sees it move too.",
      screen: "menumesh/menumesh-demo-ready-kitchen.png",
      detail: [14, 14, 1476, 666] as const,
      phone: {
        screen: "menumesh/menumesh-demo-ready-kitchen-phone.png",
        detail: [21, 21, 1152, 1019] as const,
      },
    },
    {
      name: "Bill and pay",
      text: "One tap makes the bill with the table's dishes, GST and other charges. It prints on 80 mm or 58 mm receipt printers, payment is recorded as cash, UPI or card, and the table is free for the next guests.",
      screen: "menumesh/menumesh-demo-billed-counter.png",
      detail: [316, 24, 1196, 724] as const,
      phone: {
        screen: "menumesh/menumesh-demo-billed-counter-phone.png",
        detail: [98, 26, 998, 1106] as const,
      },
    },
  ],
  /** The Order step's English/हिंदी toggle (§10.4) shows the menu in Hindi. */
  hindi: {
    step: 1,
    screen: "menumesh/menumesh-demo-start-guest-hindi.png",
    detail: menu,
  },
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
