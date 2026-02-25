export function PersonJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Sanisetty Manvith",
    url: "https://www.manvith.tech",
    sameAs: [
      "https://github.com/manvith12",
      "https://www.linkedin.com/in/sanisetty-manvith",
    ],
    jobTitle: "Computer Science Student",
    alumniOf: {
      "@type": "CollegeOrUniversity",
      name: "Indian Institute of Information Technology Kottayam",
    },
    knowsAbout: [
      "Web Development",
      "Full-Stack Development",
      "React",
      "Next.js",
      "TypeScript",
      "Quantum Computing",
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function WebSiteJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Sanisetty Manvith — Portfolio",
    url: "https://www.manvith.tech",
    description:
      "Portfolio of Sanisetty Manvith — developer, designer and Computer Science student at IIIT Kottayam.",
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function BreadcrumbJsonLd({
  items,
}: {
  items: { name: string; href: string }[];
}) {
  const data = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: `https://www.manvith.tech${item.href}`,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
