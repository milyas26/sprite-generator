-- CreateEnum
CREATE TYPE "CharacterStatus" AS ENUM ('DRAFT', 'DNA_READY', 'GENERATING', 'READY', 'FAILED');

-- CreateEnum
CREATE TYPE "JobType" AS ENUM ('DNA_EXTRACTION', 'SHEET_GENERATION', 'COMPOSITE');

-- CreateEnum
CREATE TYPE "JobStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "AssetType" AS ENUM ('SHEET', 'LAYER', 'SPRITE', 'ANIMATION_FRAME');

-- CreateEnum
CREATE TYPE "DirectionEnum" AS ENUM ('UP', 'DOWN', 'LEFT', 'RIGHT');

-- CreateTable
CREATE TABLE "characters" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "dna" JSONB NOT NULL,
    "status" "CharacterStatus" NOT NULL DEFAULT 'DRAFT',
    "sheetUrl" TEXT,
    "sheetKey" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "characters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "character_assets" (
    "id" TEXT NOT NULL,
    "character_id" TEXT NOT NULL,
    "type" "AssetType" NOT NULL DEFAULT 'SHEET',
    "direction" "DirectionEnum",
    "layer_name" TEXT,
    "url" TEXT NOT NULL,
    "storage_key" TEXT NOT NULL,
    "mime_type" TEXT NOT NULL DEFAULT 'image/png',
    "width" INTEGER NOT NULL DEFAULT 0,
    "height" INTEGER NOT NULL DEFAULT 0,
    "file_size" INTEGER NOT NULL DEFAULT 0,
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "character_assets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "generation_jobs" (
    "id" TEXT NOT NULL,
    "character_id" TEXT NOT NULL,
    "type" "JobType" NOT NULL,
    "status" "JobStatus" NOT NULL DEFAULT 'PENDING',
    "input" JSONB NOT NULL DEFAULT '{}',
    "output" JSONB,
    "error" TEXT,
    "metrics" JSONB,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "max_attempts" INTEGER NOT NULL DEFAULT 3,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "started_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),

    CONSTRAINT "generation_jobs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "characters_status_idx" ON "characters"("status");

-- CreateIndex
CREATE INDEX "characters_created_at_idx" ON "characters"("created_at" DESC);

-- CreateIndex
CREATE INDEX "character_assets_character_id_type_idx" ON "character_assets"("character_id", "type");

-- CreateIndex
CREATE INDEX "character_assets_character_id_direction_idx" ON "character_assets"("character_id", "direction");

-- CreateIndex
CREATE INDEX "generation_jobs_status_created_at_idx" ON "generation_jobs"("status", "created_at");

-- CreateIndex
CREATE INDEX "generation_jobs_character_id_type_idx" ON "generation_jobs"("character_id", "type");

-- AddForeignKey
ALTER TABLE "character_assets" ADD CONSTRAINT "character_assets_character_id_fkey" FOREIGN KEY ("character_id") REFERENCES "characters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "generation_jobs" ADD CONSTRAINT "generation_jobs_character_id_fkey" FOREIGN KEY ("character_id") REFERENCES "characters"("id") ON DELETE CASCADE ON UPDATE CASCADE;
