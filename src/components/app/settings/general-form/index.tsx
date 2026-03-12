import React from 'react';
import dynamic from 'next/dynamic';

const AppearanceForm = dynamic(() =>
  import('./apearance-form').then((mod) => mod.AppearanceForm)
);
const LanguageForm = dynamic(() =>
  import('./language-form').then((mod) => mod.LanguageForm)
);

const GeneralSettingsForm = () => {
  return (
    <div className="space-y-8">
      <AppearanceForm />
      <LanguageForm />
    </div>
  );
};

export { GeneralSettingsForm };
