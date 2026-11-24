# Eatable — Legal pages (English)

Updated 24 November 2026. Source-based drafts requiring the operational confirmations in PRIVACY_COOKIE_AUDIT.md.

## Privacy Notice

### Updated 24 November 2026 · Who operates Eatable

Eatable (cookwitheatable.com) is a personal, currently noncommercial project created and operated by Hussein AlRifai, who is the data controller for the Eatable service. For privacy matters, contact eatable.support@gmail.com. Eatable is not currently offering restaurant orders or payments.

### What we collect

When you register, we process your email address, public display name, account identifier, language and authentication information through Supabase. If you use personal features, we store favorites, pantry ingredients, shopping items, saved collections and contributions. Recipe submissions can contain text, photos, cultural information and moderation history. Reviews can include a rating and optional written comment. Publicly published contributions or reviews can be viewed by other visitors.

### Problem reports and support

You can report a problem without an account. The report contains a category, title, description and page path; your name and reply email are optional. Reports are checked using Cloudflare Turnstile and delivered to the Eatable Gmail support inbox through a Vercel server function and Resend. Please do not include passwords, payment information or sensitive personal details.

### Purposes and legal bases

Account creation, authentication and requested personal features: Article 6(1)(b) GDPR (steps needed to provide the requested service). Publishing contributions and applying the user content licence: Article 6(1)(b). Abuse prevention, service security, content moderation and responding to support requests: Article 6(1)(f), legitimate interests in running and protecting Eatable and replying to users. Where consent is specifically required for optional tracking or another activity, it will be requested separately before that activity begins. No advertising or marketing consent is requested by this version.

### Who can see data

Public visitors can see approved recipes, published photographs, reviews and display names where presented by the website. Your pantry, shopping list, saved collections and account records are intended to be private to you and authorized administrators where needed. Service providers handle technical data to operate the site. Please use a display name you are comfortable making public.

### Processors and external services

Supabase provides authentication, database and file storage; Vercel provides hosting and the report API; Resend delivers support emails; Cloudflare Turnstile protects the report form; Google Gmail receives support messages. The frontend also loads the Supabase JavaScript library from jsDelivr. These providers may receive technical connection information such as your IP address and browser information. Details about the providers and their privacy terms are available on their websites.

### International transfers

Your personal information may be processed outside the European Economic Area through these providers or their subprocessors. Where required, appropriate GDPR transfer mechanisms must apply (for example, an applicable adequacy decision or standard contractual clauses). Exact provider arrangements and the selected Supabase region require verification before this notice can be considered complete.

### Storage and deletion

Account information and private features are kept while the account exists, subject to deletion or lawful retention needs; approved content remains published until removed or moderated. Local browser settings and cooking progress remain on your device until removed or cleared. Support emails and technical logs have separate operational/provider retention rules; their exact deletion schedules and account-erasure workflow must be verified before launch. Deleted data may remain temporarily in provider backups according to the applicable backup lifecycle.

### Your rights and choices

Subject to applicable conditions, you may ask to access, correct, erase, restrict or receive your personal data, object to processing based on legitimate interests, or withdraw consent where consent is used. Email eatable.support@gmail.com. You may complain to the Italian Garante per la protezione dei dati personali (garanteprivacy.it) or another competent supervisory authority. Identity may need to be verified before acting on a request.

### Cookies, local storage and recommendations

Eatable stores selected ingredients, some preferences and cooking progress locally in your browser; Supabase generally stores authentication sessions in browser local storage. The Report a Problem form loads Cloudflare Turnstile for bot protection. Rule-based recipe suggestions may use your saved favorites and pantry to personalize results; they do not make decisions with legal or similarly significant effects. Read the Cookies & Storage page for details. Nonessential trackers must be checked on the live deployment before any consent statement is finalized.

### Updates and contact

This notice may change when Eatable adds new functions or providers. Material changes will be reflected on this page. For questions, privacy requests or concerns, contact eatable.support@gmail.com.

## Terms of Use

### Updated 24 November 2026 · Operator

Eatable is currently a noncommercial personal project operated by Hussein AlRifai. Contact: eatable.support@gmail.com. These Terms apply to the website cookwitheatable.com and its member features.

### Using Eatable

Visitors can read recipes without an account. Registered members may use personal recipe tools, submit recipes, save collections and post ratings. Please do not misuse accounts, interfere with the service, scrape private user information or submit unlawful or abusive material.

### Recipes and food safety

Recipes are provided for general cooking information, not a guarantee of food safety, exact ingredient quantities, allergen suitability or a particular nutritional result. Check ingredients and substitutions, follow food hygiene guidance and use safe cooking temperatures. Cooking is undertaken at the user’s discretion and responsibility, subject to mandatory applicable law.

### Your contributions and licence

Only upload text and photos that you created or have permission to share. You retain any intellectual property rights you hold. By submitting content for publication, you grant Eatable a non-exclusive, worldwide, royalty-free licence, for as long as the content is hosted on the service, to store, reproduce, format, resize, translate or edit for clarity with appropriate attribution where possible, and publicly display that content solely to operate, improve and promote that content within Eatable. You may request removal at eatable.support@gmail.com. This licence does not authorize selling your photos separately to third parties.

### Moderation and reviews

Eatable reviews submitted recipes before publication and may request edits, reject or remove content and hide abusive or misleading reviews. Ratings should reflect genuine cooking experiences. Users must not impersonate others, violate third-party rights, post defamatory or discriminatory material, or intentionally give dangerous food-safety instructions.

### Accounts and availability

You are responsible for keeping your login credentials secure and for the accuracy of information you submit. Eatable may be unavailable during maintenance or incidents. Features may change during the public beta. To request account deletion or data access, contact eatable.support@gmail.com; these requests will be handled in line with the Privacy Notice and applicable law.

### Noncommercial scope and changes

Eatable does not currently sell goods, process payments, or accept restaurant orders. If commercial activities, subscriptions or restaurant ordering are introduced, these Terms and related legal information must be updated before launch of those services.

### Applicable law and contact

Italian law applies where legally permitted, without limiting mandatory consumer or data protection rights that may apply. For concerns or complaints, contact eatable.support@gmail.com. Any rights that cannot lawfully be excluded remain unaffected.

## Cookies & Browser Storage

### What our code uses

The inspected Eatable code uses localStorage to remember selected ingredients (eatable:ingredients), local favorites on unsupported/demo paths (eatable:favorites), the ingredient substitution preference (eatable:show-substitutions) and individual cooking-step progress (eatable:cook-progress:*). It uses sessionStorage to preserve the report source path while navigating to Report a Problem. These are browser-storage mechanisms, not necessarily HTTP cookies.

### Account sessions

Eatable uses Supabase Auth with persistent sessions enabled. The Supabase JavaScript client normally saves authentication tokens in browser localStorage under a project-specific key. Signing out clears the session; browser storage can also be managed in the browser settings. Disabling required storage may prevent sign-in or saved preferences from working.

### Cloudflare Turnstile on the report page

When the Report a Problem page is opened, Eatable loads a security widget from challenges.cloudflare.com. Cloudflare processes technical/browser signals to prevent automated reports. Depending on the configuration, Cloudflare may use cookies or comparable storage; a cf_clearance cookie is associated with optional pre-clearance and should not be assumed present unless enabled and observed in the live site.

### Analytics, ads and consent

No advertising pixels or analytics integrations were found in the inspected Eatable source files. That is not proof that third-party scripts or dashboard integrations have not been enabled on the live deployment. No nonessential tracking should be activated before checking whether prior consent is needed. Where only strictly necessary storage is used, Italian guidance generally requires clear information but not a cookie-consent banner.

### Third-party requests and controls

The website communicates with Supabase for database and accounts, Vercel for hosting and reports, Resend for support email delivery through a server function, Cloudflare for anti-spam and jsDelivr to load the Supabase JavaScript library. You can inspect cookies and local storage through your browser settings. Blocking technical storage or third-party security scripts can disable parts of the site.

### Last audit and verification status

Code audit dated 24 November 2026. Before public launch, the operator must verify the live Cookies and Local Storage inventory in the browser, any Vercel analytics options and the Cloudflare Turnstile pre-clearance setting. This notice will be updated if nonessential trackers are detected.
