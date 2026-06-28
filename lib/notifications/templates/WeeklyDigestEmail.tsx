import { Hr, Link, Section, Text } from '@react-email/components';
import { EmailLayout, emailStyles } from './email-layout';

export type DigestApp = {
  position: string;
  company: string;
  status: string;
  jobUrl: string;
};

export type DigestChange = {
  position: string;
  company: string;
  changeType: 'posting_closed' | 'jd_changed' | 'salary_added';
};

export type WeeklyDigestEmailProps = {
  weekOf: string;
  newApps: DigestApp[];
  postingChanges: DigestChange[];
  totalTracked: number;
  appUrl: string;
};

const CHANGE_LABELS: Record<DigestChange['changeType'], string> = {
  posting_closed: '⚠️ Closed',
  jd_changed: '📝 JD Changed',
  salary_added: '💰 Salary Added',
};

const hrStyle = { borderColor: 'rgba(255,255,255,0.08)', margin: '20px 0' };

export function WeeklyDigestEmail({ weekOf, newApps, postingChanges, totalTracked, appUrl }: WeeklyDigestEmailProps) {
  return (
    <EmailLayout preview={`Your Jobify weekly digest — ${weekOf}`}>
      <Text style={emailStyles.heading}>Weekly Summary</Text>
      <Text style={emailStyles.subheading}>Week of {weekOf} · {totalTracked} applications tracked</Text>

      {newApps.length > 0 && (
        <>
          <Text style={{ fontSize: '13px', fontWeight: '600', color: '#a0a0a0', margin: '0 0 10px', textTransform: 'uppercase' as const, letterSpacing: '0.05em' }}>
            New This Week ({newApps.length})
          </Text>
          {newApps.map((app) => (
            <Section key={`${app.position}-${app.company}`} style={{ ...emailStyles.jobBlock, marginBottom: '8px' }}>
              <Text style={emailStyles.jobTitle}>{app.position}</Text>
              <Text style={emailStyles.jobCompany}>{app.company} · {app.status}</Text>
            </Section>
          ))}
        </>
      )}

      {postingChanges.length > 0 && (
        <>
          <Hr style={hrStyle} />
          <Text style={{ fontSize: '13px', fontWeight: '600', color: '#a0a0a0', margin: '0 0 10px', textTransform: 'uppercase' as const, letterSpacing: '0.05em' }}>
            Posting Changes ({postingChanges.length})
          </Text>
          {postingChanges.map((c) => (
            <Section key={`${c.position}-${c.company}`} style={{ ...emailStyles.jobBlock, marginBottom: '8px', borderColor: 'rgba(245,158,11,0.2)' }}>
              <Text style={{ ...emailStyles.jobTitle, fontSize: '14px' }}>{c.position}</Text>
              <Text style={{ ...emailStyles.jobCompany, marginTop: '4px' }}>
                {c.company} · <span style={{ color: '#fbbf24' }}>{CHANGE_LABELS[c.changeType]}</span>
              </Text>
            </Section>
          ))}
        </>
      )}

      <Hr style={hrStyle} />
      <Link href={appUrl} style={emailStyles.ctaLink}>Open Jobify →</Link>
    </EmailLayout>
  );
}
