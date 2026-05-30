You are a Staff Software Engineer and Product Architect.

Your task is to create a complete implementation plan for an MVP called "Game Pixelart".

## Product Overview

Game Pixelart is an AI-powered Character Asset System for top-down RPG games (similar to RPG Maker, Stardew Valley, and Pokémon GBA).

The goal of V1 is NOT animation.

The goal of V1 is to generate and store consistent 4-direction pixel-art character sheets.

Users provide a text prompt.

Example:

"Female cyber ninja with red ponytail and katana"

The system should:

1. Convert the prompt into structured Character DNA
2. Generate a 4-direction character sheet

   * Up
   * Down
   * Left
   * Right
3. Store the generated asset
4. Save the Character DNA
5. Provide a Character Library
6. Provide a Character Detail page

Future versions will support:

* Layer extraction
* Sprite packs
* Equipment swapping
* Animation generation
* Rigging

Design the architecture so these features can be added later without major refactoring.

---

## Technical Stack

Frontend:

* Next.js (latest App Router)
* TypeScript
* Tailwind CSS
* shadcn/ui

Backend:

* Next.js Route Handlers
* Server Actions

Database:

* PostgreSQL
* Prisma ORM

Storage:

* Cloudflare R2

Authentication:

* Better Auth

AI:

* OpenAI API

Deployment:

* Vercel

---

## Requirements

Generate a detailed implementation plan with the following sections:

### 1. Product Architecture

Explain:

* Core domain model
* Character lifecycle
* Future scalability strategy

---

### 2. Domain Driven Design

Define:

* Entities
* Value Objects
* Aggregates
* Services

Include TypeScript interfaces.

---

### 3. Database Design

Provide:

* ERD
* Prisma schema
* Index recommendations

---

### 4. Project Structure

Design a scalable feature-based architecture.

Provide a complete folder tree.

Example:

src/
features/
shared/
lib/
app/

Explain responsibilities for each folder.

---

### 5. API Design

Define:

POST /api/characters

GET /api/characters

GET /api/characters/:id

DELETE /api/characters/:id

Include:

* Request body
* Response body
* Error handling

---

### 6. AI Pipeline

Describe:

Prompt
→ Character DNA
→ Image Prompt
→ Character Sheet Generation
→ Storage
→ Database

Include sequence diagrams.

---

### 7. Database Models

Create complete Prisma models for:

* User
* Character
* CharacterAsset
* GenerationJob

Design them with future support for:

* Layers
* Sprite packs
* Animation assets

---

### 8. Frontend Architecture

Define:

Pages
Components
Server Components
Client Components
Server Actions

Explain rendering strategy.

---

### 9. State Management Strategy

Explain:

* Server State
* Client State
* Forms
* Mutations

Recommend libraries.

---

### 10. Background Job Architecture

Design a future-proof job system.

Generation should not block requests.

Include:

* Queue design
* Job lifecycle
* Retry strategy

---

### 11. Storage Strategy

Explain:

* Asset naming
* Folder hierarchy
* Versioning
* Cleanup strategy

Example:

characters/
{characterId}/
sheet.png
metadata.json

---

### 12. Security

Cover:

* Authentication
* Authorization
* Rate limiting
* Prompt abuse prevention
* Asset access

---

### 13. MVP Roadmap

Break implementation into phases:

Phase 1
Foundation

Phase 2
Character Creation

Phase 3
Library

Phase 4
Detail Page

Phase 5
Production Readiness

For each phase include:

* Goals
* Deliverables
* Technical tasks

---

### 14. Future Architecture

Explain how V2 and V3 can support:

Layer Extraction

Character DNA
→ Layer Assets
→ Sprite Pack Generator

Animation Generation

Character DNA
→ Skeleton
→ Sprite Animation

without breaking the V1 architecture.

---

Output should be written like a professional software architecture document suitable for engineering execution.
