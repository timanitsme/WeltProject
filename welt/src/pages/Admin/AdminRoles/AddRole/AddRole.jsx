import {useNavigate} from "react-router-dom";
import {useState} from "react";
import {useCreateProjectMutation, useCreateRoleMutation} from "../../../../store/services/welt.js";
import {toast} from "react-toastify";
import PageBuilder from "../../../../components/PageBuilder/PageBuilder.jsx";
import SideNavigation from "../../../../components/Navigation/SideNavigation/SideNavigation.jsx";
import getAdminSidePaths from "../../../../utils/adminSidePaths.js";
import styles from "../../AdminProjects/AddProject/AddProject.module.scss";

export default function AddRole(){
    const navigate = useNavigate()
    const [title, setTitle] = useState('');
    const [createRole, { isLoading, isSuccess, isError, error }] = useCreateRoleMutation();

    const paths =[
        {title: "Welt", path: "/"},
        {title: "Администрирование", path: "/admin"},
        {title: "Роли", path: "/admin/roles"},
        {title: "Новая роль", path: ""},
    ]

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            await createRole({ title }).unwrap();
            setTitle('');
            toast.success("Роль успешно добавлена")
        } catch (err) {
            console.error('Ошибка при создании роли:', err);
            toast.success("Ошибка при добавлении роли")
        }
    };

    return(
        <PageBuilder paths={paths} sideComponent={<SideNavigation title="Администрирование" paths={getAdminSidePaths()} alias={"roles"}/>}>
            <div className={styles.spaceBetween}>
                <h3>Новая роль</h3>
            </div>
            <div className="horizontal-divider"></div>
            <form className={styles.pageForm} onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="title">Название роли:</label>
                    <input
                        type="text"
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                    />
                </div>
                <button className="button-primary" type="submit" disabled={isLoading}>
                    {isLoading ? 'Создание...' : 'Создать роль'}
                </button>
            </form>
        </PageBuilder>
    )
}