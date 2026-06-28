import { Link, Section, Text } from '@react-email/components';
import { EmailLayout, emailStyles } from './email-layout';

export type SalaryAddedEmailProps = {
  position: string;
  company: string;
  jobUrl: string;
  salaryRange?: string;
};

export function SalaryAddedEmail({ position, company, jobUrl, salaryRange }: SalaryAddedEmailProps) {
  return (
    <EmailLayout preview={`💰 Salary disclosed — ${position} at ${company}`}>
      <Text style={{ ...emailStyles.badge, ...emailStyles.badgeGreen, marginBottom: '4px' }}>
        Salary Disclosed
      </Text>
      <Text style={emailStyles.heading}>Salary information is now available</Text>
      <Text style={emailStyles.bodyText}>
        The employer has added compensation details to this posting.
        {salaryRange ? ` Disclosed range: ${salaryRange}.` : ''}
      </Text>
      <Section style={emailStyles.jobBlock}>
        <Text style={emailStyles.jobTitle}>{position}</Text>
        <Text style={emailStyles.jobCompany}>{company}</Text>
        {salaryRange && (
          <Text style={{ fontSize: '14px', fontWeight: '600', color: '#34d399', margin: '8px 0 0' }}>
            {salaryRange}
          </Text>
        )}
      </Section>
      <Link href={jobUrl} style={emailStyles.ctaLink}>View Salary →</Link>
    </EmailLayout>
  );
}
