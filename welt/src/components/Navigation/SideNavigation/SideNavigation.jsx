import styles from "./SideNavigation.module.scss"
import {FaCheckSquare, FaSearch} from "react-icons/fa";
import {FaFolderOpen} from "react-icons/fa6";
import {Link, useLocation, useNavigate} from "react-router-dom";
import {RiCloseCircleFill, RiProgress1Fill} from "react-icons/ri";
import {CiInboxOut} from "react-icons/ci";


export default function SideNavigation({alias}){
    const location = useLocation()
    const navigate = useNavigate()
    const paths = [
        {Icon: FaFolderOpen, text: "Все заявки", path: "/:project/requests", alias: "all-requests"},
        {Icon: RiProgress1Fill, text: "В работе", path: "/:project/requests/in-progress/", alias: "in-progress-requests"},
        {Icon: FaCheckSquare, text: "Завершенные", path: "/:project/requests/completed/", alias: "completed-requests"},
        {Icon: RiCloseCircleFill, text: "Отклоненные", path: "/:project/requests/rejected/", alias: "rejected-requests"},
        {Icon: CiInboxOut, text: "Мои заявки", path: "/:project/requests/my/", alias: "my-requests"},
    ]
    return(
        <div className={styles.navigationContainer}>
            <h6>Заявки</h6>
            <div className="horizontal-divider"></div>
            {paths.map((path, index) => {
                return(
                    <div key={index} onClick={() => navigate(path.path)} className={`${styles.path} ${path.alias === alias? styles.active: ''}`}>
                        <path.Icon/>
                        <p className="noSelect">{path.text}</p>
                    </div>
                )
            })}
        </div>
    )
}