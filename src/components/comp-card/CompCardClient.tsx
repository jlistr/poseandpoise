"use client";

import { useState, useCallback } from "react";
import { getCompCards, type CompCard } from "@/app/actions/comp-card";
import { CompCardBuilder } from "./CompCardBuilderEnhanced";
import type { Profile } from "@/app/actions/profile";
import type { Photo } from "@/app/actions/photos";

interface CompCardClientProps {
  profile: Profile;
  photos: Photo[];
  initialCompCards: CompCard[];
}

export function CompCardClient({ profile, photos, initialCompCards }: CompCardClientProps) {
  const [compCards, setCompCards] = useState<CompCard[]>(initialCompCards);

  const refreshCompCards = useCallback(async () => {
    const result = await getCompCards();
    if (result.success && result.data) {
      setCompCards(result.data);
    }
  }, []);

  return (
    <CompCardBuilder
      profile={profile}
      photos={photos}
      existingCompCards={compCards}
      onUpdate={refreshCompCards}
    />
  );
}