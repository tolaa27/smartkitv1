# SmartKids Supabase Configuration & Schema Guide

This directory contains the database setup and SQL schema for **SmartKids (កុមារឆ្លាត)**.

## 1. Quick Setup in Supabase Dashboard

1. Log into your Supabase Dashboard: [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Go to your project or create a new project named **SmartKids**.
3. Navigate to **SQL Editor** in the left sidebar.
4. Copy the entire contents of [`supabase/schema.sql`](./schema.sql) and paste it into the SQL editor.
5. Click **Run**. This will:
   - Create tables: `profiles`, `grades`, `documents`
   - Configure Row Level Security (RLS) policies for Teachers (full access) and Students (read-only for their assigned grade)
   - Create the `class-documents` storage bucket with public read and teacher upload policies
   - Seed default classes (Preschool, Grade 1, Grade 2, Grade 3) and sample lesson documents.

## 2. Environment Variables Configuration

Copy `.env.example` to `.env.local` and add your project credentials from **Project Settings -> API**:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here # Optional for server tasks

# Google Gemini AI Configuration
GEMINI_API_KEY=your-gemini-key
GEMINI_MODEL=gemini-2.5-flash
```

## 3. Database Schema Overview

| Table | Columns | Description |
|---|---|---|
| `profiles` | `id`, `full_name`, `role` (`'teacher'` or `'student'`), `pin_code`, `avatar_url`, `grade_id`, `created_at` | User profiles with role & student 4-digit PIN |
| `grades` | `id`, `name`, `description`, `teacher_id`, `created_at` | Class/grade management (Grade 1, Grade 2, Preschool, etc.) |
| `documents` | `id`, `grade_id`, `uploaded_by`, `title`, `description`, `subject` (`'khmer'`, `'math'`, `'science'`), `file_url`, `file_type`, `ocr_text`, `created_at` | Lesson files, camera captures, and PDF worksheets |

## 4. Storage Bucket

- **Bucket Name**: `class-documents`
- **Visibility**: Public read
- **Max file size**: 20MB
- **Supported types**: JPG, PNG, WebP, GIF, PDF
