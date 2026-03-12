'use client';

import React from 'react';

import { Input, type InputProps } from '../ui';

const PasswordInput = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false);

    return (
      <Input
        type={showPassword ? 'text' : 'password'}
        className={className}
        ref={ref}
        icon={showPassword ? 'eye-off' : 'eye'}
        iconSize={18}
        placeholder="••••••••"
        onIconClick={() => setShowPassword((prev) => !prev)}
        {...props}
      />
    );
  }
);

PasswordInput.displayName = 'PasswordInput';

export { PasswordInput };
