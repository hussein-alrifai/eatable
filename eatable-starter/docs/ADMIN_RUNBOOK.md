# Eatable — Review deletion requests (administrator only)

1. Check Supabase → Table Editor → `public.eatable_deletion_requests`, filtered by status `pending` or `in_review`. **Requests do not send an email automatically.** Set a recurring manual check until notification delivery exists.
2. Locate the Auth user by `user_id` in Supabase Authentication → Users. Do not trust a user-supplied email/note as identity proof. Reply to the verified account email from eatable.support@gmail.com when additional information is necessary.
3. Inventory the user's records and photograph paths. `recipe_submissions.id` is the same as `community_recipes.id` for published community recipes. This is now enforced by a RESTRICT foreign key; an account cannot be deleted while such a public recipe still references a submission.
4. Handle any published contribution consistent with the user’s rights, consent/licenses, and the terms in force. Do not delete unrelated curated recipes or images.
5. Remove the user's Storage objects **through Supabase Storage API or Dashboard**, including privately uploaded files and any files they still own in the public bucket. Confirm no shared/curated files are removed in error.
6. For approved community recipes that must be removed, change the corresponding submission status from approved to rejected using the existing moderation process (which should unpublish the public row), and separately clean up public photo objects via Storage. Verify the public recipe is gone. Do not run direct SQL deletion of `storage.objects`.
7. Only after the Storage and publication cleanup, use the authorized Supabase admin user-deletion operation (or Authentication → Users) to delete the Auth account. Verify private rows cascaded away and the user can no longer log in. Deletion requests cascade with Auth user deletion.
8. Check relevant retention obligations, support emails, server logs, backups, and the privacy notice. This patch **does not** automate deletion, notify admins, or set provider retention policies.

Respond to requests promptly. GDPR timelines and any lawful exceptions must be assessed case by case. Avoid storing deletion logs with excessive identifying information.
