import styles from "./RequestDetail.module.scss"
import PageBuilder from "../../../components/PageBuilder/PageBuilder.jsx";
import SideNavigation from "../../../components/Navigation/SideNavigation/SideNavigation.jsx";
import Message from "../../../components/Message/Message.jsx";
import {FaEllipsisVertical, FaFolderOpen, FaPaperclip, FaPaperPlane} from "react-icons/fa6";
import {
    useChangeRequestStatusMutation,
    useGetChatMessagesQuery,
    useGetRequestByIdQuery,
    useSendMessageMutation
} from "../../../store/services/welt.js";
import {useParams} from "react-router-dom";
import {Fragment, useEffect, useRef, useState} from "react";
import groupMessagesByDate from "../../../utils/functions/groupMessagesByDate.js";
import {toast} from "react-toastify";
import ContextMenu from "../../../components/ContextMenu/ContextMenu.jsx";
import Tooltip from "../../../components/Tooltip/Tooltip.jsx";
import {RiCloseCircleFill, RiProgress1Fill} from "react-icons/ri";
import {FaCheckSquare, FaInbox} from "react-icons/fa";
import useAuth from "../../../utils/customHooks/useAuth.js";

export default function RequestDetail(){
    const params = useParams()
    const {data: request, isLoading: requestIsLoading, error: requestError, refetch: refreshRequest} = useGetRequestByIdQuery({requestId: params.id})
    const {data: chat, isLoading: chatIsLoading, error: chatError, refetch: refreshChat} = useGetChatMessagesQuery({chatId: request?.chat_id}, {skip: !request?.chat_id})
    const [sendMessage, {isLoading: sendMessageIsLoading, isSuccess: sendMessageIsSuccess}] = useSendMessageMutation()
    const [changeStatus, {isLoading: changeStatusIsLoading, isSuccess: changeStatusIsSuccess}] = useChangeRequestStatusMutation()
    const [newMessage, setNewMessage] = useState("")
    const messagesContainerRef = useRef(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const { currentProject } = useAuth();

    const paths =[
        {title: `${currentProject?.title}`, path: ""},
        {title: "Заявки", path: "/requests"},
        {title: `Заявка ${request?.id}`, path: ""}
    ]

    const padding = {padding: "0 10px"}

    useEffect(() => {
        if (request?.chat_id) {
            const socket = new WebSocket(`ws://${window.location.host}/sockets/ws/chat/${request?.chat_id}`);

            socket.onopen = () => {
                console.log("WebSocket connection established");
            };

            socket.onmessage = (event) => {
                console.log("New message received:", event.data);
                refreshChat();
            };

            socket.onerror = (error) => {
                console.error("WebSocket error:", error);
            };

            socket.onclose = () => {
                console.log("WebSocket connection closed");
            };

            return () => {
                socket.close();
            };
        }
    }, [request]);

    const groupedMessages = chat?.messages ? groupMessagesByDate(chat.messages) : [];
    const [contextMenu, setContextMenu] = useState(null);

    const handleContextMenu = (event, message) => {
        event.preventDefault();
        const chatContainer = document.querySelector(`.${styles.chat}`);
        const { top: containerTop, left: containerLeft } = chatContainer.getBoundingClientRect();

        setContextMenu({
            x: event.clientX - containerLeft, // Вычитаем смещение контейнера
            y: event.clientY - containerTop,
            message: message
        });
    };

    const handleSendMessage = async () => {
        try {
            const response = await sendMessage({chatId: request?.chat_id, text: newMessage}).unwrap();
            refreshChat();
            setNewMessage("")
        } catch (err) {
            console.error(`send message error: ${JSON.stringify(err)}`)
            toast.error('Не удалось отправить сообщение');
        }
    }

    const handleChangeStatus = async (newStatus) => {
        try {
            const response = await changeStatus({requestId: request?.id, newStatusTitle: newStatus}).unwrap();
            refreshRequest();
            toast.success('Статус успешно изменен');
        } catch (err) {
            console.error(`request status change error: ${JSON.stringify(err)}`)
            toast.error('Не удалось изменить статус');
        }
    }

    const scrollToBottom = () => {
        if (messagesContainerRef.current) {
            const container = messagesContainerRef.current;
            container.scrollTop = container.scrollHeight;
        }
    };

    useEffect(() => {
        if (!chatIsLoading && chat?.messages) {
            scrollToBottom();
        }
    }, [chat?.messages]);

    useEffect(() => {
        const handleClickOutside = () => {
            setContextMenu(null);
        };

        document.addEventListener("click", handleClickOutside);
        return () => {
            document.removeEventListener("click", handleClickOutside);
        };
    }, []);

    const handleMessageChange = (e) => {
        setNewMessage(e.target.value)
    }

    const handleKeyDown = async (e) => {
        if (e.key === "Enter") {
            if (!e.shiftKey) {
                e.preventDefault();
                await handleSendMessage();
            }
        }
    };

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

    const toggleMenu = () => {
        setIsMenuOpen((prev) => !prev);
    };

    const sidePaths = [
        {Icon: FaFolderOpen, text: "Все заявки", path: "/requests", alias: "all-requests"},
        {Icon: RiProgress1Fill, text: "В работе", path: "/requests/in-progress/", alias: "in-progress-requests"},
        {Icon: FaCheckSquare, text: "Завершенные", path: "/requests/completed/", alias: "completed-requests"},
        {Icon: RiCloseCircleFill, text: "Отклоненные", path: "/requests/rejected/", alias: "rejected-requests"},
        {Icon: FaInbox, text: "Мои заявки", path: "/requests/my/", alias: "my-requests"},
    ]

    return(
        <PageBuilder paths={paths} sideComponent={<SideNavigation paths={sidePaths} title="Заявки"/>} removePaddings={true}>
            <h3>Заявка {request?.id}</h3>
            <div className={styles.requestInfo} style={padding}>
                <div className={styles.col}>
                    <p><span className="text-secondary">Тема: </span>{request?.subject}</p>
                    <p><span className="text-secondary">Описание: </span>{request?.description}</p>
                </div>
                <div className={`${styles.col} ${styles.fit}`}>
                    <p><span className="text-secondary">Клиент: </span>{request?.sender?.first_name} {request?.sender?.last_name}</p>
                    <p><span className="text-secondary">Email: </span>{request?.sender?.email}</p>
                </div>
                <div className={`${styles.col} ${styles.fit}`}>
                    <p><span className="text-secondary">Дата: </span>{formatDate(request?.created_at)}</p>
                    <p className="text-primary"><span className="text-secondary">Статус: </span>{getStatusTitle(request?.status?.title)}</p>
                </div>
                <div className={`${styles.col} ${styles.fit}`} style={{position: "relative"}}>
                    <div className={styles.menuButton} onClick={toggleMenu}><FaEllipsisVertical/></div>
                    {isMenuOpen && (
                        <div className={styles.menu}>
                            <ul>
                                {request?.status?.title === "IN PROGRESS" && <li onClick={() => handleChangeStatus("COMPLETED")}>Завершить</li>}
                                {request?.status?.title === "IN PROGRESS" && <li onClick={() => handleChangeStatus("REJECTED")}>Отклонить</li>}
                                {request?.status?.title === "REJECTED" && <li onClick={() => handleChangeStatus("IN PROGRESS")}>Взять в работу</li>}
                            </ul>
                        </div>
                    )}
                </div>
            </div>
            <div className="horizontal-divider" style={{margin: "0 10px"}}></div>
            <div className={styles.chat} style={padding} ref={messagesContainerRef}>
                {groupedMessages.map(({ date, messages }) => (
                    <Fragment key={date}>
                        <div className={styles.date}>{date}</div>
                        {messages.map((message, index) => (
                            <Message key={index} message={message} onContextMenu={(e) => handleContextMenu(e, message)}></Message>
                        ))}
                    </Fragment>
                ))}
            </div>
            <div className={styles.newMessage}>
                <textarea rows={1} placeholder="Введите ваше сообшение..." value={newMessage} onChange={handleMessageChange} onKeyDown={handleKeyDown}/>
                <FaPaperclip/>
                <FaPaperPlane onClick={handleSendMessage}/>
            </div>
            <ContextMenu
                contextMenu={contextMenu}
                onClose={() => setContextMenu(null)}
                refreshChat={refreshChat}
            />
        </PageBuilder>
    )
}