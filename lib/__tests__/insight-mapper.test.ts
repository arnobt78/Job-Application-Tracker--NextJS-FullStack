import { describe, expect, it } from 'vitest';
import {
  FIT_LABEL_TEXT,
  fitLabelFromScore,
  insightToPipelineResponse,
  pipelineResultToInsight,
} from '@/lib/ai/insight-mapper';
import type { PipelineResponse } from '@/lib/ai/pipeline-client';
import type { AIInsightType } from '@/utils/types';

const RESULT: PipelineResponse = {
  job_id: 'job-1',
  fit_score: { score: 82, reasoning: 'Strong backend match with payments experience.' },
  cover_letter: { text: 'Dear hiring team,', word_count: 3 },
  interview_angles: [
    { question: 'Tell me about scale', angle: 'Use the payments example' },
    { question: 'Why us?', angle: '' },
  ],
  summary: 'Great fit.',
  meta: {},
};

describe('fitLabelFromScore', () => {
  it.each([
    [100, 'strong_fit'],
    [75, 'strong_fit'],
    [74, 'good_fit'],
    [60, 'good_fit'],
    [59, 'partial_fit'],
    [40, 'partial_fit'],
    [39, 'poor_fit'],
    [0, 'poor_fit'],
  ] as const)('maps %i to %s', (score, label) => {
    expect(fitLabelFromScore(score)).toBe(label);
  });

  it('returns null for missing or invalid scores', () => {
    expect(fitLabelFromScore(null)).toBeNull();
    expect(fitLabelFromScore(undefined)).toBeNull();
    expect(fitLabelFromScore(Number.NaN)).toBeNull();
  });
});

describe('pipelineResultToInsight', () => {
  it('maps the nested Python result into insight columns', () => {
    expect(pipelineResultToInsight(RESULT)).toEqual({
      fitScore: 82,
      fitLabel: 'strong_fit',
      summary: 'Great fit.',
      coverLetter: 'Dear hiring team,',
      interviewAngles: ['Tell me about scale: Use the payments example', 'Why us?'],
      redFlags: [],
    });
  });

  it('stores a fit label, never the reasoning text', () => {
    expect(pipelineResultToInsight(RESULT).fitLabel).not.toContain('backend');
  });

  it('tolerates a partial callback payload', () => {
    expect(pipelineResultToInsight({ summary: 'Only summary' })).toEqual({
      fitScore: null,
      fitLabel: null,
      summary: 'Only summary',
      coverLetter: null,
      interviewAngles: [],
      redFlags: [],
    });
  });
});

describe('insightToPipelineResponse', () => {
  it('round-trips a saved insight back to the render shape', () => {
    const insight: AIInsightType = {
      id: 'i1',
      jobId: 'job-1',
      userId: 'u1',
      ...pipelineResultToInsight(RESULT),
      generatedAt: new Date(),
      updatedAt: new Date(),
    };
    const response = insightToPipelineResponse(insight);

    expect(response.fit_score).toEqual({ score: 82, reasoning: FIT_LABEL_TEXT.strong_fit });
    expect(response.cover_letter?.text).toBe('Dear hiring team,');
    expect(response.interview_angles).toEqual([
      { question: 'Tell me about scale', angle: 'Use the payments example' },
      { question: 'Why us?', angle: '' },
    ]);
  });

  it('hides legacy rows that stored reasoning text in fitLabel', () => {
    const response = insightToPipelineResponse({
      id: 'i2',
      jobId: 'job-2',
      userId: 'u1',
      fitScore: 50,
      fitLabel: 'Some old reasoning sentence',
      summary: null,
      coverLetter: null,
      interviewAngles: [],
      redFlags: [],
      generatedAt: new Date(),
      updatedAt: new Date(),
    });
    expect(response.fit_score).toEqual({ score: 50, reasoning: '' });
  });
});
