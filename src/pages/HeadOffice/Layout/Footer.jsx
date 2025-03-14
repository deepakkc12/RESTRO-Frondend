import { CiSearch, CiViewList } from "react-icons/ci"
import { RiTeamFill } from "react-icons/ri";
import { MdCreateNewFolder } from "react-icons/md";
import { GrContactInfo } from "react-icons/gr";

import { NavLink } from 'react-router-dom';

const FooterMenu = () => {
    const ActiveClass = ({ isActive, isPending }) => {
        return isPending ? "pending" : isActive ? "active" : ""
    }

    return (
        <footer
            className="Footer_NavLink fixed bottom-0 left-0 w-full p-3 transition-all bg-green-900 lg:p-4 lg:bottom-1/2 lg:w-fit lg:rounded-r-3xl lg:shadow-lg">
            <ul className="grid grid-cols-4 gap-1 items-center place-items-center  lg:grid-cols-1 lg:w-fit lg:gap-5">
                <li>
                    <NavLink to={'/'}  className={({ isActive }) => ActiveClass({ isActive })} >
                        <GrContactInfo 

                            className="text-xl font-thin text-white hover:scale-110 transition-all lg:p-2.5 lg:text-[44px]" />
                    </NavLink>
                </li>
                <li>
                    <NavLink to={'/create'} className={({ isActive }) => ActiveClass({ isActive })}>
                        <MdCreateNewFolder
                        className="text-2xl hover:scale-110 transition-all text-white lg:p-2 lg:text-[44px]" />
                    </NavLink>
                </li>
                <li>
                    <NavLink to={'/team'} className={({ isActive }) => ActiveClass({ isActive })}>
                        <RiTeamFill className="text-2xl text-white font-thin hover:scale-110 transition-all lg:p-2 lg:text-[44px]" />
                    </NavLink>
                </li>
                <li>
                    <NavLink to={'/settings'} className={({ isActive }) => ActiveClass({ isActive })}>
                        <CiViewList className="text-2xl text-white font-thin hover:scale-110  transition-all lg:p-2 lg:text-[44px]" />
                    </NavLink>
                </li>
            </ul>
        </footer>
    )
}

export default FooterMenu
