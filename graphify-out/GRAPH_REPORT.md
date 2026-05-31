# Graph Report - game-pixelart  (2026-05-31)

## Corpus Check
- 132 files · ~44,875 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 735 nodes · 1684 edges · 40 communities (33 shown, 7 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `41ce662d`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 19|Community 19]]
- [[_COMMUNITY_Community 20|Community 20]]
- [[_COMMUNITY_Community 21|Community 21]]
- [[_COMMUNITY_Community 22|Community 22]]
- [[_COMMUNITY_Community 23|Community 23]]
- [[_COMMUNITY_Community 24|Community 24]]
- [[_COMMUNITY_Community 25|Community 25]]
- [[_COMMUNITY_Community 26|Community 26]]
- [[_COMMUNITY_Community 27|Community 27]]
- [[_COMMUNITY_Community 28|Community 28]]
- [[_COMMUNITY_Community 29|Community 29]]
- [[_COMMUNITY_Community 30|Community 30]]
- [[_COMMUNITY_Community 31|Community 31]]
- [[_COMMUNITY_Community 32|Community 32]]
- [[_COMMUNITY_Community 33|Community 33]]
- [[_COMMUNITY_Community 34|Community 34]]
- [[_COMMUNITY_Community 35|Community 35]]
- [[_COMMUNITY_Community 36|Community 36]]
- [[_COMMUNITY_Community 37|Community 37]]

## God Nodes (most connected - your core abstractions)
1. `cn()` - 51 edges
2. `Button()` - 41 edges
3. `Card()` - 20 edges
4. `CardContent()` - 20 edges
5. `compilerOptions` - 16 edges
6. `Character` - 16 edges
7. `CardTitle()` - 16 edges
8. `Requirements` - 15 edges
9. `SignInForm()` - 14 edges
10. `SignUpForm()` - 14 edges

## Surprising Connections (you probably didn't know these)
- `POST()` --calls--> `rateLimit()`  [EXTRACTED]
  src/app/api/assets/route.ts → src/lib/rate-limit.ts
- `RiggedSpriteAssetData` --references--> `BodyPartName`  [EXTRACTED]
  src/features/rigged-sprites/components/body-part-viewer.tsx → src/features/rigged-sprites/types.ts
- `EditorLayoutProps` --references--> `Character`  [EXTRACTED]
  src/features/editor/components/editor-layout.tsx → src/features/sprites/types.ts
- `SpriteWorkspace()` --calls--> `cn()`  [EXTRACTED]
  src/features/editor/components/sprite-workspace.tsx → src/lib/utils.ts
- `CardAction()` --calls--> `cn()`  [EXTRACTED]
  src/components/ui/card.tsx → src/lib/utils.ts

## Communities (40 total, 7 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.15
Nodes (17): stepColorMap, authClient, SignInForm(), SignUpForm(), ANIMATION_LABELS, DIRECTION_ORDER, getAnimationName(), SpritePackViewer() (+9 more)

### Community 1 - "Community 1"
Cohesion: 0.05
Nodes (62): ArtStyle, CharacterDNA, DetailLevel, CharacterExplorerProps, EditorToolbarProps, SpriteWorkspace(), SpriteWorkspaceProps, generateAssetSheet() (+54 more)

### Community 2 - "Community 2"
Cohesion: 0.06
Nodes (45): auth, getCurrentUserId(), getSession(), requireAuth(), deleteCharacter(), getCharacter(), createEmptyDNA(), characterRepository (+37 more)

### Community 3 - "Community 3"
Cohesion: 0.07
Nodes (30): dependencies, @aws-sdk/client-s3, @aws-sdk/s3-request-presigner, @base-ui/react, better-auth, @better-auth/prisma-adapter, bullmq, class-variance-authority (+22 more)

### Community 4 - "Community 4"
Cohesion: 0.31
Nodes (7): CharacterSheetViewer(), CharacterSheetViewerProps, LogoutButton(), NewCharacterButton(), NewCharacterButtonProps, Button(), buttonVariants

### Community 5 - "Community 5"
Cohesion: 0.09
Nodes (21): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+13 more)

### Community 6 - "Community 6"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 7 - "Community 7"
Cohesion: 0.12
Nodes (22): BUILDS, CLASSES, CreateRiggedSpriteDialogProps, EYE_COLORS, GENDERS, HEIGHTS, POVS, RACES (+14 more)

### Community 8 - "Community 8"
Cohesion: 0.15
Nodes (12): eslintConfig, devDependencies, eslint, eslint-config-next, tailwindcss, @tailwindcss/postcss, tsx, @types/node (+4 more)

### Community 9 - "Community 9"
Cohesion: 0.25
Nodes (7): computedHash, skillPath, source, sourceType, skills, frontend-design, version

### Community 10 - "Community 10"
Cohesion: 0.25
Nodes (6): bricolage, dmSans, geistMono, geistSans, metadata, Providers()

### Community 11 - "Community 11"
Cohesion: 0.50
Nodes (4): create-next-app, Geist font family, next/font, Next.js

### Community 17 - "Community 17"
Cohesion: 0.05
Nodes (47): deleteAsset(), getAsset(), getAssets(), regenerateAsset(), AssetsGridWrapper(), categoryLabels, statusConfig, assetRepository (+39 more)

### Community 18 - "Community 18"
Cohesion: 0.08
Nodes (30): EditorLayout(), EditorLayoutProps, ANIMATION_META, GeneratedPacksList(), getAnimationName(), Props, MasterPreview(), Props (+22 more)

### Community 19 - "Community 19"
Cohesion: 0.14
Nodes (20): createAsset(), ASSET_CATEGORIES, CreateAssetDialogProps, HAIR_COLORS, HAIR_STYLES, POV, BUILDS, CLASSES (+12 more)

### Community 20 - "Community 20"
Cohesion: 0.09
Nodes (23): BodyPartViewer(), BodyPartViewerProps, partIcons, partLabels, RiggedSpriteAssetData, RiggedSpriteEditorPage(), DeleteRiggedSpriteButton(), RiggedSpriteDetailPage() (+15 more)

### Community 21 - "Community 21"
Cohesion: 0.13
Nodes (18): statusDot, CharacterInspector(), CharacterInspectorProps, PropertyRow(), statusConfig, CreateSpriteDialog(), EditorToolbar(), cn() (+10 more)

### Community 22 - "Community 22"
Cohesion: 0.16
Nodes (15): LayersPanel(), LayersPanelProps, PART_ICONS, PART_LABELS, RiggedCanvas(), RiggedCanvasProps, useBodyPartImages(), deepCloneOffsets() (+7 more)

### Community 23 - "Community 23"
Cohesion: 0.13
Nodes (13): enhancePromptSchema, POST(), RATE_LIMITS, now, rateLimit(), store, POST(), characterService (+5 more)

### Community 24 - "Community 24"
Cohesion: 0.18
Nodes (15): buildBodyPartGenerationPrompt(), generateBodyPartSheet(), callOpenAI(), extractRiggedSpriteDNA(), processBodyParts(), GENERATION_PART_ORDER, riggedGenerationPipeline, RiggedGenerationResult (+7 more)

### Community 25 - "Community 25"
Cohesion: 0.16
Nodes (9): ProcessJobsButton(), processNextJobAction(), retryFailedJob(), processNextJob(), Env, envSchema, POST(), globalForR2 (+1 more)

### Community 26 - "Community 26"
Cohesion: 0.11
Nodes (17): 10. Background Job Architecture, 11. Storage Strategy, 12. Security, 13. MVP Roadmap, 14. Future Architecture, 1. Product Architecture, 2. Domain Driven Design, 3. Database Design (+9 more)

### Community 27 - "Community 27"
Cohesion: 0.15
Nodes (15): enqueueRiggedSpriteJob(), riggedSpriteRepository, ANIMATION_DEFAULTS, ANIMATION_TYPES, AnimationType, BODY_PART_NAMES, CharacterStyleInput, CreateRiggedSpriteInput (+7 more)

### Community 28 - "Community 28"
Cohesion: 0.20
Nodes (8): RiggedSpriteGrid(), SearchBar(), statuses, StatusFilter(), useDebounce(), getRiggedSprites(), RiggedSpriteGridWrapper(), Skeleton()

### Community 29 - "Community 29"
Cohesion: 0.15
Nodes (11): BUILDS, CLASSES, CreateSpriteDialogProps, EYE_COLORS, GENDERS, HAIR_COLORS, HAIR_STYLES, HEIGHTS (+3 more)

### Community 30 - "Community 30"
Cohesion: 0.15
Nodes (10): createRiggedSprite(), POV, BUILDS, CLASSES, EYE_COLORS, GENDERS, HEIGHTS, POVS (+2 more)

### Community 31 - "Community 31"
Cohesion: 0.21
Nodes (11): getNow(), getPhaseIndex(), JobData, jobDescriptions, jobLabels, PhaseInfo, phases, PipelinePhase (+3 more)

### Community 32 - "Community 32"
Cohesion: 0.29
Nodes (8): CreateRiggedSpriteDialog(), RiggedEmptyState(), RiggedSpriteCard(), RiggedSpriteCardProps, statusConfig, RiggedSpriteGridProps, PaginatedResult, RiggedSprite

### Community 33 - "Community 33"
Cohesion: 0.22
Nodes (8): name, private, scripts, build, dev, lint, start, version

### Community 34 - "Community 34"
Cohesion: 0.32
Nodes (7): buildDefaultRigging(), createEmptyRiggedDNA(), DEFAULT_RIGGING_Z_ORDER, DEFAULT_Z_ORDER, emptyBodyPart(), CORE_BODY_PARTS, OPTIONAL_BODY_PARTS

### Community 35 - "Community 35"
Cohesion: 0.40
Nodes (4): code:bash (npm run dev), Deploy on Vercel, Getting Started, Learn More

## Knowledge Gaps
- **273 isolated node(s):** `version`, `source`, `sourceType`, `skillPath`, `computedHash` (+268 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **7 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Button()` connect `Community 4` to `Community 0`, `Community 32`, `Community 2`, `Community 7`, `Community 17`, `Community 18`, `Community 19`, `Community 20`, `Community 21`, `Community 22`, `Community 25`, `Community 28`, `Community 29`, `Community 30`, `Community 31`?**
  _High betweenness centrality (0.047) - this node is a cross-community bridge._
- **Why does `cn()` connect `Community 21` to `Community 0`, `Community 1`, `Community 2`, `Community 4`, `Community 7`, `Community 17`, `Community 19`, `Community 28`?**
  _High betweenness centrality (0.026) - this node is a cross-community bridge._
- **Why does `Card()` connect `Community 0` to `Community 32`, `Community 2`, `Community 17`, `Community 19`, `Community 20`, `Community 21`, `Community 30`, `Community 31`?**
  _High betweenness centrality (0.017) - this node is a cross-community bridge._
- **What connects `version`, `source`, `sourceType` to the rest of the system?**
  _274 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.05346164127238706 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.05632360471070148 - nodes in this community are weakly interconnected._
- **Should `Community 3` be split into smaller, more focused modules?**
  _Cohesion score 0.06666666666666667 - nodes in this community are weakly interconnected._