"use client";

import { Trophy, Users } from "lucide-react";
import { type KeyboardEvent, useRef, useState } from "react";
import { Leaderboard } from "@/app/components/Leaderboard";
import { ErrorDisplay } from "@/app/components/shared/ErrorDisplay";
import { LeaderboardSkeleton } from "@/app/components/shared/LeaderboardSkeleton";
import { TopCreators } from "@/app/components/TopCreators";
import { Button } from "@/components/ui/button";
import { useTipEvents } from "@/lib/hooks";
import { getTabNavIndex } from "@/lib/utils";

type Tab = "supporters" | "creators";

const tabs: { id: Tab; label: string; icon: typeof Users }[] = [
  { id: "supporters", label: "Top Supporters", icon: Users },
  { id: "creators", label: "Top Creators", icon: Trophy },
];

export function LeaderboardTabs() {
  const [activeTab, setActiveTab] = useState<Tab>("supporters");
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const { events, isLoading, error } = useTipEvents();

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const newIndex = getTabNavIndex(event.key, index, tabs.length);
    if (newIndex === null) return;

    event.preventDefault();
    tabRefs.current[newIndex]?.focus();
    setActiveTab(tabs[newIndex].id);
  };

  return (
    <div>
      <div className="mb-8 flex justify-center">
        <div
          role="tablist"
          aria-label="Leaderboard categories"
          className="inline-flex rounded-lg border border-border bg-card p-1"
        >
          {tabs.map((tab, index) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;

            return (
              <Button
                key={tab.id}
                ref={(el) => {
                  tabRefs.current[index] = el;
                }}
                role="tab"
                id={`tab-${tab.id}`}
                variant={isActive ? "default" : "ghost"}
                size="sm"
                aria-selected={isActive}
                aria-controls={`tabpanel-${tab.id}`}
                tabIndex={isActive ? 0 : -1}
                onClick={() => setActiveTab(tab.id)}
                onKeyDown={(e) => handleKeyDown(e, index)}
              >
                <Icon aria-hidden="true" />
                {tab.label}
              </Button>
            );
          })}
        </div>
      </div>

      {isLoading ? (
        <LeaderboardSkeleton />
      ) : error ? (
        <ErrorDisplay message={error} />
      ) : (
        <>
          <div
            role="tabpanel"
            id="tabpanel-supporters"
            aria-labelledby="tab-supporters"
            hidden={activeTab !== "supporters"}
            tabIndex={0}
          >
            <Leaderboard events={events} />
          </div>
          <div
            role="tabpanel"
            id="tabpanel-creators"
            aria-labelledby="tab-creators"
            hidden={activeTab !== "creators"}
            tabIndex={0}
          >
            <TopCreators events={events} />
          </div>
        </>
      )}
    </div>
  );
}
