import React, { useState } from 'react';
import FullscreenToggle from '../../Features/Buttons/FullScreenToggle';
import MenuRedirect from '../../Features/Buttons/MenuRedurectButton';
import Title from '../../Features/Badges/Title';
import SettingsButton from '../../Features/Buttons/SettingsButton';

const ReportHeader = () => {
  return (
    <header className="w-full bg-white  shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <Title/>

        

          {/* Right Side Controls */}
          <div className="flex items-center gap-3">
            <SettingsButton/>
            <FullscreenToggle />
            {/* <DarkModeToggle /> */}
            <MenuRedirect/>
            
            {/* Cart Button */}
          
          </div>
        </div>
      </div>

      {/* Cart Modal */}
    
    </header>
  );
};

export default ReportHeader;