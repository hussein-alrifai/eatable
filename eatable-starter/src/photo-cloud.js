import {getCloudClient} from './cloud.js';

export const PRIVATE_BUCKET = 'eatable-private-photos';
export const PUBLIC_BUCKET = 'eatable-published-photos';
const client = () => { const c=getCloudClient(); if (!c) throw Error('Supabase is not connected.'); return c; };
const mimeExtensions = {'image/jpeg':'jpg','image/png':'png','image/webp':'webp'};

export function validatePhoto(file) {
  if (!file || !file.size) return null;
  const ext=mimeExtensions[file.type];
  if(!ext) throw Error('Use a JPEG, PNG or WebP image.');
  if(file.size>5*1024*1024) throw Error('Image must be 5 MB or smaller.');
  return ext;
}

export async function uploadPrivatePhoto(userId, submissionId, file) {
  const ext=validatePhoto(file);
  if(!ext)return null;
  const path=`${userId}/${submissionId}/${crypto.randomUUID()}.${ext}`;
  const {error}=await client().storage.from(PRIVATE_BUCKET).upload(path,file,{upsert:false,contentType:file.type,cacheControl:'3600'});
  if(error)throw error;
  return path;
}
export async function removePrivatePhoto(path) {
  if(!path)return;
  return client().storage.from(PRIVATE_BUCKET).remove([path]);
}
export async function getPrivatePhotoUrl(path) {
  if(!path)return null;
  const {data,error}=await client().storage.from(PRIVATE_BUCKET).createSignedUrl(path,600);
  if(error)throw error;
  return data.signedUrl;
}
export function getPublicPhotoUrl(path) {
  if(!path)return null;
  return client().storage.from(PUBLIC_BUCKET).getPublicUrl(path).data.publicUrl;
}

// Client-driven publication is restricted by the public bucket's admin-only INSERT policy.
// Approval happens *after* a successful copy to public storage.
export async function publishPhoto(submission) {
  if(!submission.photo_path)return null;
  const ext=submission.photo_path.split('.').at(-1);
  const publishedPath=`${submission.id}/${crypto.randomUUID()}.${ext}`;
  const {data:file,error:downloadError}=await client().storage.from(PRIVATE_BUCKET).download(submission.photo_path);
  if(downloadError)throw downloadError;
  const type=mimeExtensions[file.type]?file.type:({'jpg':'image/jpeg','png':'image/png','webp':'image/webp'}[ext]);
  const {error:uploadError}=await client().storage.from(PUBLIC_BUCKET).upload(publishedPath,file,{upsert:false,contentType:type,cacheControl:'3600'});
  if(uploadError)throw uploadError;
  return publishedPath;
}
export async function removePublicPhoto(path) {
  if(!path)return;
  const {error}=await client().storage.from(PUBLIC_BUCKET).remove([path]);
  if(error)throw error;
}
