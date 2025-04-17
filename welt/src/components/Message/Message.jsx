import styles from "./Message.module.scss"

export default function Message({message, onContextMenu}){
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

    return(
        <div className={`${styles.message} ${message?.direction === "incoming"? styles.incoming: styles.outgoing}`} onContextMenu={onContextMenu}>
            <p>{message?.text}</p>
            <p className={styles.time}>{getFormattedDate(message?.sent_at)}</p>
        </div>
    )
}