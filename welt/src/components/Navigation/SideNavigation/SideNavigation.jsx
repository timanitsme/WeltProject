import styles from "./SideNavigation.module.scss"
import {FaCheckSquare, FaInbox, FaSearch} from "react-icons/fa";
import {FaFolderOpen} from "react-icons/fa6";
import {Link, useLocation, useNavigate} from "react-router-dom";
import {RiCloseCircleFill, RiProgress1Fill} from "react-icons/ri";


export default function SideNavigation({title, paths, alias}){
    const location = useLocation()
    const navigate = useNavigate()

    return(
        <div className={styles.navigationContainer}>
            <h6>{title}</h6>
            <div className="horizontal-divider"></div>
            {paths && paths.map((path, index) => {
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