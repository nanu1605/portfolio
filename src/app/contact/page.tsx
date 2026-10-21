import { contact } from "@content/contact";
import { microcopy } from "@content/microcopy";
import { site } from "@content/site";
import { ContactForm } from "@/components/contact/form";
import { Breadcrumbs } from "@/components/site/breadcrumbs";
import { pageMetadata } from "@/components/site/page";
import { CopyButton } from "@/components/ui/copy-button";
import { contactConfig } from "@/lib/contact-server";

export const metadata = pageMetadata("/contact");

/**
 * Contact (§8.11, A.12). Phones and tablets: one column (the form at most
 * 600 px wide); desktop: the text left (5), the form right (7).
 */
export default function Contact() {
  const { mode, siteKey } = contactConfig();
  return (
    <div className="px-page py-section pt-12 md:pt-16">
      <Breadcrumbs path="/contact" />
      <div className="mx-auto grid max-w-site gap-12 lg:grid-cols-12">
        <div className="flex flex-col gap-6 lg:col-span-5">
          <h1 className="text-h1">{contact.title}</h1>
          <p className="max-w-text text-body-lg text-fg-muted">
            {contact.body}
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <a
              href={`mailto:${site.email}`}
              className="inline-flex min-h-11 items-center font-mono text-small text-fg [overflow-wrap:anywhere] hover:text-accent"
            >
              {site.email}
            </a>
            <CopyButton
              text={site.email}
              label={contact.labels.copy}
              done={microcopy.copied}
            />
          </div>
        </div>
        <div className="w-full max-w-[600px] lg:col-span-7 lg:max-w-none">
          <ContactForm
            mode={mode}
            siteKey={siteKey}
            email={site.email}
            copy={{
              labels: contact.labels,
              topics: contact.topics,
              note: contact.note,
              success: contact.success,
              error: contact.error,
              validation: contact.validation,
              maxMessageLength: contact.maxMessageLength,
            }}
          />
        </div>
      </div>
    </div>
  );
}
