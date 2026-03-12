import type { Metadata } from 'next';
import FriendsLayoutComponent from '@/components/app/dashboard/friends/layout';

interface FriendsLayoutProps {
  readonly children?: React.ReactNode;
}

export const metadata: Metadata = {
  title: {
    template: '%s',
    default: 'Friends',
  },
};

const FriendsLayout: React.FC<FriendsLayoutProps> = ({ children }) => {
  return <FriendsLayoutComponent>{children}</FriendsLayoutComponent>;
};

export default FriendsLayout;
