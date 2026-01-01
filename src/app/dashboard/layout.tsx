import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { DashboardHeader } from '@/components/layout/DashboardHeader';
import { DashboardNav } from '@/components/layout/DashboardNav';
import styles from './layout.module.css';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    redirect('/login');
  }

  // Get profile for display name, subscription tier, avatar, and onboarding status
  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name, username, subscription_tier, onboarding_completed, avatar_url')
    .eq('id', user.id)
    .single();

  // Redirect to onboarding if not completed
  if (!profile?.onboarding_completed) {
    redirect('/onboarding');
  }

  return (
    <div className={styles.layout}>
      <DashboardHeader 
        userEmail={user.email} 
        userName={profile?.display_name || profile?.username}
        username={profile?.username}
        subscriptionTier={profile?.subscription_tier}
        avatarUrl={profile?.avatar_url}
      />
      <DashboardNav />
      <main className={styles.main}>
        <div className={styles.content}>
          {children}
        </div>
      </main>
    </div>
  );
}