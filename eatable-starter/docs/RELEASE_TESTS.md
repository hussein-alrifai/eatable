# v6 release checks

- Static JS syntax checks: `node --check` for all `src/*.js`.
- Pure editor form tests: required language fields, ingredient identity and amounts, duplicate prevention and draft/publish payloads.
- Client views: private admin routes and mobile form layout.
- Live integration requires your own Supabase project. We did not remotely access user Supabase/GitHub/Vercel accounts.
- Existing community photo approval and storage paths were deliberately left unchanged.
