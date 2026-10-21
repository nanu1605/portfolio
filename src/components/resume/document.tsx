import "server-only";
import {
  Document,
  Font,
  Link,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import { site } from "@content/site";
import { resumeHeader, resumeSections, type Entry } from "@/lib/resume";
import { colors } from "@/styles/tokens";

// /resume.pdf (§8.10): A4, at most two pages, one column, real text. The
// colours are the light theme's tokens.

// Whole words only: hyphenated names and versions read badly.
Font.registerHyphenationCallback((word) => [word]);

const ink = {
  fg: colors.fg.light,
  muted: colors["fg-muted"].light,
  subtle: colors["fg-subtle"].light,
  rule: colors.border.light,
  accent: colors["accent-strong"].light,
};

const s = StyleSheet.create({
  page: {
    paddingVertical: 36,
    paddingHorizontal: 44,
    fontFamily: "Helvetica",
    fontSize: 8.8,
    lineHeight: 1.38,
    color: ink.muted,
  },
  name: {
    fontFamily: "Helvetica-Bold",
    fontSize: 20,
    lineHeight: 1.2,
    color: ink.fg,
  },
  contacts: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 6,
    fontSize: 8.4,
  },
  contact: { color: ink.muted, textDecoration: "none", marginRight: 12 },
  section: { marginTop: 12 },
  heading: {
    fontFamily: "Helvetica-Bold",
    fontSize: 7.6,
    letterSpacing: 1.2,
    textTransform: "uppercase",
    color: ink.accent,
    borderBottomWidth: 0.6,
    borderBottomColor: ink.rule,
    paddingBottom: 2.5,
    marginBottom: 5,
  },
  note: { fontSize: 8.2, marginBottom: 4 },
  entry: { marginBottom: 6 },
  row: { flexDirection: "row", justifyContent: "space-between" },
  title: { fontFamily: "Helvetica-Bold", color: ink.fg, flex: 1 },
  link: { color: ink.fg, textDecoration: "none" },
  period: { fontSize: 8.2, color: ink.subtle, marginLeft: 12 },
  org: { color: ink.muted },
  bullet: { flexDirection: "row", marginTop: 1.5 },
  dot: { width: 9, color: ink.subtle },
  bulletText: { flex: 1 },
  line: { marginBottom: 2.5 },
  label: { fontFamily: "Helvetica-Bold", color: ink.fg },
});

const absolute = (href: string) =>
  href.startsWith("/") ? new URL(href, site.url).href : href;

function EntryView({ entry }: { entry: Entry }) {
  return (
    <View style={s.entry} wrap={false}>
      <View style={s.row}>
        <Text style={s.title}>
          {entry.href ? (
            <Link src={absolute(entry.href)} style={s.link}>
              {entry.title}
            </Link>
          ) : (
            entry.title
          )}
        </Text>
        <Text style={s.period}>{entry.period}</Text>
      </View>
      {entry.org && <Text style={s.org}>{entry.org}</Text>}
      {entry.bullets.map((b) => (
        <View key={b} style={s.bullet}>
          <Text style={s.dot}>•</Text>
          <Text style={s.bulletText}>{b}</Text>
        </View>
      ))}
    </View>
  );
}

export function ResumeDocument() {
  return (
    <Document
      title={`${resumeHeader.name} — Resume`}
      author={resumeHeader.name}
      subject={site.role}
      language="en"
    >
      <Page size="A4" style={s.page}>
        <Text style={s.name}>{resumeHeader.name}</Text>
        <View style={s.contacts}>
          {resumeHeader.contacts.map((c) =>
            c.href ? (
              <Link key={c.text} src={c.href} style={s.contact}>
                {c.text}
              </Link>
            ) : (
              <Text key={c.text} style={s.contact}>
                {c.text}
              </Text>
            ),
          )}
        </View>
        {resumeSections.map((section) => (
          <View key={section.id} style={s.section}>
            <Text style={s.heading} minPresenceAhead={40}>
              {section.title}
            </Text>
            {section.note && <Text style={s.note}>{section.note}</Text>}
            {section.text && <Text>{section.text}</Text>}
            {section.entries?.map((e) => (
              <EntryView key={e.title} entry={e} />
            ))}
            {section.lines?.map((l) => (
              <Text key={l.label} style={s.line} wrap={false}>
                {l.href ? (
                  <Link src={absolute(l.href)} style={[s.link, s.label]}>
                    {l.label}
                  </Link>
                ) : (
                  <Text style={s.label}>{l.label}</Text>
                )}
                {` — ${l.text}`}
              </Text>
            ))}
          </View>
        ))}
      </Page>
    </Document>
  );
}
