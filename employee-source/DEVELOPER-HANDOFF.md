# LegacyBridge for Employees — Developer Handoff

## Main files

- `app/page.tsx` — complete corporate-benefit page content and structure
- `app/globals.css` — responsive LegacyBridge styling
- `app/layout.tsx` — page title and metadata
- `public/legacybridge-logo.svg` — LegacyBridge logo used by the page

## Run locally

1. Install Node.js 20 or newer.
2. Run `npm install`.
3. Run `npm run dev`.

## Integration notes

- The page is self-contained and can be adapted into the existing LegacyBridge frontend.
- Replace both `https://www.legacybridge.in` corporate-enquiry links in `app/page.tsx` with the final corporate enquiry form or business email destination.
- Confirm final volume pricing, GST wording and lifetime-plan terms before adding the page to production.
- Preserve the privacy claims: employers receive activation-level information only and cannot access employee vault contents.
- Nominee access must remain subject to the prescribed identity-verification and claim process.
