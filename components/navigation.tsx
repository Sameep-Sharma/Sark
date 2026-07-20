"use client";

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
  return <NavBar items={navItems} />;
}
