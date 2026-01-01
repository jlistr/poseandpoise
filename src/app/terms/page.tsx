import { colors, typography, spacing } from '@/styles/tokens';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

export const metadata = {
  title: 'Terms of Service | Pose & Poise',
  description: 'Terms of Service for Pose & Poise - Professional portfolio platform for models',
};

export default function TermsPage() {
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
              Terms of Service
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
            <Section title="1. Acceptance of Terms">
              <p>
                By accessing or using Pose & Poise ("the Service"), you agree to be bound by these 
                Terms of Service. If you do not agree to these terms, please do not use our Service.
              </p>
            </Section>

            <Section title="2. Description of Service">
              <p>
                Pose & Poise is a professional portfolio platform designed for models. Our Service 
                allows users to create and manage digital portfolios, comp cards, and professional 
                profiles to showcase their work to potential clients and agencies.
              </p>
            </Section>

            <Section title="3. User Accounts">
              <p>To use certain features of the Service, you must create an account. You agree to:</p>
              <ul>
                <li>Provide accurate and complete information</li>
                <li>Maintain the security of your account credentials</li>
                <li>Notify us immediately of any unauthorized access</li>
                <li>Be responsible for all activities under your account</li>
              </ul>
            </Section>

            <Section title="4. User Content">
              <p>
                You retain ownership of content you upload to the Service. By uploading content, 
                you grant us a non-exclusive, worldwide license to use, display, and distribute 
                your content in connection with the Service.
              </p>
              <p style={{ marginTop: '16px' }}>You represent and warrant that:</p>
              <ul>
                <li>You own or have rights to the content you upload</li>
                <li>Your content does not violate any third-party rights</li>
                <li>Your content complies with all applicable laws</li>
              </ul>
            </Section>

            <Section title="5. Prohibited Conduct">
              <p>You agree not to:</p>
              <ul>
                <li>Use the Service for any illegal purpose</li>
                <li>Upload content that is harmful, offensive, or inappropriate</li>
                <li>Impersonate others or misrepresent your identity</li>
                <li>Interfere with the proper functioning of the Service</li>
                <li>Attempt to gain unauthorized access to our systems</li>
                <li>Use automated means to access the Service without permission</li>
              </ul>
            </Section>

            <Section title="6. Subscription and Payments">
              <p>
                Some features of the Service require a paid subscription. By subscribing, you agree to:
              </p>
              <ul>
                <li>Pay all applicable fees as described at the time of purchase</li>
                <li>Provide accurate billing information</li>
                <li>Accept automatic renewal unless you cancel before the renewal date</li>
              </ul>
              <p style={{ marginTop: '16px' }}>
                Refunds are handled in accordance with our refund policy. Contact support for 
                refund requests.
              </p>
            </Section>

            <Section title="7. Intellectual Property">
              <p>
                The Service and its original content (excluding user content) are owned by 
                Pose & Poise and are protected by copyright, trademark, and other intellectual 
                property laws.
              </p>
            </Section>

            <Section title="8. Disclaimer of Warranties">
              <p>
                THE SERVICE IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND. WE DO NOT 
                GUARANTEE THAT THE SERVICE WILL BE UNINTERRUPTED, SECURE, OR ERROR-FREE.
              </p>
            </Section>

            <Section title="9. Limitation of Liability">
              <p>
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, POSE & POISE SHALL NOT BE LIABLE FOR 
                ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING 
                FROM YOUR USE OF THE SERVICE.
              </p>
            </Section>

            <Section title="10. Termination">
              <p>
                We may terminate or suspend your account at any time for violations of these 
                Terms. Upon termination, your right to use the Service will immediately cease.
              </p>
            </Section>

            <Section title="11. Changes to Terms">
              <p>
                We reserve the right to modify these Terms at any time. We will notify users 
                of material changes. Continued use of the Service after changes constitutes 
                acceptance of the new Terms.
              </p>
            </Section>

            <Section title="12. Governing Law">
              <p>
                These Terms shall be governed by the laws of the jurisdiction in which 
                Pose & Poise operates, without regard to conflict of law principles.
              </p>
            </Section>

            <Section title="13. Contact Information" isLast>
              <p>
                For questions about these Terms of Service, please contact us at:
              </p>
              <p style={{ marginTop: '12px' }}>
                <strong>Email:</strong> legal@poseandpoise.studio<br />
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

