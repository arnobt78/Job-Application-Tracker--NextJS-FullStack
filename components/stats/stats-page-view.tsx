import StatsContainer from '@/components/StatsContainer';
import { ApplicationTrendChart } from '@/components/stats/application-trend-chart';
import { WeeklyVelocityChart } from '@/components/stats/weekly-velocity-chart';
import { StatusDistributionChart } from '@/components/stats/status-distribution-chart';
import { ModeDistributionChart } from '@/components/stats/mode-distribution-chart';
import { SalaryIntelligence } from '@/components/stats/salary-intelligence';
import { GlassCard } from '@/components/ui/glass-card';
import { PageSectionHeader } from '@/components/ui/page-section-header';
import { BarChart2, TrendingUp, Activity, PieChart, DollarSign } from 'lucide-react';

/** /stats layout — rendered by page.tsx (hydrated) and loading.tsx (instant shell, cache-only queries) */
export function StatsPageView() {
  return (
    <>
      {/* Page header */}
      <div className="mb-6">
        <PageSectionHeader
          icon={BarChart2}
          title="Statistics"
          subtitle="Track your application trends, velocity, and response rates"
          headingLevel="h1"
        />
      </div>

      {/* Status cards + derived KPI cards (single shared grid) */}
      <StatsContainer />

      {/* Monthly trend — ComposedChart with 2-month projection */}
      <div className="mt-12">
        <PageSectionHeader
          icon={TrendingUp}
          title="Monthly Trend"
          subtitle="Applications per month with projected next month"
          className="mb-4"
        />
        <GlassCard variant="sky">
          <ApplicationTrendChart />
        </GlassCard>
      </div>

      {/* Weekly velocity — Area chart, last 12 weeks */}
      <div className="mt-10">
        <PageSectionHeader
          icon={Activity}
          title="Weekly Velocity"
          subtitle="Application pace week-over-week for the last 12 weeks"
          className="mb-4"
        />
        <GlassCard variant="violet">
          <WeeklyVelocityChart />
        </GlassCard>
      </div>

      {/* Application breakdown — status donut + mode bars side by side */}
      <div className="mt-10">
        <PageSectionHeader
          icon={PieChart}
          title="Application Breakdown"
          subtitle="Status distribution and job type breakdown"
          className="mb-4"
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <GlassCard variant="emerald">
            <h3 className="mb-4 text-center text-sm font-semibold text-tone-emerald">
              Status Distribution
            </h3>
            <StatusDistributionChart />
          </GlassCard>
          <GlassCard variant="amber">
            <h3 className="mb-4 text-center text-sm font-semibold text-tone-amber">
              Job Type Breakdown
            </h3>
            <ModeDistributionChart />
          </GlassCard>
        </div>
      </div>

      {/* Salary Intelligence — aggregated from Bluedoor-enriched jobs */}
      <div className="mt-10">
        <PageSectionHeader
          icon={DollarSign}
          title="Salary Intelligence"
          subtitle="Market salary data extracted from your enriched job postings"
          className="mb-4"
        />
        <GlassCard variant="emerald">
          <SalaryIntelligence />
        </GlassCard>
      </div>
    </>
  );
}
