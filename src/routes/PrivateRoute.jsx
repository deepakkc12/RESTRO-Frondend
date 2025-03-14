import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { routes } from './RolebasedRoutes';

const PrivateRoute = ({ route }) => {
  const { isAuth, user } = useSelector(state => state.auth);

  if (!isAuth) {
    return <Navigate to="/login" />;
  }

  // Verify the route element exists
  if (!route.element) {
    console.error(`No element defined for route: ${route.path}`);
    return <Navigate to="/not-found" />;
  }

  const Component = route.element;
  return <Component />;
};

export default PrivateRoute;