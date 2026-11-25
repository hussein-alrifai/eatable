Eatable v28.1 — National cuisine import hotfix

What was wrong: the older Eatable bulk importer had a restricted list of nine cuisines. The v28 JSON uses nationalities like Syrian and Palestinian. The error shown by the old validator is generic ("Invalid cuisine, category, or diet"), although the categories and diets in v28 are valid.

Install ONLY these THREE files in your EXISTING GitHub Eatable repository (paths must match):
  src/recipes.js
  src/bulk-import.js
  src/curated-editor.js

If you have edited any of these files since v28, review and merge before overwriting. Do not replace src/app.js or modify Supabase.

1. Commit changes to your production branch in GitHub.
2. In Vercel, confirm the deployment for that commit is Ready and is serving your production domain.
3. Open https://cookwitheatable.com/src/bulk-import.js in a browser. Search the page for `Unsupported cuisine:`. If not found, the new file is NOT being served.
4. Open https://cookwitheatable.com/src/recipes.js. Search for `Syrian`. If not found, the expanded cuisines are not deployed.
5. Hard-refresh the Eatable admin import page (Windows Ctrl+Shift+R, Mac Cmd+Shift+R). Re-upload recipes-v28-01.json from the ORIGINAL v28 pack.
6. Syrian muhammara and Palestinian musakhan should show Valid draft if the vocabulary was installed.

No SQL, no new secrets, no API changes. Keep all imported recipes as drafts until reviewed.

The importer now uses the national cuisine list exported by recipes.js rather than a separate hard-coded list. Error messages identify an unsupported cuisine, category or diet separately.
