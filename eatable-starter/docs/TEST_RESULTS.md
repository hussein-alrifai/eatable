# Eatable v5 — Test evidence and limitations

Checked on 22 November 2026:

- All JavaScript source modules passed Node `--check` syntax validation.
- Existing curated dataset was extracted from the original module and verified to contain **18 recipes** and **51 standardized ingredients**.
- Mock-DOM Node integration checks passed for English/Italian rendering, Explore, Lebanese Table, shared community recipe detail pages, Cook matching, the contributor cookbook, indexed/unindexed recipe separation, and administrator index editor.
- SQL migration was inspected for catalog seeding, RLS grants/policies and preservation of earlier tables. **SQL was not executed on a real Supabase database in this environment.**
- A live browser test was attempted, but the environment blocked all local/network navigation with `ERR_BLOCKED_BY_ADMINISTRATOR`. Therefore there is **no claim of live browser or end-to-end Supabase testing**.

Required post-deployment tests are listed in README.md.
