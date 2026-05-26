# NEXORA Supabase Setup

NEXORA keeps localStorage as the active daily fallback. Supabase is optional and prepared as the cloud backend foundation. This step does not require login, does not force authentication, and does not migrate local data automatically.

## 1. Create A Supabase Project

1. Go to https://supabase.com.
2. Create a new project.
3. Open Project Settings.
4. Copy the Project URL and anon public key.

## 2. Add Environment Variables

Create `.env.local` in the NEXORA project root:

```bash
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```

Restart the Vite dev server after adding or changing these values.

If either value is missing, NEXORA stays in:

```text
Cloud Sync: Offline / Local Mode
```

## 3. Run The Database Schema

1. Open your Supabase project.
2. Go to SQL Editor.
3. Open [supabase/schema.sql](supabase/schema.sql).
4. Copy the full SQL file.
5. Paste it into the SQL Editor.
6. Run the query.

After running the schema, open NEXORA Settings and click:

```text
Test Cloud Database
```

Expected result:

```text
Database Ready
```

If the schema has not been run, the app may show:

```text
Tables Missing
```

If env variables are not set, it will show:

```text
Local Mode
```

## 4. Tables Created

### workspace_systems

Stores saved workspace launch links.

- id uuid primary key
- name text
- category text
- url text
- description text
- icon text
- color text
- tags text[]
- favorite boolean
- pinned boolean
- collection_id uuid
- notes text
- launch_count integer
- last_opened_at timestamptz
- created_at timestamptz
- updated_at timestamptz

### collections

Stores workspace folders and groups.

- id uuid primary key
- name text
- icon text
- color text
- sort_order integer
- created_at timestamptz
- updated_at timestamptz

### insights

Stores future cloud-powered NEXORA INSIGHTS content.

- id uuid primary key
- type text
- title text
- content text
- source_url text
- tags text[]
- active boolean
- created_at timestamptz

### activity_logs

Stores future cloud activity events.

- id uuid primary key
- system_id uuid
- action text
- metadata jsonb
- created_at timestamptz

## 5. updated_at Triggers

The schema includes `update_updated_at_column()` and applies it to:

- `workspace_systems`
- `collections`

This keeps `updated_at` current after edits.

## 6. RLS And Auth Status

Row Level Security is disabled during early development only.

Authentication and RLS policies will be added later before production multi-user use. Do not expose private or sensitive data in this database until auth policies are implemented.

## 7. Current App Behavior

- `src/lib/env.ts` reads Vite env variables.
- `src/lib/supabase.ts` creates the Supabase client only when env variables exist.
- `src/services/workspaceService.ts` contains cloud CRUD functions for:
  - `workspace_systems`
  - `collections`
  - `insights`
  - `activity_logs`
- localStorage remains available as fallback.
- NEXORA can load, create, update, delete, and manually sync workspace systems and collections with Supabase when the database is ready.
- localStorage is still updated as an offline-safe mirror.
- If localStorage has data and the cloud workspace is empty, NEXORA asks before copying local data to Supabase.
- No login is required yet.

## 8. Sync Statuses

NEXORA can show these sync states:

- `Synced`: Supabase is connected and the latest action completed.
- `Syncing`: a cloud action or manual sync is running.
- `Offline`: Supabase is configured but currently unreachable.
- `Local Only`: env variables are missing, so localStorage is active.
- `Error`: a cloud action failed and localStorage remained safe.
