import styles from "./Sidebar.module.scss"
import WeltLogo from "../../../assets/welt-logo.svg?react"
import {FaBoxTissue, FaCaretDown} from "react-icons/fa6";
import {IoChatbubbles, IoSettingsSharp} from "react-icons/io5";
import AvatarPlaceholder from "../../../assets/placeholders/avatar-placeholder.svg"
import Tooltip from "../../Tooltip/Tooltip.jsx";
import {useEffect, useState} from "react";
import SideNavigation from "../../Navigation/SideNavigation/SideNavigation.jsx";
import {Link, useLocation, useNavigate} from "react-router-dom";
import SidebarPath from "./SidebarPath/SidebarPath.jsx";
import useAuth from "../../../utils/customHooks/useAuth.js";
import {useGetMyProjectsQuery} from "../../../store/services/welt.js";


export default function Sidebar(){
    const {data: myProjects, isLoading: myProjectsIsLoading, error: myProjectsError} = useGetMyProjectsQuery()
    const {isAuthorized} = useAuth()
    const [isProjectsExpanded, setProjectsExpanded] = useState(false)
    const projects = [
        {title: "dowork", image: AvatarPlaceholder},
        {title: "goplan", image: AvatarPlaceholder},
        {title: "neurea", image: AvatarPlaceholder},
        {title: "pokeTrade", image: AvatarPlaceholder},
        {title: "soFine", image: AvatarPlaceholder},
    ]
    const navigate = useNavigate()
    const [displayedProjects, setDisplayedProjects] = useState([projects[0]])
    const currentPage = useLocation().pathname.split("/")
    const [imageSources, setImageSources] = useState([]);

    useEffect(() => {
        if (myProjects) {
            setImageSources(myProjects.map(project => project.icon));
        }
    }, [myProjects]);

    const handleImageError = (index) => {
        const newImageSources = [...imageSources];
        newImageSources[index] = AvatarPlaceholder; // Заменяем на запасное изображение
        setImageSources(newImageSources);
    };


    const isCurrentPage = (path) => {
        return path === currentPage[1] || path === currentPage[2]
    }

    useEffect(() => {
        console.log(`my projects: ${JSON.stringify(myProjects)}`)
    }, [myProjects]);


    const handleExpand = () => {
        if (isProjectsExpanded){
            setProjectsExpanded(false)
            setDisplayedProjects([projects[0]])
        }
        else{
            setProjectsExpanded(true)
            setDisplayedProjects(projects)
        }
    }

    return(
        <div className={styles.side}>
            <div className={styles.sidebar}>
                <Link to={"/"}><WeltLogo/></Link>
                {isAuthorized &&
                <>
                    { myProjects && !myProjectsIsLoading && myProjects?.length !== 0 &&
                        <div className={`${styles.selectorContainer} ${isProjectsExpanded? styles.expanded: ''}`}>
                            <div className={styles.projectSelector}>
                                {myProjects.map((project, index) => {
                                    return(
                                        <Tooltip text={project.title} key={index}>
                                            <div className={styles.avatarContainer}>
                                                <img src={imageSources[index] !== ""? imageSources[index]: AvatarPlaceholder} alt='' onError={() => handleImageError(index)} className={styles.avatarImage}/>
                                            </div>
                                        </Tooltip>
                                    )
                                })
                                }
                            </div>
                            <div className={styles.expand} onClick={handleExpand}>
                                <FaCaretDown/>
                            </div>
                        </div>
                    }
                    <div className="horizontal-divider" onClick={() => navigate("/project/requests")}/>
                    <SidebarPath Icon={FaBoxTissue} title={"Заявки"} isCurrent={isCurrentPage("requests")} onClick={() => navigate("/project/requests")}/>
                    <SidebarPath Icon={IoChatbubbles} title={"Чат"} isCurrent={isCurrentPage("chats")} onClick={() => navigate("/chats")}/>
                    <span className={styles.bottomPaths}>
                <div className="horizontal-divider"/>
                    <SidebarPath Icon={IoSettingsSharp} title={"Настройки"} isCurrent={isCurrentPage("settings")} onClick={() => navigate("/settings")}/>
                </span>
                </>
                }
            </div>
        </div>
    )
}