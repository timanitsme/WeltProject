import PageBuilder from "../../../components/PageBuilder/PageBuilder.jsx";
import SideNavigation from "../../../components/Navigation/SideNavigation/SideNavigation.jsx";
import styles from "./CompletedRequests.module.scss";
import Request from "../../../components/Request/Request.jsx";
import {useGetRequestsQuery} from "../../../store/services/welt.js";
import {FaFolderOpen} from "react-icons/fa6";
import {RiCloseCircleFill, RiProgress1Fill} from "react-icons/ri";
import {FaCheckSquare, FaInbox} from "react-icons/fa";
import useAuth from "../../../utils/customHooks/useAuth.js";

export default function CompletedRequests(){
    const {data: requests, isLoading: requestsIsLoading, requestsError} = useGetRequestsQuery({status: "COMPLETED"})
    const { currentProject } = useAuth();

    const paths =[
        {title: `${currentProject?.title}`, path: ""},
        {title: "Заявки", path: "/requests"},
        {title: "Все заявки", path: "/requests"}
    ]
    const sidePaths = [
        {Icon: FaFolderOpen, text: "Все заявки", path: "/requests", alias: "all-requests"},
        {Icon: RiProgress1Fill, text: "В работе", path: "/requests/in-progress/", alias: "in-progress-requests"},
        {Icon: FaCheckSquare, text: "Завершенные", path: "/requests/completed/", alias: "completed-requests"},
        {Icon: RiCloseCircleFill, text: "Отклоненные", path: "/requests/rejected/", alias: "rejected-requests"},
        {Icon: FaInbox, text: "Мои заявки", path: "/requests/my/", alias: "my-requests"},
    ]

    return(
        <PageBuilder paths={paths} sideComponent={<SideNavigation paths={sidePaths} title="Заявки" alias={"completed-requests"}/>}>
            <h3>Завершенные заявки</h3>
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