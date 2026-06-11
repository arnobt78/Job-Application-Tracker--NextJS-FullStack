import {
  AUTHOR,
  DEFAULT_DESCRIPTION,
  SITE_NAME,
  SITE_URL,
} from "@/lib/site-metadata";

export default function JsonLd() {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        "@id": `${SITE_URL}/#webapp`,
        name: SITE_NAME,
        url: SITE_URL,
        description: DEFAULT_DESCRIPTION,
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
        },
        author: {
          "@type": "Person",
          name: AUTHOR.name,
          url: AUTHOR.url,
          email: AUTHOR.email,
        },
        creator: {
          "@type": "Person",
          name: AUTHOR.name,
          url: AUTHOR.url,
          email: AUTHOR.email,
        },
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: SITE_URL,
        name: SITE_NAME,
        description: DEFAULT_DESCRIPTION,
        publisher: {
          "@type": "Person",
          name: AUTHOR.name,
          url: AUTHOR.url,
        },
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
