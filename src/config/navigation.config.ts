import {
  LayoutDashboard,
  BookOpenText,
  Users,
  Stethoscope,
  CalendarDays,
  UserCog,
  Settings,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  /** Rótulo exibido na Sidebar e no Breadcrumb */
  title: string;
  /** Rota TanStack correspondente */
  url:
    | "/dashboard"
    | "/conhecimento"
    | "/pacientes"
    | "/atendimentos"
    | "/agenda"
    | "/profissionais"
    | "/configuracoes";
  icon: LucideIcon;
  /** Descrição curta usada em páginas e tooltips */
  description: string;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

export const navigationConfig: NavGroup[] = [
  {
    label: "Principal",
    items: [
      {
        title: "Dashboard",
        url: "/dashboard",
        icon: LayoutDashboard,
        description: "Visão geral da operação da clínica.",
      },
      {
        title: "Central do Conhecimento",
        url: "/conhecimento",
        icon: BookOpenText,
        description: "Base de conhecimento clínico da Bella IA.",
      },
      {
        title: "Pacientes",
        url: "/pacientes",
        icon: Users,
        description: "Cadastro e histórico de pacientes.",
      },
      {
        title: "Atendimento Clínico",
        url: "/atendimentos",
        icon: Stethoscope,
        description: "Registro e acompanhamento de atendimentos.",
      },
      {
        title: "Agenda",
        url: "/agenda",
        icon: CalendarDays,
        description: "Agendamentos e disponibilidade.",
      },
    ],
  },
  {
    label: "Administração",
    items: [
      {
        title: "Profissionais",
        url: "/profissionais",
        icon: UserCog,
        description: "Equipe clínica e permissões.",
      },
      {
        title: "Configurações",
        url: "/configuracoes",
        icon: Settings,
        description: "Preferências da clínica e da plataforma.",
      },
    ],
  },
];

export const navigationItems: NavItem[] = navigationConfig.flatMap((group) => group.items);

export function findNavItemByPath(pathname: string): NavItem | undefined {
  return navigationItems.find((item) => pathname === item.url || pathname.startsWith(`${item.url}/`));
}
