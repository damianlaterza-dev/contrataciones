"use client";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  // SidebarRail,
} from "@/components/ui/sidebar";
import Image from "next/image";

import BALogo from "@/assets/img/header/logo_navbar_white.svg";
import { sidebarData } from "@/constants/sidebarItems";

type SidebarBaseProps = React.ComponentProps<typeof Sidebar>;

interface SidebarProps extends SidebarBaseProps {
  user: {
    name: string;
    email: string;
    avatar: string;
  };
}

export function AppSidebar({ user, ...props }: SidebarProps) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="mt-0.75">
        <Image src={BALogo} alt="Logo de Buenos Aires Ciudad" />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={sidebarData.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      {/* <SidebarRail /> */}
    </Sidebar>
  );
}
