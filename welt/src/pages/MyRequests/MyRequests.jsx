import {useGetRequestsQuery, useGetSentRequestsQuery} from "../../store/services/welt.js";
import PageBuilder from "../../components/PageBuilder/PageBuilder.jsx";
import SideNavigation from "../../components/Navigation/SideNavigation/SideNavigation.jsx";
import styles from "../CompletedRequests/CompletedRequests.module.scss";
import Request from "../../components/Request/Request.jsx";

export default function MyRequests(){
    const {data: requests, isLoading: requestsIsLoading, requestsError} = useGetSentRequestsQuery()

    const paths =[
        {title: "DoWork", path: ""},
        {title: "Заявки", path: "/:project/requests"},
        {title: "Все заявки", path: "/:project/requests"}
    ]
    console.log(JSON.stringify(requests))
    return(
        <PageBuilder paths={paths} sideComponent={<SideNavigation alias={"my-requests"}/>}>
            <h3>Мои заявки</h3>
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