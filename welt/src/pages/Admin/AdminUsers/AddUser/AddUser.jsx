import {useNavigate} from "react-router-dom";
import {useEffect, useRef, useState} from "react";
import {useCreateProjectMutation, useCreateUserMutation, useGetAllRolesQuery} from "../../../../store/services/welt.js";
import {toast} from "react-toastify";
import PageBuilder from "../../../../components/PageBuilder/PageBuilder.jsx";
import SideNavigation from "../../../../components/Navigation/SideNavigation/SideNavigation.jsx";
import getAdminSidePaths from "../../../../utils/adminSidePaths.js";
import styles from "./AddUser.module.scss";
import {FaChevronDown} from "react-icons/fa";
import TextInput from "../../../../components/Inputs/FormInputs/TextInput/TextInput.jsx";
import FileInput from "../../../../components/Inputs/FormInputs/FileInput/FileInput.jsx";
import Dropdown from "../../../../components/Inputs/FormInputs/Dropdown/Dropdown.jsx";
import {debounce} from "@mui/material";

export default function AddUser(){
    const navigate = useNavigate()
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [roleId, setRoleId] = useState('');
    const [avatar, setAvatar] = useState(null);
    const [createUser, { isLoading, isSuccess, isError, error }] = useCreateUserMutation();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false)
    const [allRoles, setAllRoles] = useState([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [hasMoreRoles, setHasMoreRoles] = useState(true);
    const [isFetching, setIsFetching] = useState(false);

    const { data: rolesData, isLoading: rolesLoading, error: rolesError } = useGetAllRolesQuery({
        page: currentPage,
        perPage: 4,
    }, {skip: !hasMoreRoles});

    useEffect(() => {
        if (rolesData && rolesData.data.length > 0) {
            const uniqueRoles = rolesData.data.filter((role) =>
                !allRoles.some((existingRole) => existingRole.id === role.id)
            );
            setAllRoles((prevRoles) => [...prevRoles, ...uniqueRoles]);
            setHasMoreRoles(rolesData.total_pages > currentPage + 1);
        }
    }, [rolesData]);

    const paths =[
        {title: "Welt", path: "/"},
        {title: "Администрирование", path: "/admin"},
        {title: "Пользователи", path: "/admin/users"},
        {title: "Новый пользователь", path: ""},
    ]


    const handleLoadMoreRoles = async () => {
        if (hasMoreRoles && !isFetching) {
            setIsFetching(true); // Блокируем новые запросы
            try {
                await setCurrentPage((prevPage) => prevPage + 1);
            } finally {
                setIsFetching(false); // Разблокируем запросы
            }
        }
    };

    const debouncedHandleLoadMoreRoles = debounce(handleLoadMoreRoles, 300);

    const handleScroll = (e) => {
        const { scrollTop, scrollHeight, clientHeight } = e.target;
        if (scrollTop + clientHeight >= scrollHeight - 10 && hasMoreRoles) {
            debouncedHandleLoadMoreRoles();
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            await createUser({ first_name: firstName, last_name: lastName, email, password, role_id: roleId, avatar }).unwrap();
            setFirstName('');
            setLastName('');
            setEmail('');
            setPassword('');
            setRoleId('')
            setAvatar(null);
            toast.success("Пользователь успешно добавлен")
        } catch (err) {
            console.error('Ошибка при создании пользователя:', err);
            toast.success("Ошибка при добавлении пользователя")
        }
    };

    return(
        <PageBuilder paths={paths} sideComponent={<SideNavigation title="Администрирование" paths={getAdminSidePaths()} alias={"users"}/>}>
            <div className={styles.spaceBetween}>
                <h3>Новый пользователь</h3>
            </div>
            <div className="horizontal-divider"></div>
            <form className={styles.pageForm} onSubmit={handleSubmit}>
                <TextInput
                    label="Имя пользователя:"
                    id="first_name"
                    value={firstName} onChange={(e) => setFirstName(e.target.value)}
                    required={true}
                />
                <TextInput
                    label="Фамилия пользователя:"
                    id="last_name"
                    value={lastName} onChange={(e) => setLastName(e.target.value)}
                    required={true}
                />
                <TextInput
                    label="Email:"
                    id="email"
                    value={email} onChange={(e) => setEmail(e.target.value)}
                    required={true}
                    type="email"
                />
                <TextInput
                    label="Пароль:"
                    id="password"
                    value={password} onChange={(e) => setPassword(e.target.value)}
                    required={true}
                    type="password"
                />

                <Dropdown
                    label="Роль:"
                    options={allRoles}
                    selectedOption={allRoles.find((role) => role.id === roleId)}
                    onSelect={(role) => setRoleId(role.id)}
                    isLoading={rolesLoading}
                    isError={!!rolesError}
                    onScroll={handleScroll}
                    hasMoreOptions={hasMoreRoles}
                    placeholder="Выберите роль"
                />
                <FileInput
                    label="Выберите аватар"
                    id="avatar"
                    accept="image/*"
                    onChange={(e) => setAvatar(e.target.files[0])}
                    file={avatar}
                />

                <button className="button-primary" type="submit" disabled={isLoading}>
                    {isLoading ? 'Создание...' : 'Создать пользователя'}
                </button>
            </form>
        </PageBuilder>
    )
}