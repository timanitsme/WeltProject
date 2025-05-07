import styles from "./Request.module.scss"
import AvatarPlaceholder from "../../assets/placeholders/avatar-placeholder.svg";
import {useLocation, useNavigate} from "react-router-dom";

export default function Request({request}){
    const navigate = useNavigate()
    const getStatusTitle = (status) => {
        if (status === "IN PROGRESS"){
            return "В работе"
        }
        else if (status === "COMPLETED"){
            return "Завершена"
        }
        else if (status === "REJECTED"){
            return "Отклонена"
        }
        else{
            return ""
        }

    }

    const formatDate = (dateString) => {
        const date = new Date(`${dateString}Z`);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${day}.${month}.${year} ${hours}:${minutes}`;
    };

    return(
        <div className={styles.request}>
            <div className={styles.col}>
                <div className={styles.avatarContainer}>
                    <img src={AvatarPlaceholder} alt='' className={styles.avatarImage}/>
                </div>
            </div>
            <div className={styles.col}>
                <h6>{request?.sender?.first_name} {request?.sender?.last_name}</h6>
                <p className="text-secondary">{request?.sender?.email}</p>
                <p className="text-secondary">{formatDate(request?.created_at)}</p>
            </div>
            <div className={`${styles.col}`} style={{flex: "1"}}>
                <p><span className="text-secondary">Тема:</span> {request?.subject}</p>
                <p><span className="text-secondary">Описание:</span> {request?.description}</p>
            </div>
            <div className={styles.col} style={{gap: "10px"}}>
                <p><span className="text-secondary">Статус:</span> <span className="text-primary">{getStatusTitle(request?.status?.title)}</span></p>
                <button className="button-primary" onClick={() => navigate(`/request/${request?.id}`)}>Подробнее</button>
            </div>
        </div>
    )
}