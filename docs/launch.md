# Launch runbook (Phase 8)

The steps that need Tanishq's accounts, in order. Each one says what to tell me when it's done. Nothing here needs a code change: the contact form switches itself from the mailto fallback to sending through Resend as soon as all five contact variables are set (`src/lib/contact-server.ts`).

## Where things stand (23 Oct 2026)

- Production on Vercel: https://portfolio-eight-gamma-4x0xpdi5wk.vercel.app serves `main`.
- DNS for tanishq.website is at GoDaddy (`ns61`/`ns62.domaincontrol.com`). Public DNS today:
  - `@` A records `15.197.148.33` and `3.33.130.190`: GoDaddy's parking page;
  - `www` CNAME to `@`;
  - `@` TXT `google-site-verification=…`: Search Console. **Keep it.**
  - No MX record. None is needed: the form sends from `contact@tanishq.website`, and replies go to the visitor's address.
- The old site, https://tanishq-jain-portfolio.vercel.app (repo `nanu1605/my-portfolio`), is still live, including `/Tanishq_Jain_Resume.pdf`.

## 1. Turnstile (Cloudflare)

1. Cloudflare dashboard → Turnstile → Add widget.
2. Name: `tanishq.website`. Hostname: `tanishq.website`. Widget mode: Managed.
3. Keep the **site key** and the **secret key** for step 3.

## 2. Resend

1. Resend → Domains → Add domain → `tanishq.website`.
2. At GoDaddy (DNS → Manage), add exactly the records Resend shows: an MX and an SPF TXT record on `send`, and the DKIM TXT record on `resend._domainkey`. Optional but recommended: a TXT record on `_dmarc` with `v=DMARC1; p=none;`.
3. Click Verify in Resend and wait for "Verified".
4. Resend → API Keys → Create: permission "Sending access", domain `tanishq.website`. Keep the key for step 3.

## 3. Vercel analytics and environment variables

Vercel → portfolio → Analytics → **Enable** Web Analytics. On 23 Oct `/_vercel/insights/script.js` returned 404 on production, so no page views or events are counted yet. Speed Insights is already on (its script returns 200).

Then the environment variables:

Vercel → portfolio → Settings → Environment Variables, for **Production** only:

| Name | Value |
|---|---|
| `CONTACT_TO_EMAIL` | `tanishqjain010@gmail.com` |
| `CONTACT_FROM_EMAIL` | `Tanishq Jain <contact@tanishq.website>` |
| `RESEND_API_KEY` | the key from step 2 (mark it Sensitive) |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | the site key from step 1 |
| `TURNSTILE_SECRET_KEY` | the secret key from step 1 (mark it Sensitive) |
| `GITHUB_TOKEN` (optional) | a fine-grained token with public read-only access; it raises the API limit for the release lookups at build time |

- Leave them unset for Preview. Previews keep the mailto fallback, so a preview can't send mail.
- `NEXT_PUBLIC_SITE_URL` (§18) isn't needed. The canonical host comes from `site.url` in `content/site.ts`, so previews also point their canonical URLs at tanishq.website.
- Then redeploy production (Deployments → the latest → Redeploy). The contact page is built static, so it picks up the keys only on a new build.

## 4. Domain in Vercel and DNS at GoDaddy

1. Vercel → portfolio → Settings → Domains → Add `tanishq.website`. When asked, also add `www.tanishq.website` and choose **redirect to tanishq.website** (308, the default).
2. At GoDaddy:
   - delete the two `@` A records (`15.197.148.33`, `3.33.130.190`) and turn off any GoDaddy forwarding or website-builder setting on the domain;
   - delete the `www` CNAME to `@`;
   - add exactly the records Vercel shows for `@` and `www`;
   - keep the `google-site-verification` TXT record and the Resend records.
3. Wait until Vercel shows "Valid Configuration" for both domains and has issued the certificate.

**Tell me** when this is done. I'll check that https://tanishq.website serves production, that `www` and `http://` redirect to it, the security headers, the share images and the sitemap, and then run Lighthouse on the production URLs.

## 5. A real contact message

Send one through https://tanishq.website/contact and check it reaches `tanishqjain010@gmail.com` (and not spam), with Reply-To set to the address you typed.

## 6. Search Console

The domain property is already verified. Sitemaps → submit `https://tanishq.website/sitemap.xml`. Then check the Person and WebSite markup at https://search.google.com/test/rich-results?url=https://tanishq.website (the Phase 7 item).

## 7. The old site (§16.5)

Only after step 4, so the redirect never lands on the parking page. Two ways:

- **(a) Recommended:** commit this `vercel.json` to the root of `nanu1605/my-portfolio`. Vercel applies redirects before it serves files, and the first match wins, so the old resume path goes straight to the new PDF and everything else goes to the home page. I can make this commit if you say so.

  ```json
  {
    "redirects": [
      {
        "source": "/Tanishq_Jain_Resume.pdf",
        "destination": "https://tanishq.website/resume.pdf",
        "permanent": true
      },
      {
        "source": "/(.*)",
        "destination": "https://tanishq.website/",
        "permanent": true
      }
    ]
  }
  ```

- **(b)** In the old Vercel project → Settings → Domains, edit `tanishq-jain-portfolio.vercel.app` and redirect it to `tanishq.website`, if the dashboard offers it for a `vercel.app` domain. This keeps the path, so the old resume path takes two hops (the new site already redirects `/Tanishq_Jain_Resume.pdf` to `/resume.pdf`), and other old paths land on the 404 page instead of Home.

## 8. Profiles

- GitHub profile README: the draft is in [`docs/profile-readme.md`](profile-readme.md). Paste it into `nanu1605/nanu1605`'s `README.md`, or tell me to commit it there.
- LinkedIn: add https://tanishq.website as the website on your profile.
