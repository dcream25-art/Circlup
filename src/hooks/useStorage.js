import { supabase } from '../lib/supabase'

/**
 * Upload un fichier vers Supabase Storage
 * @param {File} file - Le fichier à uploader
 * @param {string} bucket - 'avatars' ou 'post-images'
 * @param {string} folder - ex: userId
 * @returns {{ url: string|null, error: string|null }}
 */
export async function uploadFile(file, bucket, folder) {
  try {
    if (!file) return { url: null, error: 'Aucun fichier' }

    // Validation taille
    const maxSize = bucket === 'avatars' ? 5 * 1024 * 1024 : 10 * 1024 * 1024
    if (file.size > maxSize) {
      return { url: null, error: `Fichier trop lourd (max ${maxSize / 1024 / 1024}MB)` }
    }

    // Validation type
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!allowed.includes(file.type)) {
      return { url: null, error: 'Format non supporté (JPG, PNG, WEBP, GIF uniquement)' }
    }

    // Nom unique
    const ext = file.name.split('.').pop()
    const filename = `${folder}/${Date.now()}.${ext}`

    // Upload
    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filename, file, { upsert: true, contentType: file.type })

    if (uploadError) return { url: null, error: uploadError.message }

    // URL publique
    const { data } = supabase.storage.from(bucket).getPublicUrl(filename)
    return { url: data.publicUrl, error: null }
  } catch (err) {
    return { url: null, error: err.message }
  }
}
