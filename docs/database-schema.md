# Database Schema Documentation

## Overview
This document describes the database schema for the Sohail Animation project, including tables, relationships, and data types.

## Tables

### Episodes Table
The main table for storing episode information.

**Table Name:** `episodes`

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | string (UUID) | No | Primary key, auto-generated |
| title | string | No | Episode title |
| description | string | Yes | Episode description |
| status | string | Yes | Episode status (draft, in_progress, completed, etc.) |
| created_at | string (timestamp) | No | Creation timestamp |
| updated_at | string (timestamp) | No | Last update timestamp |

**Relationships:**
- One-to-many with `episode_content` table

### Episode Content Table
Stores different types of content for each episode (text, audio, storyboard, drawings).

**Table Name:** `episode_content`

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | string (UUID) | No | Primary key, auto-generated |
| episode_id | string (UUID) | No | Foreign key to episodes table |
| type | string | No | Content type (text, audio, storyboard, drawing) |
| content | JSON | Yes | Content data stored as JSON |
| created_at | string (timestamp) | No | Creation timestamp |
| updated_at | string (timestamp) | No | Last update timestamp |

**Relationships:**
- Many-to-one with `episodes` table via `episode_id`

**Foreign Key Constraints:**
- `episode_content_episode_id_fkey`: `episode_id` references `episodes.id`

## Content Types

The `episode_content` table uses a flexible JSON structure to store different types of content:

### Text Content
- Scenes with dialogue
- Character information
- Scene descriptions

### Audio Content
- Audio file references
- Timing information
- Voice actor assignments

### Storyboard Content
- Frame sequences
- Visual descriptions
- Camera movements

### Drawing Content
- Artwork references
- Animation frames
- Character designs

## Database Features

### Automatic Timestamps
- Both tables have `created_at` and `updated_at` fields
- Timestamps are automatically managed by database triggers

### UUID Primary Keys
- All tables use UUID primary keys for better scalability
- UUIDs are auto-generated on insert

### JSON Content Storage
- Flexible content storage using PostgreSQL JSON type
- Allows for different content structures per type

## TypeScript Integration

The database schema is automatically converted to TypeScript types:

```typescript
// Main table types
export type Episode = Database['public']['Tables']['episodes']['Row']
export type EpisodeContent = Database['public']['Tables']['episode_content']['Row']

// Insert/Update types for forms
export type EpisodeInsert = Database['public']['Tables']['episodes']['Insert']
export type EpisodeUpdate = Database['public']['Tables']['episodes']['Update']
export type EpisodeContentInsert = Database['public']['Tables']['episode_content']['Insert']
export type EpisodeContentUpdate = Database['public']['Tables']['episode_content']['Update']
```

## Usage Examples

### Creating an Episode
```typescript
const newEpisode: EpisodeInsert = {
  title: "Episode 1",
  description: "First episode of the series",
  status: "draft"
}
```

### Adding Content to Episode
```typescript
const textContent: EpisodeContentInsert = {
  episode_id: "episode-uuid",
  type: "text",
  content: {
    scenes: [
      {
        id: "scene-1",
        dialogue: "Hello world!",
        character: "Main Character"
      }
    ]
  }
}
```

## Database Connection

The project is connected to Supabase with the following configuration:
- Project Reference: `vjnkhusztogvtvaikumw`
- Database URL and keys are stored in environment variables
- TypeScript types are auto-generated from the live database schema