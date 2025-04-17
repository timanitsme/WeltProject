import styles from "./NavChain.module.scss"
import {useNavigate} from "react-router-dom";
import {Fragment} from "react";

export default function NavChain({style={}, paths=[]}){
    const navigate = useNavigate()
    return(
        <div className={`${styles.navChain} noSelect`} style={style}>
            <div>
                {paths.map((path, index) => {
                    if (index !== paths.length - 1){
                        return(
                            <Fragment key={index}><span className={styles.path} onClick={() => navigate(path.path)}>{path.title}</span> / </Fragment>
                        )
                    }
                    else{
                        return <span key={index} className={`${styles.path} ${styles.active}`}>{path.title}</span>
                    }


                })}
            </div>
        </div>
    )
}