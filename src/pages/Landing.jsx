import React from 'react'
import { useSelector } from 'react-redux'
import { Navigate } from 'react-router-dom'
import { roles } from '../routes/RolebasedRoutes';

function Landing() {

    const user = useSelector(state=>state.auth.user);
    let redirectPath = '/'
    if(user){

      if (user.role == roles.employee){
        redirectPath = '/menu'
      }else if(user.role == roles.superAdmin){
        redirectPath = "/ho/dashboard"
      }else{
        redirectPath = '/login'
      }
      
    // redirectPath = user.role===roles.employee?"/menu":"/"

      // redirectPath = "/menu?category=1"
    //   if (user.employee?.kotTypeCode > 3){
    //     console.log("inside dinin")
    // redirectPath = user.role==='employee'?"/menu":"/"
    //   }
    //   else if(user.employee?.kotTypeCode ==null){
    //     redirectPath = "/login"
    //   }
    //   else{
    //   }
    }else{
        redirectPath = "/login"
    }
  return (
    <Navigate to={redirectPath}/>
  )
}

export default Landing