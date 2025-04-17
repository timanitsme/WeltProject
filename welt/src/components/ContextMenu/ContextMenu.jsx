import styles from "./ContextMenu.module.scss"
import {toast} from "react-toastify";
import {useDeleteMessageMutation} from "../../store/services/welt.js";

export default function ContextMenu({contextMenu, onClose, refreshChat, refreshDialogues}){
    if (!contextMenu) return null;
    const [deleteMessage, {isLoading: deleteMessageIsLoading, isSuccess: deleteMessageIsSuccess}] = useDeleteMessageMutation()

    const handleCopy = () => {
        navigator.clipboard.writeText(contextMenu.message.text);
        onClose();
    };

    const handleDeleteMessage = async () => {
        try {
            const response = await deleteMessage({messageId: contextMenu.message.id}).unwrap();
            refreshChat();
            if (refreshDialogues) refreshDialogues();
        } catch (err) {
            console.error(`delete message error: ${JSON.stringify(err)}`)
            toast.error('Не удалось удалить сообщение');
        }
    }

    return (
        <div
            className={styles.contextMenu}
            style={{ top: contextMenu.y, left: contextMenu.x }}
        >
            <div onClick={handleCopy}><p>Копировать текст</p></div>
            {contextMenu.message.direction === "outgoing" && <div onClick={handleDeleteMessage}><p>Удалить</p></div>}
        </div>
    );
}