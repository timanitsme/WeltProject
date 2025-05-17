import styles from "./Overview.module.scss"
import PageBuilder from "../../components/PageBuilder/PageBuilder.jsx";
import SideNavigation from "../../components/Navigation/SideNavigation/SideNavigation.jsx";
import Request from "../../components/Request/Request.jsx";
import useAuth from "../../utils/customHooks/useAuth.js";
import Dialogues from "../../components/Navigation/Dialogues/Dialogues.jsx";
import DialoguesOverview from "../../components/Navigation/Dialogues/DialoguesOverview/DialoguesOverview.jsx";
import {useGetMyDialoguesQuery, useGetMyProjectsQuery, useGetTasksByProjectQuery} from "../../store/services/welt.js";
import {setCurrentProject} from "../../store/services/authSlice.js";
import {useDispatch} from "react-redux";
import {isMobile} from "react-device-detect";

export default function Overview(){
    const {isAuthorized, userProfile, isLoading, error, currentProject} = useAuth()
    const {data: dialogues, isLoading: dialoguesIsLoading, error: dialoguesError, refetch: refreshDialogues} = useGetMyDialoguesQuery()
    const {data: myProjects, isLoading: myProjectsIsLoading, error: myProjectsError} = useGetMyProjectsQuery()
    const { data: tasks = [], isLoading: tasksIsLoading } = useGetTasksByProjectQuery(
        { projectId: currentProject?.id },
        { skip: !currentProject }
    );
    const dispatch = useDispatch()
    const handleProjectClick = (project) => {
        if (project.id === currentProject?.id) return;
        dispatch(setCurrentProject(project));
    };

    if (isLoading || !isAuthorized) return null
    return(
        <PageBuilder>
            <h3>Добро пожаловать, {userProfile?.first_name}!</h3>
            <div className="horizontal-divider"></div>
            <div className={styles.cols}>
                <div className={styles.mainContent}>
                    <h4>Ваши проекты:</h4>
                    {myProjectsIsLoading ? (
                        <div className={styles.projectsGrid}>
                            {[1,2,3,4].map((i) => (
                                <div key={i} className={styles.projectCardSkeleton} />
                            ))}
                        </div>
                    ) : myProjectsError ? (
                        <div className={styles.error}>Ошибка загрузки проектов</div>
                    ) : (
                        <div className={styles.projectsGrid}>
                            {myProjects?.map((project) => (
                                <div
                                    key={project.id}
                                    className={`${styles.projectCard} ${
                                        currentProject?.id === project.id ? styles.selected : ''
                                    }`}
                                    onClick={() => handleProjectClick(project)}
                                >
                                    <div className={styles.cardHeader}>
                                        {project.icon ? (
                                            <img
                                                src={project.icon}
                                                alt={project.title}
                                                className={styles.projectImage}
                                            />
                                        ) : (
                                            <div className={styles.imagePlaceholder}>
                                                {project.title[0].toUpperCase()}
                                            </div>
                                        )}
                                    </div>
                                    <h4 className={styles.projectTitle}>{project.title}</h4>
                                    <div className={styles.projectBadge}>
                                        {currentProject?.id === project.id && (
                                            <span className={styles.selectedLabel}>Выбран</span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                <div className={styles.hideOver}>
                    {!isMobile && <DialoguesOverview dialogues={dialogues} dialoguesIsLoading={dialoguesIsLoading} dialoguesError={dialoguesError}/>}
                </div>
            </div>
        </PageBuilder>
    )
}