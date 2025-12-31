import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getPublicProfile } from "@/app/actions/public-profile";
import type { Metadata } from "next";

// Template imports
import { EditorialTemplate } from "@/components/templates/EditorialTemplate";
import { MinimalTemplate } from "@/components/templates/MinimalTemplate";
import { ClassicTemplate } from "@/components/templates/ClassicTemplate";
import { OwnerPreviewBanner } from "@/components/dashboard/OwnerPreviewBanner";

type PageParams = { username: string };
type PageProps = { params: Promise<PageParams> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { username } = await params;
  const result = await getPublicProfile(username);

  if (!result.success || !result.data) {
    return {
      title: "Profile Not Found | Pose & Poise",
    };
  }

  const profile = result.data;
  const title = profile.display_name || username;

  return {
    title: `${title} | Pose & Poise`,
    description: profile.bio || `View ${title}'s modeling portfolio on Pose & Poise.`,
    openGraph: {
      title: `${title} | Pose & Poise`,
      description: profile.bio || `View ${title}'s modeling portfolio.`,
      type: "profile",
      images: profile.photos[0]?.url ? [profile.photos[0].url] : [],
    },
  };
}

export default async function PortfolioPage({ params }: PageProps) {
  const { username } = await params;
  const result = await getPublicProfile(username);

  if (!result.success || !result.data) {
    notFound();
  }

  const profile = result.data;
  
  // Check if current user is the profile owner
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const isOwner = user?.id === profile.id;
  
  // Get selected template (default to 'editorial' if not set)
  const templateId = profile.selected_template || 'editorial';

  // Render the appropriate template
  const renderTemplate = () => {
    switch (templateId) {
      case 'minimal':
        return <MinimalTemplate profile={profile} username={username} />;
      case 'classic':
        return <ClassicTemplate profile={profile} username={username} />;
      case 'editorial':
      default:
        return <EditorialTemplate profile={profile} username={username} />;
    }
  };

  // If owner is viewing, wrap with template selector banner
  if (isOwner) {
    return (
      <div>
        <OwnerPreviewBanner 
          username={username} 
          currentTemplate={templateId}
        />
        {renderTemplate()}
      </div>
    );
  }

  // Public view - just the template
  return renderTemplate();
}