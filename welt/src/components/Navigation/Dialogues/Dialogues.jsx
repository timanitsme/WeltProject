import {useLocation, useNavigate} from "react-router-dom";
import {FaFolderOpen} from "react-icons/fa6";
import {FaCheckSquare, FaSearch} from "react-icons/fa";
import ImagePlaceholder from "../../../assets/placeholders/avatar-placeholder.svg"
import styles from "./Dialogues.module.scss"
import {IoClose} from "react-icons/io5";
import {useCreatePrivateChatMutation} from "../../../store/services/welt.js";
import {toast} from "react-toastify";
import {Avatar} from "@mui/material";

export default function Dialogues({selectedChat, setSelectedChat, dialogues, dialoguesIsLoading, dialoguesError, searchInput, setSearchInput, onNewChatCreated}){
    const location = useLocation()
    const navigate = useNavigate()
    const [createPrivateChat, {isLoading: createPrivateChatIsLoading, isSuccess: createPrivateChatIsSuccess}] = useCreatePrivateChatMutation()

    const getFormattedDate = (dateString) => {
        const date = new Date(`${dateString}Z`);

        const formatter = new Intl.DateTimeFormat('default', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
        });
        return formatter.format(date);
    };


    const handleNewDialogue = async (userId) => {
        try {
            const response = await createPrivateChat({userId: userId}).unwrap();
            if (onNewChatCreated){
                onNewChatCreated(response.id)
            }
        } catch (err) {
            console.error(`send message error: ${JSON.stringify(err)}`)
            toast.error('Не удалось создать диалог');
        }
    }

    return(
        <div className={styles.navigationContainer}>
            <h6>Чаты</h6>
            <div className={styles.searchBar}>
                <FaSearch/>
                <input type="text" value={searchInput} onChange={(e) => setSearchInput(e.target.value)} placeholder="Поиск"/>
                {searchInput.length > 0 && <IoClose style={{marginLeft: "auto"}} onClick={() => setSearchInput("")}/>}
            </div>
            <div className="horizontal-divider"/>
            <div className={styles.dialoguesContainer}>
                {dialoguesIsLoading && <p>Загрузка...</p>}
                {dialoguesError && <p>Ошибка при получении диалогов</p>}
                {dialogues?.chats?.length === 0 && dialogues?.users_without_chats?.length === 0 && <p>Диалоги отсутствуют</p>}
                {!dialoguesIsLoading && !dialoguesError && dialogues?.chats?.map(((dialogue, index) => {
                    return(
                        <div key={index} className={`${styles.dialogue} noSelect ${selectedChat === dialogue.id? styles.selected: ""}`} onClick={() => selectedChat === dialogue.id? setSelectedChat(null): setSelectedChat(dialogue.id)}>
                            {dialogue["is_group_chat"]? <Avatar src={`${dialogue?.icons?.length > 0?  dialogue?.icons[0]: ""}`}></Avatar>
                            : <Avatar src={`${dialogue?.icons?.length > 0?  dialogue?.icons[0]: ""}`}></Avatar>
                            }
                            <div className={styles.col}>
                                <div className={styles.row}>
                                    <p className={"text-min no-overflow bold"}>{dialogue?.name}</p>
                                    {dialogue?.last_message?.sent_at && <p className={"text-min text-secondary no-overflow"}>{getFormattedDate(dialogue?.last_message?.sent_at)}</p>}
                                </div>
                                {dialogue?.last_message?.text && <p className={"text-min text-secondary limited-text-1"}>{dialogue?.last_message?.text}</p>}
                            </div>
                        </div>
                    )
                }))}
                {!dialoguesIsLoading && !dialoguesError && dialogues?.users_without_chats?.map(((dialogue, index) => {
                    return(
                        <div key={index} className={`${styles.dialogue} noSelect`} onClick={() => handleNewDialogue(dialogue.id)}>
                            <Avatar src={`${dialogue?.icons? dialogue?.icons: ""}`}></Avatar>
                            <div className={styles.col}>
                                <div className={styles.row}>
                                    <p className={"text-min no-overflow bold"}>{dialogue?.name}</p>
                                </div>
                                <p className={"text-min text-secondary limited-text-1"}>Начните общение</p>
                            </div>
                        </div>
                    )
                }))}
            </div>
        </div>
    )
}