import React from 'react';
import {
  Route,
  createBrowserRouter,
  createRoutesFromElements,
  RouterProvider,
  Navigate,
  Outlet,
} from 'react-router-dom';

import { useAuth } from 'core/auth';
import { routes } from 'core/routes';
import { SyncLocationState } from 'global/state';
import { SomethingWentWrong } from 'global/pods/app-fallbacks';
import {
  AppFrameScene,
  EdgeApplicationsScene,
  EdgeDataSourcesScene,
  EdgeOverviewScene,
  EdgeListScene,
  EdgeRecordScene,
  LoggedOutScene,
  PageNotFoundScene,
  RegisterEdgeScene,
  UnauthorizedScene,
} from 'scenes';

/**
 * Declare router logic using new v6.4 Data Api.
 * https://reactrouter.com/en/main/routers/picking-a-router#using-v64-data-apis
 *
 * NOTES:
 * - errorElement is a react-router native ErrorBoundary mechanism to catch unhandled
 * errors and avoid bubbling them up in the tree. As a result, we can avoid implementing
 * a specific react <ErrorBoundary />. Just remember: react error boundaries catch
 * synchronous errors, not async errors (for example in handlers).
 */

export const AppRouter: React.FC = () => {
  const { status, isAuthenticated } = useAuth();

  const router = React.useMemo(
    () =>
      createBrowserRouter(
        createRoutesFromElements(
          <Route
            element={
              <>
                <SyncLocationState />
                <Outlet />
              </>
            }
            errorElement={<SomethingWentWrong fullscreen />}
          >
            {/* Common global utility routes*/}
            <Route
              path={routes.global.unauthorized}
              element={
                status === 'unauthorized' ? <UnauthorizedScene /> : <Navigate to={routes.root} />
              }
            />
            <Route
              path={routes.global.loggedOut}
              element={status === 'logged-out' ? <LoggedOutScene /> : <Navigate to={routes.root} />}
            />
            {/* Protected routes CHECKPOINT. Authentication. If successful, app frame wrapper */}
            <Route
              element={
                isAuthenticated ? (
                  <AppFrameScene>
                    <Outlet />
                  </AppFrameScene>
                ) : (
                  <Navigate
                    to={
                      status === 'logged-out' ? routes.global.loggedOut : routes.global.unauthorized
                    }
                  />
                )
              }
            >
              {/* Edge list */}
              <Route
                path={routes.edge.list}
                element={<EdgeListScene />}
                errorElement={<SomethingWentWrong />}
              />
              {/* Edge record */}
              <Route
                element={
                  <EdgeRecordScene>
                    <Outlet />
                  </EdgeRecordScene>
                }
              >
                <Route
                  path={routes.edge.record.overview}
                  element={<EdgeOverviewScene />}
                  errorElement={<SomethingWentWrong />}
                />
                <Route
                  path={routes.edge.record.applications}
                  element={<EdgeApplicationsScene />}
                  errorElement={<SomethingWentWrong />}
                />
                <Route
                  path={routes.edge.record.sources}
                  element={<EdgeDataSourcesScene />}
                  errorElement={<SomethingWentWrong />}
                />
              </Route>
              <Route
                path={routes.edge.register}
                element={<RegisterEdgeScene />}
                errorElement={<SomethingWentWrong />}
              />
              {/* INDEX route: redirection to default landing page */}
              <Route index element={<Navigate to={routes.edge.list} />} />
            </Route>
            {/* INDEX route: For any other route, page not found */}
            <Route path="*" element={<PageNotFoundScene />} />
          </Route>
        )
      ),
    [status]
  );

  return <RouterProvider router={router} />;
};
