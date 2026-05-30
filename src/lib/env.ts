import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  OPENAI_API_KEY: z.string().min(1),
  OPENAI_MODEL: z.string().default("gpt-4o"),
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
  CRON_API_SECRET: z.string().min(16),
});

type Env = z.infer<typeof envSchema>;

let _env: Env | null = null;

export function getEnv(): Env {
  if (_env) return _env;

  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    const errors = parsed.error.flatten().fieldErrors;
    console.error("Invalid environment variables:", errors);
    throw new Error(`Invalid environment variables: ${Object.keys(errors).join(", ")}`);
  }
  _env = parsed.data;
  return _env;
}

export const env = new Proxy({} as Env, {
  get(_, prop) {
    return getEnv()[prop as keyof Env];
  },
});
