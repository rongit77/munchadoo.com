# Privacy and accessibility implementation review

Updated 2026-11-14. This is an engineering handoff, not legal advice or certification.

## Confirmed operator information

The user supplied **Clickabily** and **info@clickabily.com**. These are displayed on /about, /privacy, /terms and /accessibility and in the global footer. Legal entity suffix, registration country, company/sole-trader identifier and business address were not supplied. Do not invent them. Confirm the legal controller identity and required disclosures before public launch, together with the operator's mailbox ownership and response process.

## Data inventory and consent

- No account database, payment processor, ads or third-party analytics in current code.
- Browser sends search centre/radius/cuisine/language to the first-party POST route. Server sends necessary search parameters to Google Places. Explicit device-geolocation action, browser permission and nearby notice; manual areas remain available.
- Initial area search uses a fixed public city centre. Precise device location is not read automatically. No app-level location log or persistent restaurant database/cache.
- Removed Google Fonts CSS import; system fonts avoid that third-party page-load request.
- `munchadoo.consent.v1`: required consent preference, valid 180 days. No opt-in by default. Same prominence for essential-only and optional measurement actions. Settings available on every page, native accessible modal, no consent wall.
- `munchadoo.install-dismissed.v1`: user-requested installation-offer snooze, seven days, independent of analytics. Removed on next read after expiry. No visits or counters in this record.
- `munchadoo.install.v1`: optional local A/B assignment, visit timestamps, counters. Reads and writes gated on valid affirmative consent. Legacy data is removed without consent; withdrawal removes it immediately; expired consent blocks further collection and removes data on next use. Not transmitted to backend. Decline does not disable installation, search or games.
- Browser storage denial is caught; the core app must continue. Clearing site data resets consent. No cross-device identity or central consent log has been implemented.
- Games remain in memory. Contact email messages are processed by the operator's mailbox provider; operational retention and authorised access must be agreed before launch.

## Accessibility work

- Real skip-to-content target after primary navigation; main landmark, distinct footer landmark labels, labelled controls and active navigation state.
- Native dialogs for result and preferences; focus restoration, Escape support from native dialog semantics. Keyboard audit with assistive technology still required.
- Search loading/empty/error differentiated, polite result status, game-round status, labelled location disclosure.
- Larger base sizes for small text, rem-based typography, darker muted text, improved draw-button and illustration-label contrast. Browser DOM contrast screening found and fixed issues; it is not a complete WCAG audit.
- Core focus visibility and reduced motion, 44px minimum control targets, responsive wrapping; optional larger text, high contrast and reduced-motion controls. Tools supplement the base interface, not a substitute for compliance.
- Hebrew/English documents and direction. No automatic certification or blanket compliance claim.

## Required before public launch

1. Qualified legal review for operator jurisdiction and intended markets, including Israeli privacy law/amendment 13, service accessibility obligations/exemptions, and EU/other markets if targeted. No exemption assumed.
2. Confirm full operator details, contact workflow, hosting/mailbox subprocessors, locations and retention/access policies. Update privacy text when hosting or providers change.
3. Set production API restrictions, durable quotas, logging minimisation, security/incident procedures and processor arrangements. Current API rate guard is process-local, not a production abuse control.
4. Accessibility audit against applicable Israeli Standard 5568 requirements; target WCAG AA. Test actual VoiceOver/NVDA, keyboard-only paths, 200–400% zoom/reflow, iOS/Android and installation flows. Resolve findings and update the statement with actual audit evidence. Confirm whether an accessibility coordinator and physical service disclosures are required.
5. Publish on HTTPS only after the launch scope is authorised. No deployment or DNS changes in this task.
6. Revisit consent before adding ads, external analytics, accounts, tracking, push or other data uses; never load optional scripts before consent. Do not assume this first-party banner automatically covers later vendors.

## Primary references consulted

- [Israeli Privacy Protection Authority — duty to notify](https://www.gov.il/he/pages/duty_to_notify)
- [Authority notification guidance PDF](https://www.gov.il/BlobFolder/legalinfo/duty_to_notify/he/notify13.pdf)
- [Commission for Equal Rights — accessibility statement](https://www.gov.il/he/pages/declaration_website_accessibility?chapterIndex=2)
- [Commission — website accessibility](https://www.gov.il/he/pages/website_accessibility?chapterIndex=6)
- [EU Your Europe — cookies and online privacy](https://europa.eu/youreurope/business/growing/digitalising/online-privacy/index_en.htm)
- [W3C WCAG 2.2](https://www.w3.org/TR/2023/REC-WCAG22-20231005/)
- [Google Places policies](https://developers.google.com/maps/documentation/places/web-service/policies)

The settings are conservative product choices, not a determination that every listed legal regime applies to the operator.
