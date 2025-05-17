import {useNavigate, useParams} from "react-router-dom";
import {useEffect, useState} from "react";
import dayjs from "dayjs";
import {
    useCreateTaskMutation, useGetAllProjectsQuery,
    useGetAllTaskPrioritiesQuery,
    useGetAllTaskStatusesQuery,
    useGetAllUsersQuery, useGetMyProjectsQuery, useGetUsersExceptMeQuery
} from "../../../store/services/welt.js";
import {debounce} from "@mui/material";
import {toast} from "react-toastify";
import PageBuilder from "../../../components/PageBuilder/PageBuilder.jsx";
import SideNavigation from "../../../components/Navigation/SideNavigation/SideNavigation.jsx";
import getAdminSidePaths from "../../../utils/adminSidePaths.js";
import styles from "./AddUserTask.module.scss";
import TextInput from "../../../components/Inputs/FormInputs/TextInput/TextInput.jsx";
import Dropdown from "../../../components/Inputs/FormInputs/Dropdown/Dropdown.jsx";
import CustomDateTimePicker from "../../../components/Inputs/FormInputs/CustomDateTimePicker/CustomDateTimePicker.jsx";
import MultipleDropdown from "../../../components/Inputs/FormInputs/Dropdown/MultipleDropdown.jsx";
import useAuth from "../../../utils/customHooks/useAuth.js";
import {FaLongArrowAltLeft} from "react-icons/fa";

export default function AddUserTask(){
    const { currentProject } = useAuth();
    const params = useParams()
    const navigate = useNavigate()
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [priorityId, setPriorityId] = useState('');
    const [users, setUsers] = useState([])
    const [deadline, setDeadline] = useState(dayjs());

    const [createTask, { isLoading, isSuccess, isError, error }] = useCreateTaskMutation();

    const [allPriorities, setAllPriorities] = useState([]);
    const [priorityCurrentPage, setPriorityCurrentPage] = useState(0);
    const [hasMorePriorities, setHasMorePriorities] = useState(true);
    const [prioritiesIsFetching, setPrioritiesIsFetching] = useState(false);

    const [allUsers, setAllUsers] = useState([]);
    const [userCurrentPage, setUserCurrentPage] = useState(0);
    const [hasMoreUsers, setHasMoreUsers] = useState(true);
    const [usersIsFetching, setUsersIsFetching] = useState(false);

    const { data: usersData, isLoading: usersLoading, error: usersError } = useGetUsersExceptMeQuery({
        page: userCurrentPage,
        perPage: 10,
    }, {skip: !hasMoreUsers});

    const { data: prioritiesData, isLoading: prioritiesLoading, error: prioritiesError } = useGetAllTaskPrioritiesQuery({
        page: priorityCurrentPage,
        perPage: 10,
    }, {skip: !hasMorePriorities});



    useEffect(() => {
        if (prioritiesData && prioritiesData.data.length > 0) {
            const uniqueItems = prioritiesData.data.filter((item) =>
                !allPriorities.some((existingItem) => existingItem.id === item.id)
            );
            setAllPriorities((prevItems) => [...prevItems, ...uniqueItems]);
            setHasMorePriorities(prioritiesData.total_pages > priorityCurrentPage + 1);
        }
    }, [prioritiesData]);

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
        {title: `${currentProject.title}`, path: "/"},
        {title: "Задачи", path: "/tasks"},
        {title: "Новая задача", path: ""},
    ]



    const handleLoadMorePriorities = async () => {
        if (hasMorePriorities && !prioritiesIsFetching) {
            setPrioritiesIsFetching(true);
            try {
                await setPriorityCurrentPage((prevPage) => prevPage + 1);
            } finally {
                setPrioritiesIsFetching(false);
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

    const debouncedHandleLoadMorePriorities = debounce(handleLoadMorePriorities, 300);
    const debouncedHandleLoadMoreUsers = debounce(handleLoadMoreUsers, 300);

    const handleScroll = (e, {hasMore, onLoadMore}) => {
        const { scrollTop, scrollHeight, clientHeight } = e.target;
        if (scrollTop + clientHeight >= scrollHeight - 10 && hasMore) {
            onLoadMore();
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formattedDeadline = deadline.toISOString();
        try {
            await createTask({ title: title, description: description, status_id: params.id, project_id: currentProject.id, priority_id: priorityId, deadline: formattedDeadline, assignee_ids: users.map((user) => user.id) }).unwrap();
            setTitle('');
            setDescription('');
            setPriorityId('')
            setUsers([])
            setDeadline(dayjs())

            toast.success("Задача успешно добавлена")
            navigate("/tasks")
        } catch (err) {
            console.error('Ошибка при создании задачи:', err);
            toast.error("Ошибка при добавлении задачи")
        }
    };

    return(
        <PageBuilder paths={paths}>
            <div className={styles.spaceBetween}>
                <h3>Новая задача</h3>
                <button className="button-primary" onClick={() => navigate("/tasks")}>Назад</button>
            </div>
            <div className="horizontal-divider"></div>
            <form className={styles.pageForm} onSubmit={handleSubmit}>
                <TextInput
                    label="Название:"
                    id="title"
                    value={title} onChange={(e) => setTitle(e.target.value)}
                    required={true}
                />
                <TextInput
                    label="Описание:"
                    id="description"
                    value={description} onChange={(e) => setDescription(e.target.value)}
                    required={true}
                />
                <Dropdown
                    label="Приоритет:"
                    options={allPriorities}
                    selectedOption={allPriorities.find((item) => item.id === priorityId)}
                    onSelect={(item) => setPriorityId(item.id)}
                    isLoading={prioritiesLoading}
                    isError={!!prioritiesError}
                    onScroll={(e) => handleScroll(e,{hasMore: hasMorePriorities, onLoadMore: debouncedHandleLoadMorePriorities})}
                    hasMoreOptions={hasMorePriorities}
                    placeholder="Выберите приоритет"
                />
                <CustomDateTimePicker label="Дедлайн:" value={deadline} onChange={(value) => setDeadline(value)} required={true}></CustomDateTimePicker>
                <MultipleDropdown
                    label="Выберите исполнителей"
                    options={allUsers}
                    selectedOptions={users}
                    onSelect={setUsers}
                    isLoading={usersLoading}
                    isError={!!usersError}
                    placeholder="Выберите значения"
                    onScroll={(e) => handleScroll(e,{hasMore: hasMoreUsers, onLoadMore: debouncedHandleLoadMoreUsers})}
                    hasMoreOptions={hasMoreUsers}
                />


                <button className="button-primary" type="submit" disabled={isLoading}>
                    {isLoading ? 'Создание...' : 'Создать задачу'}
                </button>
            </form>
        </PageBuilder>
    )
}