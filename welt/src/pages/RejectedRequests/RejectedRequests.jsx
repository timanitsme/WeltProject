import styles from "./RejectedRequests.module.scss"
import SideNavigation from "../../components/Navigation/SideNavigation/SideNavigation.jsx";
import PageBuilder from "../../components/PageBuilder/PageBuilder.jsx";
import {useGetRequestsQuery} from "../../store/services/welt.js";

export default function RejectedRequests(){
    const {data: requests, isLoading: requestsIsLoading, requestsError} = useGetRequestsQuery({status: "REJECTED"})

    const paths =[
        {title: "DoWork", path: ""},
        {title: "Заявки", path: "/:project/requests"},
        {title: "Все заявки", path: "/:project/requests"}
    ]
    console.log(JSON.stringify(requests))
    return(
        <PageBuilder paths={paths} sideComponent={<SideNavigation alias={"rejected-requests"}/>}>
            <h3>Отклоненные заявки</h3>
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