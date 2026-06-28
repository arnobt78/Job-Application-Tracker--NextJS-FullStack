import { Link, Section, Text } from '@react-email/components';
import { EmailLayout, emailStyles } from './email-layout';

export type PostingClosedEmailProps = {
  position: string;
  company: string;
  jobUrl: string;
};

export function PostingClosedEmail({ position, company, jobUrl }: PostingClosedEmailProps) {
  return (
    <EmailLayout preview={`⚠️ Posting closed — ${position} at ${company}`}>
      <Text style={{ ...emailStyles.badge, ...emailStyles.badgeRed, marginBottom: '4px' }}>
        Posting Closed
      </Text>
      <Text style={emailStyles.heading}>This job posting has been removed</Text>
      <Text style={emailStyles.bodyText}>
        The employer has expired or removed the live posting for the role you&apos;re tracking.
        Your application record in Jobify is still saved.
      </Text>
      <Section style={emailStyles.jobBlock}>
        <Text style={emailStyles.jobTitle}>{position}</Text>
        <Text style={emailStyles.jobCompany}>{company}</Text>
      </Section>
      <Link href={jobUrl} style={emailStyles.ctaLink}>View Application →</Link>
    </EmailLayout>
  );
}
