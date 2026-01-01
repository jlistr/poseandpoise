import { colors, typography, spacing } from '@/styles/tokens';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

export const metadata = {
  title: 'Privacy Policy | Pose & Poise',
  description: 'Privacy Policy for Pose & Poise - Professional portfolio platform for models',
};

export default function PrivacyPage() {
  return (
    <>
      <Navbar />
      <main
        style={{
          minHeight: '100vh',
          background: colors.cream,
          paddingTop: '120px',
          paddingBottom: spacing.padding['2xl'],
        }}
      >
        <div
          style={{
            maxWidth: '800px',
            margin: '0 auto',
            padding: `0 ${spacing.padding.xl}`,
          }}
        >
          {/* Header */}
          <div style={{ marginBottom: spacing.padding['2xl'], textAlign: 'center' }}>
            <p
              style={{
                fontFamily: typography.fontFamily.body,
                fontSize: typography.fontSize.caption,
                fontWeight: typography.fontWeight.medium,
                letterSpacing: '3px',
                textTransform: 'uppercase',
                color: colors.camel,
                marginBottom: spacing.padding.md,
              }}
            >
              Legal
            </p>
            <h1
              style={{
                fontFamily: typography.fontFamily.display,
                fontSize: 'clamp(36px, 6vw, 48px)',
                fontWeight: typography.fontWeight.light,
                color: colors.text.primary,
                marginBottom: spacing.padding.md,
              }}
            >
              Privacy Policy
            </h1>
            <p
              style={{
                fontFamily: typography.fontFamily.body,
                fontSize: typography.fontSize.body,
                color: colors.text.secondary,
              }}
            >
              Last updated: January 1, 2026
            </p>
          </div>

          {/* Content */}
          <div
            style={{
              background: colors.white,
              border: `1px solid ${colors.border.light}`,
              padding: spacing.padding['2xl'],
            }}
          >
            <Section title="1. Introduction">
              <p>
                Welcome to Pose & Poise ("we," "our," or "us"). We are committed to protecting your 
                personal information and your right to privacy. This Privacy Policy explains how we 
                collect, use, disclose, and safeguard your information when you use our platform.
              </p>
            </Section>

            <Section title="2. Information We Collect">
              <p>We collect information that you provide directly to us, including:</p>
              <ul>
                <li>Account information (name, email, password)</li>
                <li>Profile information (bio, measurements, agency details)</li>
                <li>Photos and media you upload</li>
                <li>Payment and billing information</li>
                <li>Communications with us</li>
              </ul>
              <p style={{ marginTop: '16px' }}>
                We also automatically collect certain information when you use our platform, including 
                device information, usage data, and analytics.
              </p>
            </Section>

            <Section title="3. How We Use Your Information">
              <p>We use the information we collect to:</p>
              <ul>
                <li>Provide, maintain, and improve our services</li>
                <li>Process transactions and send related information</li>
                <li>Send you technical notices and support messages</li>
                <li>Respond to your comments and questions</li>
                <li>Analyze usage patterns to improve user experience</li>
                <li>Protect against fraudulent or illegal activity</li>
              </ul>
            </Section>

            <Section title="4. Sharing Your Information">
              <p>
                We may share your information in the following circumstances:
              </p>
              <ul>
                <li>With your consent or at your direction</li>
                <li>With service providers who assist in our operations</li>
                <li>To comply with legal obligations</li>
                <li>To protect our rights and prevent fraud</li>
                <li>In connection with a business transfer or merger</li>
              </ul>
              <p style={{ marginTop: '16px' }}>
                Your public portfolio information is visible to anyone who visits your portfolio URL.
              </p>
            </Section>

            <Section title="5. Data Security">
              <p>
                We implement appropriate technical and organizational measures to protect your personal 
                information. However, no method of transmission over the Internet is 100% secure, and 
                we cannot guarantee absolute security.
              </p>
            </Section>

            <Section title="6. Your Rights">
              <p>You have the right to:</p>
              <ul>
                <li>Access your personal information</li>
                <li>Correct inaccurate data</li>
                <li>Request deletion of your data</li>
                <li>Object to processing of your data</li>
                <li>Export your data in a portable format</li>
              </ul>
            </Section>

            <Section title="7. Cookies and Tracking">
              <p>
                We use cookies and similar tracking technologies to collect information about your 
                browsing activities. You can control cookies through your browser settings.
              </p>
            </Section>

            <Section title="8. Children's Privacy">
              <p>
                Our services are not directed to children under 16. We do not knowingly collect 
                personal information from children under 16. If you believe we have collected 
                information from a child, please contact us.
              </p>
            </Section>

            <Section title="9. Changes to This Policy">
              <p>
                We may update this Privacy Policy from time to time. We will notify you of any 
                changes by posting the new policy on this page and updating the "Last updated" date.
              </p>
            </Section>

            <Section title="10. Contact Us" isLast>
              <p>
                If you have questions about this Privacy Policy, please contact us at:
              </p>
              <p style={{ marginTop: '12px' }}>
                <strong>Email:</strong> privacy@poseandpoise.studio<br />
                <strong>Address:</strong> Pose & Poise, Inc.
              </p>
            </Section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

interface SectionProps {
  title: string;
  children: React.ReactNode;
  isLast?: boolean;
}

function Section({ title, children, isLast = false }: SectionProps) {
  return (
    <section
      style={{
        marginBottom: isLast ? 0 : spacing.padding.xl,
        paddingBottom: isLast ? 0 : spacing.padding.xl,
        borderBottom: isLast ? 'none' : `1px solid ${colors.border.subtle}`,
      }}
    >
      <h2
        style={{
          fontFamily: typography.fontFamily.display,
          fontSize: '22px',
          fontWeight: typography.fontWeight.regular,
          color: colors.text.primary,
          marginBottom: spacing.padding.md,
        }}
      >
        {title}
      </h2>
      <div
        style={{
          fontFamily: typography.fontFamily.body,
          fontSize: typography.fontSize.body,
          color: colors.text.secondary,
          lineHeight: 1.8,
        }}
      >
        {children}
        <style>{`
          section ul {
            margin: 12px 0;
            padding-left: 24px;
          }
          section li {
            margin-bottom: 8px;
          }
        `}</style>
      </div>
    </section>
  );
}

