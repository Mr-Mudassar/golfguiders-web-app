import type { IconProps } from '@/components/ui';

interface RouteType {
  icon: IconProps['name'];
  label: string;
  href: string;
}

const createRoutes = <T extends Record<string, RouteType>>(routes: T) => routes;

export const Routes = createRoutes({
  Home: {
    icon: 'home',
    label: 'Home',
    href: '/dashboard',
  },
  Buddies: {
    icon: 'buddy',
    label: 'Buddies',
    href: '/dashboard/buddies',
  },
  Friends: {
    icon: 'users',
    label: 'Friends',
    href: '/dashboard/friends',
  },
  ProTournaments: {
    icon: 'trophy',
    label: 'Pro Leaderboard',
    href: '/dashboard/tournaments/pro',
  },
  LocalTournaments: {
    icon: 'medal',
    label: 'Play Tournament',
    href: '/dashboard/tournaments/play-local',
  },
  GolferGPT: {
    icon: 'gpt',
    label: 'Guiders AI',
    href: '/dashboard/ai/chat',
  },
  BagTraxx: {
    icon: 'scan-code',
    label: 'Bag Traxx',
    href: '/dashboard/bag-traxx',
  },
  PlayInGolfCourse: {
    icon: 'golf-flag',
    label: 'Play In Golf Course',
    href: '/dashboard/play-in-golf-course',
  },
  Trips: {
    icon: 'Plane',
    label: 'Trips',
    href: '/dashboard/trips',
  },
  GeneralSettings: {
    icon: 'settings',
    label: 'General',
    href: '/settings',
  },
  ProfileSettings: {
    icon: 'user-circle',
    label: 'Profile',
    href: '/settings/profile',
  },
  BlockedUserSettings: {
    icon: 'user',
    label: 'Blocked Users',
    href: '/settings/block-list',
  },
  SecuritySettings: {
    icon: 'lock',
    label: 'Change Password',
    href: '/settings/security',
  },
});

export const NavLinks: {
  type: string;
  links: RouteType[];
}[] = [
    {
      type: 'main',
      links: [Routes.Home, Routes.Buddies, Routes.Friends, Routes.PlayInGolfCourse],
    },
    // {
    //   type: 'ai',
    //   links: [Routes.GolferGPT],
    // },
    {
      type: 'tournaments',
      links: [Routes.ProTournaments, Routes.LocalTournaments],
    },
    // {
    //   type: 'bag-traxx',
    //   links: [Routes.BagTraxx],
    // },
    {
      type: 'trips',
      links: [Routes.Trips],
    },
  ];

export const SettingsNavLinks: RouteType[] = [
  Routes.GeneralSettings,
  Routes.ProfileSettings,
  Routes.SecuritySettings,
  Routes.BlockedUserSettings,
];
