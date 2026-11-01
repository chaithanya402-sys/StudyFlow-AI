/**
 * StudyFlow AI — Supabase PostgreSQL Backend Integration Module
 * Project Reference: iquuxfmpuroewcghorvq
 * Centralized Cross-Laptop Synchronization & Database Engine
 */

const { createClient } = require('@supabase/supabase-js');
const path = require('path');
const fs = require('fs');

// Ensure environment variables are loaded
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

let supabaseClient = null;
let isConnected = false;
let lastHealthCheck = 0;
let lastHealthResult = { connected: false, error: 'Not initialized yet' };

function getSupabaseClient() {
  if (!supabaseClient && SUPABASE_URL && SUPABASE_ANON_KEY) {
    try {
      supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: { persistSession: false },
        db: { schema: 'public' }
      });
    } catch (err) {
      console.warn('[SupabaseBackend] Failed to initialize Supabase client:', err.message);
    }
  }
  return supabaseClient;
}

/**
 * Check connectivity to Supabase PostgreSQL
 */
async function checkSupabaseHealth(force = false) {
  const now = Date.now();
  if (!force && now - lastHealthCheck < 30000 && lastHealthResult) {
    return lastHealthResult;
  }
  lastHealthCheck = now;
  const client = getSupabaseClient();
  if (!client) {
    lastHealthResult = {
      connected: false,
      url: SUPABASE_URL,
      error: 'Supabase client could not be initialized with provided credentials'
    };
    isConnected = false;
    return lastHealthResult;
  }

  try {
    const { data, error } = await client.from('departments').select('code').limit(1);
    if (error) {
      lastHealthResult = {
        connected: false,
        url: SUPABASE_URL,
        error: error.message || 'Supabase query error'
      };
      isConnected = false;
    } else {
      lastHealthResult = {
        connected: true,
        url: SUPABASE_URL,
        error: null,
        data
      };
      isConnected = true;
    }
  } catch (err) {
    lastHealthResult = {
      connected: false,
      url: SUPABASE_URL,
      error: err.message || 'Network unreachable or project paused (ENOTFOUND)'
    };
    isConnected = false;
  }
  return lastHealthResult;
}

/**
 * Push an Assignment to Supabase for Cross-Laptop Accessibility
 */
async function pushAssignmentToSupabase(assignment) {
  const client = getSupabaseClient();
  if (!client) return { success: false, error: 'Client not configured' };

  try {
    const payload = {
      id: assignment.id,
      type: assignment.type,
      title: assignment.title,
      subject: assignment.subject,
      category: assignment.category || 'General Assignments',
      professor: assignment.professor,
      department: assignment.department,
      target_year: assignment.target_year,
      target_class: assignment.target_class,
      created_by: assignment.created_by,
      attachments_json: typeof assignment.attachments_json === 'string' ? JSON.parse(assignment.attachments_json || '[]') : (assignment.attachments_json || []),
      description: assignment.description || '',
      instructions: assignment.instructions || '',
      due_date: assignment.due_date,
      due_time: assignment.due_time || '23:59',
      priority: assignment.priority || 'Medium',
      status: assignment.status || 'Published',
      max_marks: Number(assignment.max_marks || 100),
      meta_json: typeof assignment.meta_json === 'string' ? JSON.parse(assignment.meta_json || '{}') : (assignment.meta_json || {})
    };

    const { data, error } = await client.from('assignments').upsert(payload, { onConflict: 'id' });
    if (error) {
      console.warn('[Supabase Sync] Assignment upsert notice:', error.message);
      return { success: false, error: error.message };
    }
    return { success: true, data };
  } catch (err) {
    console.warn('[Supabase Sync] Assignment push failed:', err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Pull Assignments from Supabase into Local Cache
 */
async function pullAssignmentsFromSupabase(type = null, db = null) {
  const client = getSupabaseClient();
  if (!client || !db) return [];

  try {
    let query = client.from('assignments').select('*');
    if (type) {
      query = query.eq('type', type);
    }
    const { data, error } = await query;
    if (error || !Array.isArray(data)) {
      return [];
    }

    // Merge remote assignments into local SQLite database
    const upsertStmt = db.prepare(`
      INSERT INTO assignments (
        id, type, title, subject, category, professor, department, target_year, target_class,
        created_by, attachments_json, description, instructions, due_date, due_time,
        priority, status, max_marks, meta_json
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        title = excluded.title,
        subject = excluded.subject,
        due_date = excluded.due_date,
        status = excluded.status,
        max_marks = excluded.max_marks,
        attachments_json = excluded.attachments_json
    `);

    db.transaction(() => {
      for (const a of data) {
        upsertStmt.run(
          a.id,
          a.type,
          a.title,
          a.subject,
          a.category || 'General Assignments',
          a.professor,
          a.department,
          a.target_year,
          a.target_class,
          a.created_by,
          typeof a.attachments_json === 'object' ? JSON.stringify(a.attachments_json) : (a.attachments_json || '[]'),
          a.description || '',
          a.instructions || '',
          a.due_date,
          a.due_time || '23:59',
          a.priority || 'Medium',
          a.status || 'Published',
          Number(a.max_marks || 100),
          typeof a.meta_json === 'object' ? JSON.stringify(a.meta_json) : (a.meta_json || '{}')
        );
      }
    })();

    return data;
  } catch (err) {
    return [];
  }
}

/**
 * Push a Student Submission to Supabase
 */
async function pushSubmissionToSupabase(sub) {
  const client = getSupabaseClient();
  if (!client) return { success: false, error: 'Client not configured' };

  try {
    const payload = {
      id: sub.id,
      assignment_id: sub.assignment_id,
      assignment_type: sub.assignment_type || 'faculty',
      student_id: sub.student_id,
      student_name: sub.student_name,
      roll_no: sub.roll_no || '',
      submitted_date: sub.submitted_date || new Date().toISOString(),
      status: sub.status || 'Submitted',
      is_late: sub.is_late ? 1 : 0,
      file_url: sub.file_url || '',
      file_name: sub.file_name || '',
      file_size: Number(sub.file_size || 0),
      remarks: sub.remarks || '',
      marks: sub.marks !== null && sub.marks !== undefined ? Number(sub.marks) : null,
      feedback: sub.feedback || null,
      strengths: sub.strengths || null,
      improvements: sub.improvements || null,
      next_steps: sub.next_steps || null,
      is_revision_requested: sub.is_revision_requested ? 1 : 0,
      published: sub.published !== undefined ? sub.published : 1,
      graded_date: sub.graded_date || null
    };

    const { data, error } = await client.from('submissions').upsert(payload, { onConflict: 'id' });
    if (error) {
      console.warn('[Supabase Sync] Submission upsert notice:', error.message);
      return { success: false, error: error.message };
    }
    return { success: true, data };
  } catch (err) {
    console.warn('[Supabase Sync] Submission push failed:', err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Pull Submissions from Supabase into Local Cache
 */
async function pullSubmissionsFromSupabase(assignmentId = null, db = null) {
  const client = getSupabaseClient();
  if (!client || !db) return [];

  try {
    let query = client.from('submissions').select('*');
    if (assignmentId) {
      query = query.eq('assignment_id', assignmentId);
    }
    const { data, error } = await query;
    if (error || !Array.isArray(data)) {
      return [];
    }

    const upsertStmt = db.prepare(`
      INSERT INTO submissions (
        id, assignment_id, assignment_type, student_id, student_name, roll_no,
        submitted_date, status, is_late, file_url, file_name, file_size, remarks,
        marks, feedback, strengths, improvements, next_steps, is_revision_requested,
        published, graded_date
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        status = excluded.status,
        marks = excluded.marks,
        feedback = excluded.feedback,
        strengths = excluded.strengths,
        improvements = excluded.improvements,
        next_steps = excluded.next_steps,
        graded_date = excluded.graded_date
    `);

    db.transaction(() => {
      for (const s of data) {
        upsertStmt.run(
          s.id,
          s.assignment_id,
          s.assignment_type || 'faculty',
          s.student_id,
          s.student_name,
          s.roll_no || '',
          s.submitted_date,
          s.status || 'Submitted',
          s.is_late ? 1 : 0,
          s.file_url || '',
          s.file_name || '',
          Number(s.file_size || 0),
          s.remarks || '',
          s.marks !== null ? Number(s.marks) : null,
          s.feedback || null,
          s.strengths || null,
          s.improvements || null,
          s.next_steps || null,
          s.is_revision_requested ? 1 : 0,
          s.published ? 1 : 0,
          s.graded_date || null
        );
      }
    })();

    return data;
  } catch (err) {
    return [];
  }
}

/**
 * Push Notification to Supabase
 */
async function pushNotificationToSupabase(notif) {
  const client = getSupabaseClient();
  if (!client) return { success: false };

  try {
    const payload = {
      id: notif.id,
      user_id: notif.user_id,
      target_role: notif.target_role || 'student',
      category: notif.category || 'General',
      type: notif.type || 'info',
      title: notif.title,
      message: notif.message,
      date: notif.date || 'Just now',
      read: notif.read ? 1 : 0,
      action_url: notif.action_url || ''
    };
    await client.from('notifications').upsert(payload, { onConflict: 'id' });
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

module.exports = {
  getSupabaseClient,
  checkSupabaseHealth,
  pushAssignmentToSupabase,
  pullAssignmentsFromSupabase,
  pushSubmissionToSupabase,
  pullSubmissionsFromSupabase,
  pushNotificationToSupabase,
  SUPABASE_URL,
  SUPABASE_ANON_KEY
};
