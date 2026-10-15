/** Fictional hiring companies for the Discover catalog — names must not collide with real employers. */
export type SeedCompany = {
  slug: string;
  name: string;
  size: string;
  industry: string;
  hq: string;
};

export const SEED_COMPANIES: SeedCompany[] = [
  { slug: 'northwind-labs', name: 'Northwind Labs', size: '201-500', industry: 'Software Development', hq: 'San Francisco, CA' },
  { slug: 'brightpath-health', name: 'Brightpath Health', size: '1001-5000', industry: 'Healthcare Technology', hq: 'Boston, MA' },
  { slug: 'cobalt-ledger', name: 'Cobalt Ledger', size: '51-200', industry: 'Financial Services', hq: 'New York, NY' },
  { slug: 'maple-grid-energy', name: 'Maple Grid Energy', size: '501-1000', industry: 'Clean Energy', hq: 'Toronto, ON' },
  { slug: 'harbor-freightworks', name: 'Harbor Freightworks', size: '1001-5000', industry: 'Logistics', hq: 'Seattle, WA' },
  { slug: 'lumen-analytics', name: 'Lumen Analytics', size: '51-200', industry: 'Data & Analytics', hq: 'Austin, TX' },
  { slug: 'pinecrest-robotics', name: 'Pinecrest Robotics', size: '201-500', industry: 'Robotics', hq: 'Boston, MA' },
  { slug: 'tidewater-media', name: 'Tidewater Media', size: '501-1000', industry: 'Media & Entertainment', hq: 'Los Angeles, CA' },
  { slug: 'quill-education', name: 'Quill Education', size: '11-50', industry: 'Education Technology', hq: 'Chicago, IL' },
  { slug: 'summit-cloudworks', name: 'Summit Cloudworks', size: '1001-5000', industry: 'Cloud Infrastructure', hq: 'Seattle, WA' },
  { slug: 'aurora-bioinformatics', name: 'Aurora Bioinformatics', size: '201-500', industry: 'Biotechnology', hq: 'San Diego, CA' },
  { slug: 'redwood-retail', name: 'Redwood Retail Co', size: '5001-10000', industry: 'E-commerce', hq: 'Denver, CO' },
  { slug: 'glacier-security', name: 'Glacier Security', size: '201-500', industry: 'Cybersecurity', hq: 'Vancouver, BC' },
  { slug: 'orbit-mobility', name: 'Orbit Mobility', size: '501-1000', industry: 'Transportation', hq: 'Austin, TX' },
  { slug: 'fernway-studios', name: 'Fernway Studios', size: '11-50', industry: 'Design Services', hq: 'Montreal, QC' },
];
