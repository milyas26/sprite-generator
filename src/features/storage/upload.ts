import { writeFile, mkdir, rm, readFile } from "fs/promises";
import { join } from "path";

const UPLOADS_DIR = join(process.cwd(), "public", "characters");

export const storageService = {
  async upload(key: string, buffer: Buffer, contentType: string): Promise<string> {
    const filePath = join(UPLOADS_DIR, key);
    const dir = join(filePath, "..");
    await mkdir(dir, { recursive: true });
    await writeFile(filePath, buffer);

    const publicUrl = `/characters/${key}`;
    return publicUrl;
  },

  getPublicUrl(key: string): string {
    return `/characters/${key}`;
  },

  async getBuffer(key: string): Promise<Buffer> {
    const filePath = join(UPLOADS_DIR, key);
    try {
      return await readFile(filePath);
    } catch {
      throw new Error(`File not found: ${key}`);
    }
  },

  async delete(key: string): Promise<void> {
    const filePath = join(UPLOADS_DIR, key);
    try {
      await rm(filePath, { force: true });
    } catch {
      // ignore if not exists
    }
  },

  async deleteDirectory(prefix: string): Promise<void> {
    const dir = join(UPLOADS_DIR, prefix);
    try {
      await rm(dir, { recursive: true, force: true });
    } catch {
      // ignore
    }
  },
};
