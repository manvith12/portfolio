import { Hero } from "@/components/landing";
import { SpeedInsights } from "@vercel/speed-insights/next"

export default function Home() {
  return (
    <main className="min-h-screen w-full bg-[#1828c3]">
      <Hero />
    </main>
  );
}
