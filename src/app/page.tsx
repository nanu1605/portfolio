import { ThemeToggle } from "@/components/ui/theme-toggle";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-site flex-col justify-center gap-6 px-gutter py-section">
      <div className="flex items-center justify-between gap-4">
        <p className="font-mono text-mono-label uppercase text-fg-subtle">
          ML &amp; systems engineer · Founder, Jainav Infotech · Indore, India
        </p>
        <ThemeToggle />
      </div>
      <h1 className="text-display">From model to machine.</h1>
      <p className="max-w-text text-body-lg text-fg-muted">
        I&apos;m Tanishq Jain. I build machine-learning systems and software
        that hold up outside the notebook — and ship them through my company,
        Jainav Infotech.
      </p>
    </main>
  );
}
