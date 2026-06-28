const SITE_URL = 'https://procreal.ci';

export function organizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'EducationalOrganization',
    name: 'PROcréal',
    url: SITE_URL,
    logo: `${SITE_URL}/img/og-default.jpg`,
    sameAs: [
      'https://facebook.com/procreal.ci',
      'https://instagram.com/procreal.ci',
      'https://linkedin.com/company/procreal',
    ],
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Cocody Faya, derrière Playce, Marché Diarrassouba',
      addressLocality: 'Abidjan',
      addressCountry: 'CI',
    },
  };
}

export function localBusinessSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: 'PROcréal',
    image: `${SITE_URL}/img/og-default.jpg`,
    telephone: '+225 07 49 81 76 21',
    email: 'procreal.r@gmail.com',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Cocody Faya, derrière Playce, Marché Diarrassouba',
      addressLocality: 'Abidjan',
      addressCountry: 'CI',
    },
    url: SITE_URL,
  };
}

export function personSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'KOKO Landry',
    jobTitle: 'Fondateur & Formateur principal',
    worksFor: { '@type': 'EducationalOrganization', name: 'PROcréal' },
    url: `${SITE_URL}/a-propos`,
  };
}

export function courseSchema(formation, lang, path) {
  const title = lang === 'en' ? formation.title_en : formation.title;
  const description = lang === 'en' ? formation.description_en : formation.description;
  return {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: title,
    description,
    provider: {
      '@type': 'EducationalOrganization',
      name: 'PROcréal',
      sameAs: SITE_URL,
    },
    hasCourseInstance: {
      '@type': 'CourseInstance',
      courseMode: 'Onsite',
      location: {
        '@type': 'Place',
        name: lang === 'en' ? formation.location_en || formation.location : formation.location,
      },
      ...(formation.startDate ? { startDate: formation.startDate } : {}),
    },
    ...(formation.price
      ? {
          offers: {
            '@type': 'Offer',
            price: formation.price,
            priceCurrency: 'XOF',
            url: `${SITE_URL}${path}`,
          },
        }
      : {}),
  };
}

export function blogPostingSchema(post, path) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    datePublished: post.pubDate.toISOString(),
    author: { '@type': 'Person', name: post.author },
    url: `${SITE_URL}${path}`,
  };
}

export function breadcrumbSchema(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${SITE_URL}${item.url}`,
    })),
  };
}
