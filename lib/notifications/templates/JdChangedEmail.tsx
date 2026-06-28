import { Link, Section, Text } from '@react-email/components';
import { EmailLayout, emailStyles } from './email-layout';

export type JdChangedEmailProps = {
  position: string;
  company: string;
  jobUrl: string;
};

export function JdChangedEmail({ position, company, jobUrl }: JdChangedEmailProps) {
  return (
    <EmailLayout preview={`📝 JD updated — ${position} at ${company}`}>
      <Text style={{ ...emailStyles.badge, ...emailStyles.badgeAmber, marginBottom: '4px' }}>
        Description Changed
      </Text>
      <Text style={emailStyles.heading}>The job description was updated</Text>
      <Text style={emailStyles.bodyText}>
        The employer has modified the job description since you started tracking this role.
        Review the updated posting to check for new requirements or changed details.
      </Text>
      <Section style={emailStyles.jobBlock}>
        <Text style={emailStyles.jobTitle}>{position}</Text>
        <Text style={emailStyles.jobCompany}>{company}</Text>
      </Section>
      <Link href={jobUrl} style={emailStyles.ctaLink}>View Changes →</Link>
    </EmailLayout>
  );
}
