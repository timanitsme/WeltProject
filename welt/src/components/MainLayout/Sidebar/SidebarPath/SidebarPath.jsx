import styles from "./SidebarPath.module.scss";
import Tooltip from "../../../Tooltip/Tooltip.jsx";

export default function SidebarPath({Icon, title, onClick = () => {}, isCurrent=false}){
    return(
        <Tooltip text={title}>
            <div className={`${styles.path} ${isCurrent && styles.active}`} onClick={onClick}>
                <Icon size={25}/>
            </div>
        </Tooltip>
    )
}