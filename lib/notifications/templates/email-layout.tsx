import {
  Body,
  Container,
  Head,
  Html,
  Section,
  Text,
  Hr,
} from '@react-email/components';
import type { ReactNode } from 'react';

const styles = {
  body: { backgroundColor: '#0a0a0a', margin: 0, padding: 0, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' },
  container: { maxWidth: '560px', margin: '40px auto', padding: '0 16px' },
  card: { backgroundColor: '#141414', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)', padding: '32px', marginBottom: '24px' },
  logoRow: { marginBottom: '24px' },
  logoText: { fontSize: '18px', fontWeight: '700', color: '#2563eb', letterSpacing: '-0.3px' },
  hr: { borderColor: 'rgba(255,255,255,0.08)', margin: '20px 0' },
  footer: { fontSize: '12px', color: '#666', textAlign: 'center' as const, padding: '0 16px 32px' },
};

type EmailLayoutProps = {
  children: ReactNode;
  preview?: string;
};

export function EmailLayout({ children, preview }: EmailLayoutProps) {
  return (
    <Html lang="en">
      <Head>
        {preview && <meta name="x-apple-disable-message-reformatting" />}
      </Head>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <div style={styles.card}>
            <div style={styles.logoRow}>
              <Text style={styles.logoText}>Jobify</Text>
            </div>
            <Hr style={styles.hr} />
            {children}
          </div>
          <Section>
            <Text style={styles.footer}>
              You received this email because you track job applications with Jobify.{' '}
              To stop receiving alerts, remove your Resend API key from your deployment.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

export const emailStyles = {
  heading: { fontSize: '20px', fontWeight: '600', color: '#f8f8f8', margin: '16px 0 8px' },
  subheading: { fontSize: '14px', color: '#a0a0a0', margin: '0 0 20px' },
  bodyText: { fontSize: '14px', color: '#c0c0c0', lineHeight: '1.6', margin: '0 0 16px' },
  jobBlock: { backgroundColor: 'rgba(37,99,235,0.1)', borderRadius: '10px', border: '1px solid rgba(37,99,235,0.25)', padding: '14px 16px', margin: '16px 0' },
  jobTitle: { fontSize: '15px', fontWeight: '600', color: '#f8f8f8', margin: 0 },
  jobCompany: { fontSize: '13px', color: '#a0a0a0', margin: '4px 0 0' },
  ctaLink: { display: 'inline-block' as const, backgroundColor: '#2563eb', color: '#ffffff', fontSize: '14px', fontWeight: '600', borderRadius: '8px', padding: '10px 20px', textDecoration: 'none', marginTop: '16px' },
  badge: { display: 'inline-block' as const, borderRadius: '999px', padding: '2px 10px', fontSize: '12px', fontWeight: '600' },
  badgeRed: { backgroundColor: 'rgba(239,68,68,0.15)', color: '#f87171', border: '1px solid rgba(239,68,68,0.3)' },
  badgeAmber: { display: 'inline-block' as const, backgroundColor: 'rgba(245,158,11,0.15)', color: '#fbbf24', border: '1px solid rgba(245,158,11,0.3)', borderRadius: '999px', padding: '2px 10px', fontSize: '12px', fontWeight: '600' },
  badgeGreen: { display: 'inline-block' as const, backgroundColor: 'rgba(16,185,129,0.15)', color: '#34d399', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '999px', padding: '2px 10px', fontSize: '12px', fontWeight: '600' },
};
