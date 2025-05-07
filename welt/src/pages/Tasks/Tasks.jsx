import PageBuilder from "../../components/PageBuilder/PageBuilder.jsx";
import styles from "./Tasks.module.scss";
import Toggle from "../../components/Toggle/Toggle.jsx";
import NavChain from "../../components/Navigation/NavChain/NavChain.jsx";
import {FaPlus} from "react-icons/fa6";

export default function Tasks(){
    const paths =[
        {title: "DoWork", path: ""},
        {title: "Задачи", path: "/requests"}
    ]

    const statuses = [
        {id: "1", title: "Бэклог", color: "var(--primary)", quantity: 12},
        {id: "2", title: "К выполнению", color: "var(--primary)", quantity: 5},
        {id: "3", title: "В процессе", color: "var(--primary)", quantity: 1},
        {id: "4", title: "Завершено", color: "var(--primary)", quantity: 4},
    ]

    const tasks = {
        1: [{title: "Задача 1"}, {title: "Задача 2"}, {title: "Задача 3"}],
        2: [{title: "Задача 4"}, {title: "Задача 5"}, {title: "Задача 6"}],
        3: [{title: "Задача 7"}, {title: "Задача 8"}, {title: "Задача 9"}],
        4: [{title: "Задача 10"}, {title: "Задача 11"}, {title: "Задача 12"}]
    }

    return(
        <PageBuilder removeBg={true} withNav={false}>
            <div className={styles.headingSection}>
                <NavChain paths={paths}/>
                <h3>Задачи</h3>
            </div>
            <div className={styles.tasksColumns}>
                {statuses.map((status) => (
                    <div className={styles.taskCol}>
                        <div className={styles.taskHeader}>
                            <div className={styles.circle} style={{background: status.color}}/>
                            <h6>{status.title}</h6>
                            <p className="text-secondary">{status.quantity}</p>
                            <button className={styles.roundButton}>
                                <FaPlus/>
                            </button>
                        </div>
                        {tasks[status.id].map((task) => (
                            <div className={styles.task}>
                                <p>{task.title}</p>
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </PageBuilder>
    )
}