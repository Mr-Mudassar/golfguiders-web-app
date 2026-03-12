import React from 'react';

interface ThemeProps {
  readonly children?: React.ReactNode;
}

const Theme: React.FC<ThemeProps> = ({ children }) => {
  return <>{children}</>;
};

export { Theme };
