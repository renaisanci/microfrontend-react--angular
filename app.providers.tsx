import React from 'react';

import { env } from 'core/constants';
import { ThemeProvider } from 'core/theme';
import { TranslatedKeysProvider } from 'core/i18n';
import { LocalizationProvider } from 'core/localization';
import { AuthProvider } from 'core/auth';
import { AxiosConfigProvider, QueryConfigProvider } from 'core/api';
import { StateProvider } from 'core/state';
import { FeedbackProvider } from 'common/providers';
import { ValidatorsConfig } from 'common/validators';
import { ReactErrorBoundary } from 'common/components';
import { SomethingWentWrongLite } from 'global/pods/app-fallbacks';

export const AppProviders: React.FC<React.PropsWithChildren> = ({ children }) => {
  return (
    <ThemeProvider>
      <TranslatedKeysProvider>
        <ValidatorsConfig />
        <ReactErrorBoundary Fallback={<SomethingWentWrongLite fullscreen />}>
          <LocalizationProvider>
            <FeedbackProvider>
              <AuthProvider>
                <AxiosConfigProvider>
                  <QueryConfigProvider devTools={env.DEV}>
                    <StateProvider targetStore="default" devTools={env.DEV}>
                      {children}
                    </StateProvider>
                  </QueryConfigProvider>
                </AxiosConfigProvider>
              </AuthProvider>
            </FeedbackProvider>
          </LocalizationProvider>
        </ReactErrorBoundary>
      </TranslatedKeysProvider>
    </ThemeProvider>
  );
};
