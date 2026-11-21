import {SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY} from './supabase-config.js';

export const isCloudConfigured = /^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/i.test(SUPABASE_URL)
  && /^sb_publishable_[a-zA-Z0-9_-]+$/.test(SUPABASE_PUBLISHABLE_KEY);

let client;

export async function initializeCloud(onAuthChange) {
  if (!isCloudConfigured) return false;
  // Supabase JS is only loaded when the public configuration has been added.
  const {createClient} = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');
  client = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    auth: {persistSession:true, autoRefreshToken:true, detectSessionInUrl:true}
  });
  const {data:{session}, error} = await client.auth.getSession();
  if (error) throw error;
  await onAuthChange(session?.user ?? null);
  // Avoid doing async database work synchronously inside the SDK auth callback.
  client.auth.onAuthStateChange((event, updatedSession) => {
    setTimeout(() => { void onAuthChange(updatedSession?.user ?? null, event); }, 0);
  });
  return true;
}

export async function signUp(email, password, displayName, redirectTo, locale) {
  if (!client) throw new Error('Supabase has not been configured.');
  return client.auth.signUp({email, password, options:{emailRedirectTo:redirectTo, data:{display_name:displayName,locale}}});
}
export async function signIn(email, password) {
  if (!client) throw new Error('Supabase has not been configured.');
  return client.auth.signInWithPassword({email,password});
}
export async function signOut() {
  if (!client) throw new Error('Supabase has not been configured.');
  return client.auth.signOut();
}
export async function requestPasswordReset(email, redirectTo) {
  if (!client) throw new Error('Supabase has not been configured.');
  return client.auth.resetPasswordForEmail(email,{redirectTo});
}
export async function updatePassword(password) {
  if (!client) throw new Error('Supabase has not been configured.');
  return client.auth.updateUser({password});
}
export async function readFavorites(userId) {
  if (!client) throw new Error('Supabase has not been configured.');
  return client.from('user_favorites').select('recipe_slug').eq('user_id', userId);
}
export async function addFavorite(userId, recipeSlug) {
  if (!client) throw new Error('Supabase has not been configured.');
  return client.from('user_favorites').insert({user_id:userId,recipe_slug:recipeSlug});
}
export async function removeFavorite(userId, recipeSlug) {
  if (!client) throw new Error('Supabase has not been configured.');
  return client.from('user_favorites').delete().eq('user_id', userId).eq('recipe_slug',recipeSlug);
}
