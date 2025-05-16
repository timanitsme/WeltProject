import {useGetMyProjectsQuery} from "../../../store/services/welt.js";
import useAuth from "../../../utils/customHooks/useAuth.js";
import {useEffect, useRef, useState} from "react";
import AvatarPlaceholder from "../../../assets/placeholders/avatar-placeholder.svg";
import {Link, useLocation, useNavigate} from "react-router-dom";
import styles from "./MobileSidebar.module.scss";
import WeltLogo from "../../../assets/welt-logo.svg?react";
import Tooltip from "../../Tooltip/Tooltip.jsx";
import {FaBoxTissue, FaCaretDown, FaPlus} from "react-icons/fa6";
import SidebarPath from "../Sidebar/SidebarPath/SidebarPath.jsx";
import {IoChatbubbles, IoClose, IoSettingsSharp} from "react-icons/io5";
import {GiHamburger, GiHamburgerMenu} from "react-icons/gi";
import {RiAdminFill} from "react-icons/ri";
import {useDispatch} from "react-redux";
import {setCurrentProject} from "../../../store/services/authSlice.js";

export default function MobileSidebar(){
    const {data: myProjects, isLoading: myProjectsIsLoading, error: myProjectsError} = useGetMyProjectsQuery()
    const {isAuthorized, userProfile, isLoading, currentProject} = useAuth()
    const [isProjectsExpanded, setProjectsExpanded] = useState(false)
    const navigate = useNavigate()
    const [displayedProjects, setDisplayedProjects] = useState([])
    const currentPage = useLocation().pathname.split("/")
    const [imageSources, setImageSources] = useState([]);
    const dispatch = useDispatch()
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef(null)

    const handleProjectClick = (project) => {
        if (project.id === currentProject?.id) return;
        dispatch(setCurrentProject(project));
    };

    useEffect(() => {
        if (myProjects && currentProject && isProjectsExpanded) {
            const sortedProjects = [
                currentProject,
                ...myProjects.filter(p => p.id !== currentProject.id)
            ];

            setDisplayedProjects(sortedProjects);
        }
    }, [currentProject]);

    useEffect(() => {
        if (displayedProjects.length > 0) {
            setImageSources(displayedProjects.map(project => project.icon));
        }
    }, [displayedProjects]);

    const closeMenu = () => {
        setIsMenuOpen(false)
    }

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsMenuOpen(false);
            }
        };

        if (isMenuOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isMenuOpen]);


    useEffect(() => {
        if (myProjects && !myProjectsIsLoading && myProjects.length > 0) {
            let selectedProject = currentProject;

            if (!selectedProject || !myProjects.some(p => p.id === selectedProject.id)) {
                selectedProject = myProjects[0];
                dispatch(setCurrentProject(selectedProject));
            }

            const sortedProjects = [
                selectedProject,
                ...myProjects.filter(p => p.id !== selectedProject.id)
            ];

            setDisplayedProjects(isProjectsExpanded ? sortedProjects : [selectedProject]);
        } else if (!myProjectsIsLoading) {
            setDisplayedProjects([]); // если проектов нет
        }
    }, [myProjects, myProjectsIsLoading, currentProject, dispatch, isProjectsExpanded]);

    const handleImageError = (index) => {
        const newImageSources = [...imageSources];
        newImageSources[index] = AvatarPlaceholder; // Заменяем на запасное изображение
        setImageSources(newImageSources);
    };


    const isCurrentPage = (path) => {
        return path === currentPage[1] || (path === currentPage[2] && currentPage[1] !== "admin")
    }

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);

    };

    const handleExpand = () => {
        if (isProjectsExpanded){
            setProjectsExpanded(false)
            setDisplayedProjects([myProjects[0]])
        }
        else{
            setProjectsExpanded(true)
            setDisplayedProjects(myProjects)
        }
    }

    return(
        <div className={styles.side}>
            <div className={styles.sidebar}>
                <Link to={"/"}><WeltLogo/></Link>
                {isAuthorized &&
                    <div className={styles.sidebarRow}>
                        { myProjects && !myProjectsIsLoading && myProjects?.length !== 0 &&
                            <div className={`${styles.selectorContainer} ${isProjectsExpanded? styles.expanded: ''}`}>
                                <div className={styles.projectSelector}>
                                    {displayedProjects && displayedProjects.map((project, index) => {
                                        return(
                                            <Tooltip text={project.title} key={index}>
                                                <div className={styles.avatarContainer} onClick={() => handleProjectClick(project)}>
                                                    <img src={imageSources[index] !== ""? imageSources[index]: AvatarPlaceholder} alt='' onError={() => handleImageError(index)} className={styles.avatarImage}/>
                                                </div>
                                            </Tooltip>
                                        )
                                    })
                                    }
                                    {(isProjectsExpanded || displayedProjects.length === 0) && userProfile?.role === "ADMIN" &&
                                        <Tooltip text={"Новый проект"}>
                                            <div className={styles.avatarContainer} onClick={() => navigate("/admin/projects/add")}>
                                                <div className={styles.plusButton}>
                                                    <FaPlus/>
                                                </div>
                                            </div>
                                        </Tooltip>
                                    }
                                </div>
                                <div className={styles.expand} onClick={handleExpand}>
                                    <FaCaretDown/>
                                </div>
                            </div>
                        }
                    </div>
                }
                <button className={styles.menuButton} onClick={toggleMenu}>
                    {isMenuOpen? <IoClose/> : <GiHamburgerMenu/>}
                </button>
                {isMenuOpen && (
                    <div className={styles.menu} ref={menuRef}>
                        {/* Ссылки в меню */}
                        <ul className={styles.menuList}>
                            <li>
                                <Link to="/requests" onClick={closeMenu} className={isCurrentPage("requests") ? styles.active : ""}>
                                    Заявки
                                </Link>
                            </li>
                            <li>
                                <Link to="/tasks" onClick={closeMenu} className={isCurrentPage("tasks") ? styles.active : ""}>
                                    Задачи
                                </Link>
                            </li>
                            <li>
                                <Link to="/chats" onClick={closeMenu} className={isCurrentPage("chats") ? styles.active : ""}>
                                    Чат
                                </Link>
                            </li>
                            <li>
                                <Link to="/settings" onClick={closeMenu} className={isCurrentPage("settings") ? styles.active : ""}>
                                    Настройки
                                </Link>
                            </li>
                            {!isLoading && userProfile && userProfile?.role === "ADMIN" &&
                                <li>
                                    <Link to="/admin" onClick={closeMenu} className={isCurrentPage("admin") ? styles.active : ""}>
                                        Администрирование
                                    </Link>
                                </li>
                            }

                        </ul>
                    </div>
                )}
            </div>
        </div>
    )
}