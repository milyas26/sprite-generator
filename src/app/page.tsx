import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-background workshop-grid">
      <header className="border-b border-border bg-background/90 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center shadow-sm shadow-primary/20">
              <span className="text-primary-foreground text-[11px] font-bold font-mono tracking-tighter">
                SP
              </span>
            </div>
            <span className="text-lg font-bold text-foreground font-heading tracking-tight">
              Sprite Pixelart
            </span>
          </div>
          <Link href="/dashboard">
            <Button className="bg-primary hover:bg-primary/85 text-primary-foreground border-0 shadow-sm shadow-primary/20">
              Open App
            </Button>
          </Link>
        </div>
      </header>

      <main className="flex-1">
        <section className="container mx-auto px-4 py-32 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/3 blur-3xl pointer-events-none" />

          <div className="relative">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/25 bg-primary/5 text-accent-foreground text-sm mb-10">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-warm-pulse absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary" />
              </span>
              AI Sprite Generator
            </div>

            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8 font-heading leading-none">
              <span className="text-foreground">Create </span>
              <span className="text-primary">Pixel Art</span>
              <br />
              <span className="text-foreground">Character Sheets</span>
            </h1>

            <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-12 leading-relaxed">
              Describe your RPG character and AI generates a complete 4-direction
              sprite sheet. Ready for RPG Maker, Godot, Unity, or any game engine.
            </p>

            <div className="flex gap-4 justify-center">
              <Link href="/dashboard/sprites/new">
                <Button
                  size="lg"
                  className="bg-primary hover:bg-primary/85 text-primary-foreground text-base px-8 py-6 rounded-xl shadow-lg shadow-primary/20 border-0 font-heading font-semibold"
                >
                  New Character
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button
                  size="lg"
                  variant="outline"
                  className="text-base px-8 py-6 rounded-xl border-border hover:bg-secondary hover:text-foreground font-heading font-semibold"
                >
                  Browse Library
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 pb-24">
          <div className="border-t border-border pt-20">
            <h2 className="text-center text-sm text-muted-foreground font-mono tracking-widest mb-12 uppercase">
              How it works
            </h2>
            <div className="grid md:grid-cols-3 gap-px max-w-4xl mx-auto bg-border rounded-2xl overflow-hidden">
              <StepCard
                step="01"
                title="Describe"
                icon={
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                  </svg>
                }
                description="Type a prompt like &quot;cyber ninja with red ponytail and katana&quot;. AI extracts structured Character DNA."
                color="primary"
              />
              <StepCard
                step="02"
                title="Generate"
                icon={
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
                  </svg>
                }
                description="GPT-4 structures the design. DALL-E 3 renders a 4-direction sprite sheet with front, back, and side views."
                color="chart-2"
              />
              <StepCard
                step="03"
                title="Export"
                icon={
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                  </svg>
                }
                description="Download your sprite sheet as a transparent PNG. Drop it into any game engine or pixel art tool."
                color="chart-5"
              />
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">
        <div className="container mx-auto px-4">
          Sprite Pixelart — AI Character Asset System for RPG Games
        </div>
      </footer>
    </div>
  );
}

const stepColorMap: Record<string, { bg: string; text: string }> = {
  primary: { bg: "bg-primary/10", text: "text-primary" },
  "chart-2": { bg: "bg-[#7EB8A2]/10", text: "text-[#7EB8A2]" },
  "chart-5": { bg: "bg-[#5AA87A]/10", text: "text-[#5AA87A]" },
};

function StepCard({
  step,
  title,
  icon,
  description,
  color,
}: {
  step: string;
  title: string;
  icon: React.ReactNode;
  description: string;
  color: string;
}) {
  const c = stepColorMap[color] ?? stepColorMap.primary;
  return (
    <div className="group bg-card p-8 flex flex-col items-center text-center relative overflow-hidden transition-all duration-300 hover:bg-secondary">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-110 ${c.bg} ${c.text}`}>
        {icon}
      </div>
      <div className="text-xs text-muted-foreground font-mono mb-2 tracking-widest">
        {step}
      </div>
      <h3 className="text-foreground font-heading font-semibold text-lg mb-3">
        {title}
      </h3>
      <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">
        {description}
      </p>
    </div>
  );
}
