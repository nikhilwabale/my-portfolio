import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './globals.css';
import { site } from '@/lib/site';


export const metadata: Metadata = {
  metadataBase: new URL(site.seo.url),
  title: {
    default: site.seo.title,
    template: `%s | ${site.name}`
  },
  description: site.seo.description,
  applicationName: `${site.name} Portfolio`,
  keywords: [
    'Nikhil Wabale',
    'Full Stack Developer Pune',
    'React Developer Pune',
    'Next.js Developer',
    'Angular Developer',
    'Spring Boot Developer',
    'Java Developer',
    'SQL Server Developer',
    'Freelance Web Developer India',
    'Portfolio Developer'
  ],
  authors: [{ name: site.name, url: site.seo.url }],
  creator: site.name,
  alternates: { canonical: site.seo.url },
  openGraph: {
    title: site.seo.title,
    description: site.seo.description,
    url: site.seo.url,
    siteName: `${site.name} Portfolio`,
    locale: 'en_IN',
    type: 'profile',
    images: [{ url: site.seo.image, width: 1200, height: 630, alt: `${site.name} Full Stack Developer Portfolio` }]
  },
  twitter: {
    card: 'summary_large_image',
    title: site.seo.title,
    description: site.seo.description,
    images: [site.seo.image]
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1, 'max-video-preview': -1 }
  },
  category: 'technology'
};

export default function RootLayout({ children }: { children: ReactNode }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: site.name,
    jobTitle: site.role,
    address: site.location,
    email: site.email,
    url: site.seo.url,
    image: `${site.seo.url}${site.seo.image}`,
    sameAs: [site.socials.github, site.socials.linkedin, site.socials.x],
    knowsAbout: ['React.js', 'Next.js', 'Angular', 'Java', 'Spring Boot', 'SQL Server', 'Flutter', 'Freelance Web Development', 'REST APIs', 'JWT Authentication'],
    makesOffer: [
      { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Full Stack Web Development' } },
      { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Freelance Landing Page Development' } },
      { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Spring Boot API Development' } }
    ]
  };

  return (
    <html lang="en">
      <body>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        {children}
      </body>
    </html>
  );
}
