# Eatable v4 validation notes

- JavaScript module syntax checks: passed via Node 22 `node --check`.
- Photo-cloud helper behavior: passed isolated Node test with mock Storage client. Validated MIME/size rejection, private upload, signed URL, admin publication path, public URL and cleanup.
- Verified integration of edit routes, photo form fields, publication functions and SQL migration by code inspection.
- Supabase live end-to-end permissions and Vercel deployment: **not executed** (require project access). The two-account checklist in the root README is mandatory.
- Browser network-driven preview not available in the current environment; no claims of a completed browser E2E test.
