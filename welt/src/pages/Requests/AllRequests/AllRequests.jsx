import styles from "./AllRequests.module.scss"
import SideNavigation from "../../../components/Navigation/SideNavigation/SideNavigation.jsx";
import PageBuilder from "../../../components/PageBuilder/PageBuilder.jsx";
import AvatarPlaceholder from "../../../assets/placeholders/avatar-placeholder.svg"
import Request from "../../../components/Request/Request.jsx";
import {useGetProfileQuery, useGetRequestsQuery} from "../../../store/services/welt.js";
import {FaFolderOpen} from "react-icons/fa6";
import {RiCloseCircleFill, RiProgress1Fill} from "react-icons/ri";
import {FaCheckSquare, FaInbox} from "react-icons/fa";
import useAuth from "../../../utils/customHooks/useAuth.js";

export default function AllRequests(){
    const {data: requests, isLoading: requestsIsLoading, requestsError} = useGetRequestsQuery()
    const { currentProject } = useAuth();
    const sidePaths = [
        {Icon: FaFolderOpen, text: "Все заявки", path: "/requests", alias: "all-requests"},
        {Icon: RiProgress1Fill, text: "В работе", path: "/requests/in-progress/", alias: "in-progress-requests"},
        {Icon: FaCheckSquare, text: "Завершенные", path: "/requests/completed/", alias: "completed-requests"},
        {Icon: RiCloseCircleFill, text: "Отклоненные", path: "/requests/rejected/", alias: "rejected-requests"},
        {Icon: FaInbox, text: "Мои заявки", path: "/requests/my/", alias: "my-requests"},
    ]

    const paths =[
        {title: `${currentProject?.title}`, path: ""},
        {title: "Заявки", path: "/requests"},
        {title: "Все заявки", path: "/requests"}
    ]

    return(
        <PageBuilder paths={paths} sideComponent={<SideNavigation title="Заявки" paths={sidePaths} alias={"all-requests"}/>}>
            <h3>Все заявки</h3>
            <div className="horizontal-divider"></div>
                {requestsIsLoading && <div><p>Загрузка...</p></div>}
                {requestsError && <div><p>Не удалось получить заявки</p></div>}
                {!requestsError && !requestsIsLoading && requests?.requests?.length === 0 && <div><p>Заявки отсутствуют</p></div>}
            <div className={styles.requestsList}>
                {!requestsError && !requestsIsLoading && requests?.requests?.length !== 0 && requests?.requests?.map((request, index) => {
                    return <Request key={index} request={request}/>
                })}
            </div>
        </PageBuilder>
    )
}