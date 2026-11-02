/**
 * StudyFlow AI — Supabase Storage Engine
 * Dedicated module for private bucket file storage, retrieval, and signed URL generation
 * Bucket: studyflow-uploads
 */

const { createClient } = require('@supabase/supabase-js');
const path = require('path');
const fs = require('fs');

// Load environment variables if not present
const envFile = path.join(__dirname, '.env');
if (fs.existsSync(envFile)) {
  for (const line of fs.readFileSync(envFile, 'utf8').split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (match && process.env[match[1]] === undefined) {
      process.env[match[1]] = match[2].replace(/^(['"])(.*)\1$/, '$2');
    }
  }
}

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://iquuxfmpuroewcghorvq.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlxdXV4Zm1wdXJvZXdjZ2hvcnZxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE5Njg1NDMsImV4cCI6MjEwNzU0NDU0M30.wy92mBnsuCjGh43Wk3KdUA0LwWvc6aEKH3zNBUaOFIQ';
const DEFAULT_BUCKET = 'studyflow-uploads';

let supabaseClient = null;

function getClient() {
  if (!supabaseClient && SUPABASE_URL && SUPABASE_ANON_KEY) {
    try {
      supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: { persistSession: false }
      });
    } catch (err) {
      console.warn('[SupabaseStorage] Failed to initialize Supabase client:', err.message);
    }
  }
  return supabaseClient;
}

/**
 * Upload a file buffer directly to Supabase Storage private bucket
 * @param {Object} params
 * @param {string} [params.bucket='studyflow-uploads']
 * @param {string} params.path - Relative storage path (e.g. 'faculty/assignments/123_notes.pdf')
 * @param {Buffer} params.buffer - File buffer
 * @param {string} [params.contentType='application/octet-stream']
 * @param {boolean} [params.upsert=true]
 */
async function uploadFile({ bucket = DEFAULT_BUCKET, path: storagePath, buffer, contentType, upsert = true }) {
  const client = getClient();
  if (!client) {
    return { success: false, error: 'Supabase client is not initialized.' };
  }

  const cleanPath = String(storagePath || '').replace(/^\/+/, '');
  if (!cleanPath) {
    return { success: false, error: 'Storage path is required.' };
  }

  try {
    const { data, error } = await client.storage
      .from(bucket)
      .upload(cleanPath, buffer, {
        contentType: contentType || 'application/octet-stream',
        upsert: Boolean(upsert)
      });

    if (error) {
      console.warn(`[SupabaseStorage] Upload notice for ${cleanPath}:`, error.message);
      return {
        success: false,
        error: error.message,
        code: error.code || error.statusCode || 'STORAGE_ERROR',
        bucket,
        path: cleanPath
      };
    }

    return {
      success: true,
      bucket,
      path: cleanPath,
      fullPath: data?.fullPath || `${bucket}/${cleanPath}`,
      id: data?.id
    };
  } catch (err) {
    console.warn(`[SupabaseStorage] Upload exception for ${cleanPath}:`, err.message);
    return {
      success: false,
      error: err.message,
      bucket,
      path: cleanPath
    };
  }
}

/**
 * Generate a secure time-limited signed URL for viewing or downloading a private file
 * @param {Object} params
 * @param {string} [params.bucket='studyflow-uploads']
 * @param {string} params.path - Storage path
 * @param {number} [params.expiresIn=3600] - Expiration in seconds (default 1 hour)
 * @param {boolean|string} [params.download=false] - If true or string, forces download attachment with filename
 */
async function createSignedUrl({ bucket = DEFAULT_BUCKET, path: storagePath, expiresIn = 3600, download = false }) {
  const client = getClient();
  if (!client) {
    return { success: false, error: 'Supabase client is not initialized.' };
  }

  const cleanPath = String(storagePath || '').replace(/^\/+/, '');
  if (!cleanPath) {
    return { success: false, error: 'Storage path is required.' };
  }

  try {
    const options = {};
    if (download) {
      options.download = typeof download === 'string' ? download : cleanPath.split('/').pop();
    }

    const { data, error } = await client.storage
      .from(bucket)
      .createSignedUrl(cleanPath, expiresIn, options);

    if (error) {
      return {
        success: false,
        error: error.message,
        code: error.code || error.statusCode,
        bucket,
        path: cleanPath
      };
    }

    return {
      success: true,
      bucket,
      path: cleanPath,
      signedUrl: data?.signedUrl,
      expiresIn
    };
  } catch (err) {
    return {
      success: false,
      error: err.message,
      bucket,
      path: cleanPath
    };
  }
}

/**
 * Download file content as a Buffer from Supabase Storage
 * Used for cross-laptop caching when local disk lacks the file
 * @param {Object} params
 * @param {string} [params.bucket='studyflow-uploads']
 * @param {string} params.path
 */
async function downloadFile({ bucket = DEFAULT_BUCKET, path: storagePath }) {
  const client = getClient();
  if (!client) {
    return { success: false, error: 'Supabase client is not initialized.' };
  }

  const cleanPath = String(storagePath || '').replace(/^\/+/, '');
  if (!cleanPath) {
    return { success: false, error: 'Storage path is required.' };
  }

  try {
    const { data, error } = await client.storage
      .from(bucket)
      .download(cleanPath);

    if (error || !data) {
      return {
        success: false,
        error: error ? error.message : 'No data returned from Supabase Storage.',
        code: error?.code || error?.statusCode,
        bucket,
        path: cleanPath
      };
    }

    const arrayBuffer = await data.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    return {
      success: true,
      bucket,
      path: cleanPath,
      buffer,
      size: buffer.length,
      contentType: data.type || 'application/octet-stream'
    };
  } catch (err) {
    return {
      success: false,
      error: err.message,
      bucket,
      path: cleanPath
    };
  }
}

/**
 * Delete a file from Supabase Storage
 */
async function deleteFile({ bucket = DEFAULT_BUCKET, path: storagePath }) {
  const client = getClient();
  if (!client) return { success: false, error: 'Client not initialized' };
  try {
    const cleanPath = String(storagePath || '').replace(/^\/+/, '');
    const { data, error } = await client.storage.from(bucket).remove([cleanPath]);
    if (error) return { success: false, error: error.message };
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * Check connectivity and RLS policy readiness for studyflow-uploads bucket
 */
async function checkStorageHealth(bucket = DEFAULT_BUCKET) {
  const client = getClient();
  if (!client) {
    return { connected: false, error: 'Supabase client not initialized' };
  }

  try {
    // Attempt to list files in bucket
    const { data, error } = await client.storage
      .from(bucket)
      .list('', { limit: 1 });

    if (error) {
      return {
        connected: false,
        bucket,
        error: error.message,
        code: error.code || error.statusCode,
        hint: 'Please ensure RLS policy is applied in Supabase SQL Editor.'
      };
    }

    return {
      connected: true,
      bucket,
      error: null,
      fileCountSample: Array.isArray(data) ? data.length : 0
    };
  } catch (err) {
    return {
      connected: false,
      bucket,
      error: err.message
    };
  }
}

module.exports = {
  uploadFile,
  createSignedUrl,
  downloadFile,
  deleteFile,
  checkStorageHealth,
  getClient,
  DEFAULT_BUCKET,
  SUPABASE_URL,
  SUPABASE_ANON_KEY
};

