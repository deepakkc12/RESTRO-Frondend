import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout } from '../redux/Authentication/action';

const UseHandleUnauthorizedResponse = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
  
    const handleUnauthorizedResponse = (error) => {
      const { status } = error.response;
      if (status === 401) {
        // Perform the necessary actions when the response is unauthorized
        navigate('/');
        dispatch(logout());
      }
      return Promise.reject(error);
    };
  
    return handleUnauthorizedResponse;
  };

export default UseHandleUnauthorizedResponse
  