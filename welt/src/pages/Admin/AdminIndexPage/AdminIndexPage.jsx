import styles from "./AdminIndexPage.module.scss"
import SideNavigation from "../../../components/Navigation/SideNavigation/SideNavigation.jsx";
import PageBuilder from "../../../components/PageBuilder/PageBuilder.jsx";
import {FaBoxTissue, FaFolderOpen, FaUser} from "react-icons/fa6";
import {RiCloseCircleFill, RiProgress1Fill} from "react-icons/ri";
import {FaCheckSquare, FaInbox, FaTasks} from "react-icons/fa";
import {GoProject} from "react-icons/go";
import {useNavigate} from "react-router-dom";
import getAdminSidePaths from "../../../utils/adminSidePaths.js";

export default function AdminIndexPage(){
    const navigate = useNavigate()

    const paths =[
        {title: "Welt", path: "/"},
        {title: "Администрирование", path: ""},
    ]

    return(
        <PageBuilder paths={paths} sideComponent={<SideNavigation title="Администрирование" paths={getAdminSidePaths()} alias={"all-requests"}/>}>
            <h3>Администрирование</h3>
            <div className="horizontal-divider"></div>
            <h5>Модули</h5>
            <div className={styles.modulesContainer}>
                {getAdminSidePaths().map((path) =>
                    <div className={styles.module} onClick={() => navigate(path.path)}>
                        <path.Icon/>
                        <p>{path.text}</p>
                    </div>
                )}
            </div>
        </PageBuilder>
    )
}