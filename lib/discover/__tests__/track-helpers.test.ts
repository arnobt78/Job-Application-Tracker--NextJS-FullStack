import { describe, expect, it } from 'vitest';
import {
  resolveDiscoverCompanyName,
  resolveTrackLocation,
  cleanDiscoverLocation,
} from '@/lib/discover/track-helpers';

describe('discover track helpers', () => {
  it('resolves company from apply URL when org_id is a UUID', () => {
    const company = resolveDiscoverCompanyName(
      '00035687-6e23-44b3-80f7-6f1d5a422e0b',
      'https://careers.examplecorp.com/jobs/123'
    );
    expect(company).toBe('Examplecorp');
  });

  it('humanizes slug org_id', () => {
    expect(resolveDiscoverCompanyName('stripe-greenhouse', null)).toBe('Stripe');
  });

  it('keeps first location segment and falls back to Unknown', () => {
    expect(
      cleanDiscoverLocation('Remote - TX, El Paso, TX; Remote - GA, GA')
    ).toBe('Remote - TX, El Paso, TX');
    expect(resolveTrackLocation(' ', null)).toBe('Unknown');
    expect(resolveTrackLocation('X', 'United States')).toBe('United States');
  });
});
