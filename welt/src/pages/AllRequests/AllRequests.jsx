import styles from "./AllRequests.module.scss"
import SideNavigation from "../../components/Navigation/SideNavigation/SideNavigation.jsx";
import PageBuilder from "../../components/PageBuilder/PageBuilder.jsx";
import AvatarPlaceholder from "../../assets/placeholders/avatar-placeholder.svg"
import Request from "../../components/Request/Request.jsx";
import {useGetProfileQuery, useGetRequestsQuery} from "../../store/services/welt.js";

export default function AllRequests(){
    const {data: requests, isLoading: requestsIsLoading, requestsError} = useGetRequestsQuery()
    /*const requests = [
        {user: "Иванов Иван", email: "example@gmail.com", date: "25.03.2025 08:00", issue: "У меня как обычно что-то сломалось", description: "Я даже не знаю как объяснить. У меня просто ничего не работает. Почините пожалуйста. Срочно!!!", status: "В работе"},
        {user: "Иванов Иван", email: "example@gmail.com", date: "25.03.2025 08:00", issue: "У меня как обычно что-то сломалось", description: "Я даже не знаю как объяснить. У меня просто ничего не работает. Почините пожалуйста. Срочно!!!", status: "В работе"},
        {user: "Иванов Иван", email: "example@gmail.com", date: "25.03.2025 08:00", issue: "У меня как обычно что-то сломалось", description: "Я даже не знаю как объяснить. У меня просто ничего не работает. Почините пожалуйста. Срочно!!!", status: "В работе"},
        {user: "Иванов Иван", email: "example@gmail.com", date: "25.03.2025 08:00", issue: "У меня как обычно что-то сломалось", description: "Я даже не знаю как объяснить. У меня просто ничего не работает. Почините пожалуйста. Срочно!!!", status: "В работе"},
        {user: "Иванов Иван", email: "example@gmail.com", date: "25.03.2025 08:00", issue: "У меня как обычно что-то сломалось", description: "Я даже не знаю как объяснить. У меня просто ничего не работает. Почините пожалуйста. Срочно!!!", status: "В работе"},
        {user: "Иванов Иван", email: "example@gmail.com", date: "25.03.2025 08:00", issue: "У меня как обычно что-то сломалось", description: "Я даже не знаю как объяснить. У меня просто ничего не работает. Почините пожалуйста. Срочно!!!", status: "В работе"},
        {user: "Иванов Иван", email: "example@gmail.com", date: "25.03.2025 08:00", issue: "У меня как обычно что-то сломалось", description: "Я даже не знаю как объяснить. У меня просто ничего не работает. Почините пожалуйста. Срочно!!!", status: "В работе"},
        {user: "Иванов Иван", email: "example@gmail.com", date: "25.03.2025 08:00", issue: "У меня как обычно что-то сломалось", description: "Я даже не знаю как объяснить. У меня просто ничего не работает. Почините пожалуйста. Срочно!!!", status: "В работе"},
        {user: "Иванов Иван", email: "example@gmail.com", date: "25.03.2025 08:00", issue: "У меня как обычно что-то сломалось", description: "Я даже не знаю как объяснить. У меня просто ничего не работает. Почините пожалуйста. Срочно!!!", status: "В работе"},
    ]*/

    const paths =[
        {title: "DoWork", path: ""},
        {title: "Заявки", path: "/:project/requests"},
        {title: "Все заявки", path: "/:project/requests"}
    ]
    console.log(JSON.stringify(requests))
    return(
        <PageBuilder paths={paths} sideComponent={<SideNavigation alias={"all-requests"}/>}>
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