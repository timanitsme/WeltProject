import {FaPlus} from "react-icons/fa6";
import {useNavigate} from "react-router-dom";
import PageBuilder from "../../../../components/PageBuilder/PageBuilder.jsx";
import SideNavigation from "../../../../components/Navigation/SideNavigation/SideNavigation.jsx";
import getAdminSidePaths from "../../../../utils/adminSidePaths.js";
import styles from "./AddProject.module.scss";
import {useState} from "react";
import {useCreateProjectMutation} from "../../../../store/services/welt.js";
import {toast} from "react-toastify";

export default function AddProject(){
    const navigate = useNavigate()
    const [title, setTitle] = useState('');
    const [icon, setIcon] = useState(null);
    const [createProject, { isLoading, isSuccess, isError, error }] = useCreateProjectMutation();

    const paths =[
        {title: "Welt", path: "/"},
        {title: "Администрирование", path: "/admin"},
        {title: "Проекты", path: "/admin/projects"},
        {title: "Новый проект", path: ""},
    ]

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            await createProject({ title, icon }).unwrap();
            setTitle('');
            setIcon(null);
            toast.success("Проект успешно добавлен")
        } catch (err) {
            console.error('Ошибка при создании проекта:', err);
            toast.success("Ошибка при добавлении проекта")
        }
    };

    return(
        <PageBuilder paths={paths} sideComponent={<SideNavigation title="Администрирование" paths={getAdminSidePaths()} alias={"projects"}/>}>
            <div className={styles.spaceBetween}>
                <h3>Новый проект</h3>
            </div>
            <div className="horizontal-divider"></div>
            <form className={styles.pageForm} onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="title">Название проекта:</label>
                    <input
                        type="text"
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                    />
                </div>

                <div>
                    <label htmlFor="icon" className={styles.customFileButton}>
                        Выберите иконку
                    </label>
                    <input
                        type="file"
                        id="icon"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={(e) => setIcon(e.target.files[0])}
                    />
                    {icon && <span>{icon.name}</span>}
                </div>

                <button className="button-primary" type="submit" disabled={isLoading}>
                    {isLoading ? 'Создание...' : 'Создать проект'}
                </button>
            </form>
        </PageBuilder>
    )
}