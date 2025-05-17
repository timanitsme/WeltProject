import styles from "./AddRequest.module.scss"
import {useNavigate} from "react-router-dom";
import {useEffect, useState} from "react";
import dayjs from "dayjs";
import {
    useCreateAdminRequestMutation,
    useCreateTaskMutation, useGetAllProjectsQuery, useGetAllTaskPrioritiesQuery,
    useGetAllTaskStatusesQuery,
    useGetAllUsersQuery
} from "../../../../store/services/welt.js";
import {debounce} from "@mui/material";
import {toast} from "react-toastify";
import PageBuilder from "../../../../components/PageBuilder/PageBuilder.jsx";
import SideNavigation from "../../../../components/Navigation/SideNavigation/SideNavigation.jsx";
import getAdminSidePaths from "../../../../utils/adminSidePaths.js";
import TextInput from "../../../../components/Inputs/FormInputs/TextInput/TextInput.jsx";
import Dropdown from "../../../../components/Inputs/FormInputs/Dropdown/Dropdown.jsx";
import CustomDateTimePicker
    from "../../../../components/Inputs/FormInputs/CustomDateTimePicker/CustomDateTimePicker.jsx";
import MultipleDropdown from "../../../../components/Inputs/FormInputs/Dropdown/MultipleDropdown.jsx";


export default function AddRequest(){
    const navigate = useNavigate()
    const [subject, setSubject] = useState('');
    const [description, setDescription] = useState('');
    const [receiverId, setReceiverId] = useState('');
    const [senderId, setSenderId] = useState('');
    const [projectId, setProjectId] = useState('');

    const [createRequest, { isLoading, isSuccess, isError, error }] = useCreateAdminRequestMutation();


    const [allProjects, setAllProjects] = useState([]);
    const [projectCurrentPage, setProjectCurrentPage] = useState(0);
    const [hasMoreProjects, setHasMoreProjects] = useState(true);
    const [projectsIsFetching, setProjectsIsFetching] = useState(false);

    const [allUsers, setAllUsers] = useState([]);
    const [userCurrentPage, setUserCurrentPage] = useState(0);
    const [hasMoreUsers, setHasMoreUsers] = useState(true);
    const [usersIsFetching, setUsersIsFetching] = useState(false);

    const { data: usersData, isLoading: usersLoading, error: usersError } = useGetAllUsersQuery({
        page: userCurrentPage,
        perPage: 10,
    }, {skip: !hasMoreUsers});

    const { data: projectsData, isLoading: projectsLoading, error: projectsError } = useGetAllProjectsQuery({
        page: projectCurrentPage,
        perPage: 10,
    }, {skip: !hasMoreProjects});

    useEffect(() => {
        if (projectsData && projectsData.data.length > 0) {
            const uniqueItems = projectsData.data.filter((item) =>
                !allProjects.some((existingItem) => existingItem.id === item.id)
            );
            setAllProjects((prevItems) => [...prevItems, ...uniqueItems]);
            setHasMoreProjects(projectsData.total_pages > projectCurrentPage + 1);
        }
    }, [projectsData]);

    useEffect(() => {
        if (usersData && usersData.data.length > 0) {
            const uniqueItems = usersData.data.filter((item) =>
                !allUsers.some((existingItem) => existingItem.id === item.id)
            );
            setAllUsers((prevItems) => [...prevItems, ...uniqueItems]);
            setHasMoreUsers(usersData.total_pages > userCurrentPage + 1);
        }
    }, [usersData]);

    const paths =[
        {title: "Welt", path: "/"},
        {title: "Администрирование", path: "/admin"},
        {title: "Заявки", path: "/admin/requests"},
        {title: "Новая заявка", path: ""},
    ]

    const handleLoadMoreProjects = async () => {
        if (hasMoreProjects && !projectsIsFetching) {
            setProjectsIsFetching(true);
            try {
                await setProjectCurrentPage((prevPage) => prevPage + 1);
            } finally {
                setProjectsIsFetching(false);
            }
        }
    };

    const handleLoadMoreUsers = async () => {
        if (hasMoreUsers && !usersIsFetching) {
            setUsersIsFetching(true);
            try {
                await setUserCurrentPage((prevPage) => prevPage + 1);
            } finally {
                setUsersIsFetching(false);
            }
        }
    };

    const debouncedHandleLoadMoreUsers = debounce(handleLoadMoreUsers, 300);
    const debouncedHandleLoadMoreProjects = debounce(handleLoadMoreProjects, 300);

    const handleScroll = (e, {hasMore, onLoadMore}) => {
        const { scrollTop, scrollHeight, clientHeight } = e.target;
        if (scrollTop + clientHeight >= scrollHeight - 10 && hasMore) {
            onLoadMore();
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await createRequest({ subject: subject, description: description, project_id: projectId, sender_id: senderId, receiver_id: receiverId }).unwrap();
            setSubject('');
            setDescription('');
            setSenderId('')
            setReceiverId('')
            setProjectId('')
            toast.success("Заявка успешно добавлена")
        } catch (err) {
            console.error('Ошибка при создании заявки:', err);
            toast.error("Ошибка при добавлении заявки")
        }
    };

    return(
        <PageBuilder paths={paths} sideComponent={<SideNavigation title="Администрирование" paths={getAdminSidePaths()} alias={"requests"}/>}>
            <div className={styles.spaceBetween}>
                <h3>Новая заявка</h3>
            </div>
            <div className="horizontal-divider"></div>
            <form className={styles.pageForm} onSubmit={handleSubmit}>
                <TextInput
                    label="Тема:"
                    id="subject"
                    value={subject} onChange={(e) => setSubject(e.target.value)}
                    required={true}
                />
                <TextInput
                    label="Описание:"
                    id="description"
                    value={description} onChange={(e) => setDescription(e.target.value)}
                    required={true}
                />
                <Dropdown
                    label="Отправитель:"
                    options={allUsers}
                    selectedOption={allUsers.find((item) => item.id === senderId)}
                    onSelect={(item) => setSenderId(item.id)}
                    isLoading={usersLoading}
                    isError={!!usersError}
                    onScroll={(e) => handleScroll(e, {hasMore: hasMoreUsers, onLoadMore: debouncedHandleLoadMoreUsers})}
                    hasMoreOptions={hasMoreUsers}
                    placeholder="Выберите отправителя"
                />
                <Dropdown
                    label="Получатель:"
                    options={allUsers}
                    selectedOption={allUsers.find((item) => item.id === receiverId)}
                    onSelect={(item) => setReceiverId(item.id)}
                    isLoading={usersLoading}
                    isError={!!usersError}
                    onScroll={(e) => handleScroll(e, {hasMore: hasMoreUsers, onLoadMore: debouncedHandleLoadMoreUsers})}
                    hasMoreOptions={hasMoreUsers}
                    placeholder="Выберите получателя"
                />

                <Dropdown
                    label="Проект:"
                    options={allProjects}
                    selectedOption={allProjects.find((item) => item.id === projectId)}
                    onSelect={(item) => setProjectId(item.id)}
                    isLoading={projectsLoading}
                    isError={!!projectsError}
                    onScroll={(e) => handleScroll(e,{hasMore: hasMoreProjects, onLoadMore: debouncedHandleLoadMoreProjects})}
                    hasMoreOptions={hasMoreProjects}
                    placeholder="Выберите проект"
                />

                <button className="button-primary" type="submit" disabled={isLoading}>
                    {isLoading ? 'Создание...' : 'Создать заявку'}
                </button>
            </form>
        </PageBuilder>
    )
}