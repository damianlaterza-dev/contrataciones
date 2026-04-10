import {
  ChartColumnIncreasingIcon,
  FolderOpenDot,
  UsersIcon,
  Folders,
  Building2,
  LucideIcon,
} from "lucide-react";

interface INavMain {
  title: string;
  url: string;
  icon?: LucideIcon;
  isActive?: boolean;
  disabled?: boolean;
}

export const sidebarData: { navMain: INavMain[] } = {
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: ChartColumnIncreasingIcon,
      isActive: true,
      disabled: true,
    },
    {
      title: "Proveedores",
      url: "/proveedores",
      icon: Building2,
    },
    {
      title: "Contratos",
      url: "/contratos",
      icon: Folders,
    },
    {
      title: "Proyectos",
      url: "/proyectos",
      icon: FolderOpenDot,
    },
    {
      title: "Usuarios",
      url: "/usuarios",
      icon: UsersIcon,
    },
  ],
};
