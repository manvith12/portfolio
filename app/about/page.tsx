import type { Metadata } from "next";
import Link from "next/link";
import { BreadcrumbJsonLd } from "@/components/seo/JsonLd";

export const metadata: Metadata = {
  title: "About Sanisetty Manvith | Developer & CS Student at IIIT Kottayam",
  description:
    "Learn more about Sanisetty Manvith — full-stack developer, open-source contributor and Computer Science student at Indian Institute of Information Technology Kottayam.",
  alternates: {
    canonical: "/about",
  },
  openGraph: {
    title: "About Sanisetty Manvith | Developer & CS Student at IIIT Kottayam",
    description:
      "Learn more about Sanisetty Manvith — full-stack developer, open-source contributor and CS student at IIIT Kottayam.",
    url: "https://www.manvith.tech/about",
    type: "profile",
  },
};

export default function AboutPage() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", href: "/" },
          { name: "About", href: "/about" },
        ]}
      />

      <main className="mx-auto max-w-3xl px-6 py-20 text-white">
        {/* Navigation back */}
        <nav className="mb-12">
          <Link
            href="/"
            className="text-sm text-white/60 hover:text-white transition-colors"
          >
            &larr; Back to Home
          </Link>
        </nav>

        {/* H1 — primary keyword */}
        <h1 className="text-4xl font-bold mb-6 md:text-5xl">
          About Sanisetty Manvith
        </h1>

        {/* Intro */}
        <section className="space-y-5 text-lg leading-relaxed text-white/90">
          <p>
            Hi, I&rsquo;m <strong>Sanisetty Manvith</strong> — a full-stack developer,
            designer, and Computer Science student at the{" "}
            <strong>Indian Institute of Information Technology Kottayam</strong>{" "}
            (IIIT Kottayam). I build polished, high-performance web experiences
            with modern tools like React, Next.js, TypeScript, and Three.js.
          </p>

          <p>
            My work sits at the intersection of design and engineering. Whether
            it&rsquo;s crafting smooth scroll-driven animations, building accessible
            component systems, or optimising render pipelines for 60&nbsp;fps on
            mobile — I care about the details that make software feel alive.
          </p>
        </section>

        {/* Academic Background */}
        <h2 className="text-2xl font-semibold mt-14 mb-4">
          Academic Background
        </h2>
        <section className="space-y-4 text-lg leading-relaxed text-white/90">
          <p>
            I&rsquo;m currently pursuing a B.Tech in Computer Science &amp; Engineering at{" "}
            <strong>IIIT Kottayam</strong>, where I&rsquo;ve developed a strong
            foundation in algorithms, data structures, systems programming, and
            web technologies. Beyond coursework, I actively explore quantum
            computing concepts and their potential applications in optimisation
            problems.
          </p>
        </section>

        {/* Technical Stack */}
        <h2 className="text-2xl font-semibold mt-14 mb-4">Technical Stack</h2>
        <section className="space-y-4 text-lg leading-relaxed text-white/90">
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Languages:</strong> TypeScript, JavaScript, Python, C/C++,
              SQL
            </li>
            <li>
              <strong>Frontend:</strong> React, Next.js, Tailwind CSS, GSAP,
              Three.js, Framer Motion
            </li>
            <li>
              <strong>Backend:</strong> Node.js, Express, REST APIs
            </li>
            <li>
              <strong>Tools &amp; Platforms:</strong> Git, Vercel, Figma, Linux
            </li>
            <li>
              <strong>Interests:</strong> Creative coding, animation engineering,
              quantum computing, open-source
            </li>
          </ul>
        </section>

        {/* Projects */}
        <h2 className="text-2xl font-semibold mt-14 mb-4">
          Projects &amp; Work
        </h2>
        <section className="space-y-4 text-lg leading-relaxed text-white/90">
          <p>
            As <strong>Manvith S</strong>, I&rsquo;ve built and shipped projects
            ranging from interactive portfolio experiences (the site you&rsquo;re on
            right now) to full-stack web applications. I focus on fast,
            accessible, and visually compelling products. Key highlights include:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              This portfolio — featuring a 42-frame scroll-driven folder
              animation, LRU frame caching, and responsive design with GSAP
              scroll triggers.
            </li>
            <li>
              Open-source contributions and experimental creative-coding
              projects exploring WebGL and shader art.
            </li>
          </ul>
        </section>

        {/* Vision */}
        <h2 className="text-2xl font-semibold mt-14 mb-4">Vision</h2>
        <section className="space-y-4 text-lg leading-relaxed text-white/90">
          <p>
            I believe great software should be invisible — it should feel
            natural, responsive, and delightful. My goal is to push the
            boundaries of what&rsquo;s possible on the web while keeping
            accessibility and performance as first-class priorities.
          </p>
          <p>
            Whether you&rsquo;re a recruiter, fellow developer, or just browsing —
            thanks for visiting.{" "}
            <strong>Sanisetty Manvith</strong> is always open to collaboration,
            conversation, and new challenges.
          </p>
        </section>

        {/* Footer link back */}
        <footer className="mt-20 border-t border-white/10 pt-8 text-sm text-white/50">
          <p>
            &copy; {new Date().getFullYear()}{" "}
            <Link href="/" className="hover:text-white transition-colors">
              Sanisetty Manvith
            </Link>{" "}
            &middot;{" "}
            <Link href="/" className="hover:text-white transition-colors">
              manvith.tech
            </Link>
          </p>
        </footer>
      </main>
    </>
  );
}
