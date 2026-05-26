# NEXORA Supabase Setup

NEXORA currently keeps localStorage as the daily-use fallback. Supabase is prepared as the cloud backend foundation, but data migration and authentication are intentionally not forced yet.

## 1. Create a Supabase Project

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

If either variable is missing, NEXORA stays in:

```text
Cloud Sync: Offline / Local Mode
```

## 3. Database Tables For The Next Step

These tables are placeholders for the upcoming cloud migration.

### workspace_systems

- id text primary key
- name text not null
- category text not null
- url text not null
- description text
- notes text
- icon text
- color text
- favorite boolean
- pinned boolean
- recent boolean
- tags text[]
- collectionId text
- favoriteOrder integer
- pinnedOrder integer
- editedAt timestamptz
- openCount integer
- createdAt timestamptz
- openedAt timestamptz
- user_id uuid nullable
- updated_at timestamptz nullable

### collections

- id text primary key
- name text not null
- color text
- order integer
- user_id uuid nullable
- created_at timestamptz nullable
- updated_at timestamptz nullable

### insights

- id text primary key
- kind text not null
- title text not null
- description text
- action text
- color text
- created_at timestamptz

### activity_logs

- id text primary key
- action text not null
- system_id text nullable
- metadata jsonb nullable
- user_id uuid nullable
- created_at timestamptz

## 4. Current Behavior

- `src/lib/env.ts` reads the Vite env variables.
- `src/lib/supabase.ts` creates the Supabase client only when env variables exist.
- `src/services/workspaceService.ts` contains the first service functions.
- localStorage remains the active fallback.
- No login or authentication is required yet.
- No automatic migration runs yet.

