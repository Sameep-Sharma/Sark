import React from "react";
import { Timeline } from "@/components/ui/timeline";
import { timelineData } from "@/temp/timeline-data";

export default function TimelinePage() {
  return (
    <div className="min-h-screen w-full relative z-10 pt-20">
      <Timeline data={timelineData} />
    </div>
  );
}
