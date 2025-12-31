import styles from './page.module.css';

export default function SupportPage() {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <p className={styles.label}>Help Center</p>
        <h1 className={styles.title}>Support</h1>
        <p className={styles.description}>
          Get help with your portfolio, account, or billing.
        </p>
      </div>

      <div className={styles.content}>
        <div className={styles.comingSoon}>
          <SupportIcon />
          <h2>Coming Soon</h2>
          <p>
            Our support center is under construction. In the meantime, please 
            reach out to us at{' '}
            <a href="mailto:support@poseandpoise.studio">
              support@poseandpoise.studio
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

function SupportIcon() {
  return (
    <svg 
      width="64" 
      height="64" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="1" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}