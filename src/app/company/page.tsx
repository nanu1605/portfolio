import { company } from "@content/company";
import { site } from "@content/site";
import { Reveal } from "@/components/motion/motion";
import { Page, pageMetadata } from "@/components/site/page";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status";
import { TextLink } from "@/components/ui/text-link";

export const metadata = pageMetadata("/company");

const shown = <T extends { requires?: keyof typeof site.flags }>(link: T) =>
  !link.requires || site.flags[link.requires];

/**
 * Company (§8.5, A.7), in the spec's order: hero, principles, the three
 * products, services, the platform link, CTAs. The product cards lift in,
 * then each glow fades in (§6.3): together in a row, one by one when
 * stacked, since each reveals as it enters view.
 */
export default function Company() {
  const { live, pending } = company.site;
  return (
    <Page
      eyebrow={company.eyebrow}
      title={company.title}
      intro={company.subtitle}
    >
      <p className="-mt-6 max-w-text text-fg-muted">{company.intro}</p>

      <section aria-labelledby="principles" className="flex flex-col gap-8">
        <h2 id="principles" className="text-h2">
          {company.labels.principles}
        </h2>
        <ul className="grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
          {company.principles.map((p, i) => (
            <li key={p.title} className="flex flex-col gap-2">
              <p
                aria-hidden="true"
                className="font-mono text-mono-label text-accent"
              >
                {String(i + 1).padStart(2, "0")}
              </p>
              <h3 className="text-h3">{p.title}</h3>
              {p.body && <p className="text-fg-muted">{p.body}</p>}
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="products" className="flex flex-col gap-8">
        <h2 id="products" className="text-h2">
          {company.labels.products}
        </h2>
        <ul data-lift="" className="grid gap-4 md:grid-cols-3">
          {company.products.map((product) => (
            <li key={product.name}>
              <Reveal className="h-full">
                <Card
                  accent={product.accent}
                  className="flex h-full flex-col gap-3"
                >
                  <p className="flex flex-wrap gap-2">
                    {product.badges.map((badge) => (
                      <StatusBadge key={badge} label={badge} />
                    ))}
                  </p>
                  <h3 className="text-h3">{product.name}</h3>
                  <p className="font-semibold text-fg">{product.tagline}</p>
                  <p className="text-small text-fg-muted">
                    {product.description}
                  </p>
                  <ul className="mt-auto flex flex-wrap gap-x-5 gap-y-2 pt-3">
                    {product.links.filter(shown).map((link) => (
                      <li key={link.href}>
                        <TextLink href={link.href} className="text-small">
                          {link.label}
                          <span className="sr-only">: {product.name}</span>
                        </TextLink>
                      </li>
                    ))}
                  </ul>
                </Card>
              </Reveal>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="services" className="flex flex-col gap-8">
        <h2 id="services" className="text-h2">
          {company.services.title}
        </h2>
        <ul className="grid gap-x-10 gap-y-6 md:grid-cols-2">
          {company.services.items.map((s) => (
            <li key={s.name} className="border-t border-border pt-4">
              <p className="text-fg-muted">
                <strong className="font-semibold text-fg">{s.name}</strong> —{" "}
                {s.body}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <p>
        <TextLink href={company.platformLink.href}>
          {company.platformLink.label}
        </TextLink>
      </p>

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        {shown(live) ? (
          <Button href={live.href} variant="primary">
            {live.label}
          </Button>
        ) : (
          <p className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <span className="font-mono text-mono-label text-fg-subtle">
              {pending.text}
            </span>
            <Button href={pending.repo.href} variant="secondary">
              {pending.repo.label}
            </Button>
          </p>
        )}
        <Button href={`mailto:${company.email}`} variant="ghost">
          {company.labels.email}
          <span className="font-mono text-mono-label">{company.email}</span>
        </Button>
      </div>
    </Page>
  );
}
