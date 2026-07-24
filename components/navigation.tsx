"use client";

import { usePathname } from "next/navigation";
import { Home, Info, Users, GraduationCap, Trophy, Clock } from "lucide-react";
import { NavBar } from "@/components/ui/tubelight-navbar";

const navItems = [
  { name: 'Home', url: '/', icon: Home },
  { name: 'About', url: '/about', icon: Info },
  { name: 'Team', url: '/team', icon: Users },
  { name: 'Alumni', url: '/alumni', icon: GraduationCap },
  { name: 'Achievements', url: '/achievements', icon: Trophy },
  { name: 'Timeline', url: '/timeline', icon: Clock }
];

export function Navigation() {
  const pathname = usePathname();

  // Hide the navigation bar on admin and quiz routes (e.g. /admin, /quiz)
  if (pathname?.startsWith("/admin") || pathname?.startsWith("/quiz")) {
    return null;
  }

  return <NavBar items={navItems} />;
}
