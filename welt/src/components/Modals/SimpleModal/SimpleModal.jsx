import {useEffect} from "react";
import styles from "./SimpleModal.module.scss"
import {IoClose} from "react-icons/io5";

export default function SimpleModal({show, setShow, children, title="", style={}}){
    useEffect(() => {
        if (show) {
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.body.style.overflow = '';
        };
    }, [show]);

    if (show){
        return (
            <div className={styles.modalOverlay} onMouseDown={() => setShow(false)}>
                <div className={styles.modalContent} onMouseDown={(e) => e.stopPropagation()} style={style}>
                    <div className={styles.modalHeader}>
                        {title && title.trim().length!==0 &&
                            <div className={styles.titleWrapper}>
                                <h5>{title}</h5>
                            </div>
                        }
                        <div onClick={() => setShow(false)}><IoClose/></div>
                    </div>
                    {children}
                </div>
            </div>
        )
    }
}