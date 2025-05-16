import styles from "./ChatPage.module.scss"
import PageBuilder from "../../components/PageBuilder/PageBuilder.jsx";
import SideNavigation from "../../components/Navigation/SideNavigation/SideNavigation.jsx";
import Message from "../../components/Message/Message.jsx";
import {FaEllipsisVertical, FaPaperclip, FaPaperPlane} from "react-icons/fa6";
import Dialogues from "../../components/Navigation/Dialogues/Dialogues.jsx";
import {
    useGetChatMessagesQuery,
    useGetMyDialoguesQuery,
    useSendMessageMutation,
    weltApi
} from "../../store/services/welt.js";
import {Fragment, useEffect, useRef, useState} from "react";
import groupMessagesByDate from "../../utils/functions/groupMessagesByDate.js";
import {logout, setCredentials, setUserProfile} from "../../store/services/authSlice.js";
import {toast} from "react-toastify";
import ContextMenu from "../../components/ContextMenu/ContextMenu.jsx";

export default function ChatPage(){
    const [selectedChat, setSelectedChat] = useState(null)
    const [newMessage, setNewMessage] = useState("")
    const {data: chat, isLoading: chatIsLoading, error: chatError, refetch: refreshChat} = useGetChatMessagesQuery({chatId: selectedChat}, {skip: selectedChat === null})
    const [sendMessage, {isLoading: sendMessageIsLoading, isSuccess: sendMessageIsSuccess}] = useSendMessageMutation()
    const messagesContainerRef = useRef(null);
    const [searchInput, setSearchInput] = useState("")
    const [debouncedInput, setDebouncedInput] = useState(searchInput);
    const {data: dialogues, isLoading: dialoguesIsLoading, error: dialoguesError, refetch: refreshDialogues} = useGetMyDialoguesQuery({searchQuery: debouncedInput})

    useEffect(() => {
        const handler = setTimeout(() => {
            if ((searchInput === '' || searchInput.length >= 2) && debouncedInput !== searchInput){
                setDebouncedInput(searchInput);
            }
        }, 500);

        return () => {
            clearTimeout(handler);
        };
    }, [searchInput]);

    useEffect(() => {
        if (selectedChat !== null) {
            const socket = new WebSocket(`ws://${window.location.host}/sockets/ws/chat/${selectedChat}`);

            socket.onopen = () => {
                console.log("WebSocket connection established");
            };

            socket.onmessage = (event) => {
                console.log("New message received:", event.data);
                refreshChat();
                refreshDialogues();
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
    }, [selectedChat]);

    const groupedMessages = chat?.messages ? groupMessagesByDate(chat.messages) : [];

    const padding = {padding: "0 10px"}

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

    const handleSendMessage = async () => {
        try {
            const response = await sendMessage({chatId: selectedChat, text: newMessage}).unwrap();
            refreshChat();
            refreshDialogues();
            setNewMessage("")
        } catch (err) {
            console.error(`send message error: ${JSON.stringify(err)}`)
            toast.error('Не удалось отправить сообщение');
        }
    }

    const handleNewChatCreated = async(chatId) => {
        try {
            await refreshDialogues();
            setSelectedChat(chatId);
        } catch (err) {
            console.error(`new chat created error: ${JSON.stringify(err)}`)
            toast.error('Не удалось поставить новый чат в качестве выбранного');
        }
    };

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

    return(
        <PageBuilder sideComponent={<Dialogues dialogues={dialogues} selectedChat={selectedChat} setSelectedChat={setSelectedChat} dialoguesIsLoading={dialoguesIsLoading} dialoguesError={dialoguesError} searchInput={searchInput} setSearchInput={setSearchInput} onNewChatCreated={handleNewChatCreated}/>} removePaddings={true} withNav={false}>
            {selectedChat === null?
                <div style={{display: "flex", height: "100%", alignItems: "center", justifyContent: "center"}}>
                    <p>Выберите чат чтобы начать общение</p>
                </div>
            :
                <>
                    {chatIsLoading &&
                        <div style={{display: "flex", height: "100%", alignItems: "center", justifyContent: "center"}}>
                            <p>Загрузка...</p>
                        </div>
                    }
                    {chatError &&
                        <div style={{display: "flex", height: "100%", alignItems: "center", justifyContent: "center"}}>
                            <p>Ошибка при получении чата</p>
                        </div>
                    }
                    {!chatIsLoading && !chatError &&
                        <>
                            <div className={styles.chatHeader}>
                                <h6>{chat?.chat_name}</h6>
                                <div className={styles.menuButton}><FaEllipsisVertical/></div>
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
                                {/*<FaPaperclip/>*/}
                                <FaPaperPlane onClick={handleSendMessage}/>
                            </div>
                        </>
                    }
                    <ContextMenu
                        contextMenu={contextMenu}
                        onClose={() => setContextMenu(null)}
                        refreshChat={refreshChat}
                        refreshDialogues={refreshDialogues}
                    />
                </>
            }

        </PageBuilder>
    )
}