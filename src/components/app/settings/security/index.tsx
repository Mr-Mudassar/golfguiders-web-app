import React from 'react';
import dynamic from 'next/dynamic';

const UpdatePasswordForm = dynamic(() =>
  import('./update-password-form').then((mod) => mod.UpdatePasswordForm)
);

const SecuritySettings = () => {
  return (
    <div className="space-y-8">
      <UpdatePasswordForm />
    </div>
  );
};

export { SecuritySettings };
