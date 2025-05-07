import {IoWarning} from "react-icons/io5";
import styles from "./WarnModal.module.scss";
import SimpleModal from "../SimpleModal/SimpleModal.jsx";

export default function WarnModal({show, setShow, title, text, onYes = () => {}}){
    return(
        <SimpleModal show={show} setShow={setShow} title={title}>
            <div className={styles.warn}>
                <IoWarning/>
                <p>{text}</p>
                <div className={styles.yesNoButtons}>
                    <button className="button-primary" onClick={() => setShow(false)}>Нет</button>
                    <button className="button-primary" onClick={onYes}>Да</button>
                </div>
            </div>
        </SimpleModal>
    )
}