Eatable v20 — Resend diagnostic patch

This patch changes only api/report-problem.mjs and logs the provider error name and message to Vercel server logs when Resend rejects an email. It does not log API keys, request bodies or Turnstile tokens.

Instructions:
1. Upload api/report-problem.mjs to the same path in your GitHub eatable repository, replacing the existing file.
2. Commit, wait for Vercel Production to show Ready.
3. Send one test report.
4. Look in Vercel Logs for Eatable report delivery rejected 400 followed by the provider error name/message.
5. Share only the error text, omitting addresses or private info.

All other source files, Supabase, and environment variables remain unchanged.
