import { useSelector } from "react-redux";
import MenuWithSideBar from "../../pages/Private/MenuWithOneSideBar/NewMenuUi";
import Menu from "../../pages/Private/Menu/Menu";
import MenuWithTwoSideBar from "../../pages/Private/MenuWithTwoSideBar/NewMenuUi";




const MENU_COMPONENTS = {
  2: Menu,
  1: MenuWithSideBar,
  3:MenuWithTwoSideBar,
  default: Menu,
};

const DynamicMenuWrapper = () => {

  const { MenuUi } = useSelector((state) => state.settings);

  const Component = MENU_COMPONENTS[MenuUi] || MENU_COMPONENTS.default;

  return <Component />;
};

export default DynamicMenuWrapper;