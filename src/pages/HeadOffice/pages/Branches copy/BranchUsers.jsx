import React from 'react'
import MainLayout from '../../Layout/Layout'
import { useLocation, useNavigate } from 'react-router-dom';
import BranchDetailsView from './BranchDetails';
import UserManager from '../../../Private/UserManager/UserManager';

function BranchUsers() {
    const location = useLocation();
    const { branch } = location.state || {};

    const navigate = useNavigate()
  return (
    <MainLayout>
      <div className='space-y-3 p-6'>
        <BranchDetailsView branch={branch} navigate={navigate}/>
      </div>
      <UserManager/>
    </MainLayout>
  )
}

export default BranchUsers
