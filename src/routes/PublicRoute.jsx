import React from 'react';
import { useSelector } from 'react-redux';
import { Route,  Navigate } from 'react-router-dom';

const PublicRoute = ({ children, restricted, }) => {
    const isAuth = useSelector(state=>state.auth.isAuth);
    return isAuth && restricted ? (
        <Navigate to="/" />
      ) : (
        children
      );
};

export default PublicRoute;
