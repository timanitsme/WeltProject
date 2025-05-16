import {useNavigate} from "react-router-dom";
import {useEffect, useState} from "react";
import {
    useCreateTaskMutation, useGetAllProjectsQuery,
    useGetAllRolesQuery, useGetAllTaskPrioritiesQuery,
    useGetAllTasksQuery,
    useGetAllTaskStatusesQuery, useGetAllUsersQuery
} from "../../../../store/services/welt.js";
import {debounce} from "@mui/material";
import {toast} from "react-toastify";
import PageBuilder from "../../../../components/PageBuilder/PageBuilder.jsx";
import SideNavigation from "../../../../components/Navigation/SideNavigation/SideNavigation.jsx";
import getAdminSidePaths from "../../../../utils/adminSidePaths.js";
import styles from "../../AdminUsers/AddUser/AddUser.module.scss";
import TextInput from "../../../../components/Inputs/FormInputs/TextInput/TextInput.jsx";
import Dropdown from "../../../../components/Inputs/FormInputs/Dropdown/Dropdown.jsx";
import FileInput from "../../../../components/Inputs/FormInputs/FileInput/FileInput.jsx";
import {DateTimePicker} from "@mui/x-date-pickers";
import CustomDateTimePicker
    from "../../../../components/Inputs/FormInputs/CustomDateTimePicker/CustomDateTimePicker.jsx";
import dayjs from "dayjs";
import MultipleDropdown from "../../../../components/Inputs/FormInputs/Dropdown/MultipleDropdown.jsx";

export default function AddTask(){
    const navigate = useNavigate()
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [statusId, setStatusId] = useState('');
    const [priorityId, setPriorityId] = useState('');
    const [projectId, setProjectId] = useState('');
    const [users, setUsers] = useState([])
    const [deadline, setDeadline] = useState(dayjs());

    const [createTask, { isLoading, isSuccess, isError, error }] = useCreateTaskMutation();

    const [allStatuses, setAllStatuses] = useState([]);
    const [statusCurrentPage, setStatusCurrentPage] = useState(0);
    const [hasMoreStatuses, setHasMoreStatuses] = useState(true);
    const [statusesIsFetching, setStatusesIsFetching] = useState(false);

    const [allPriorities, setAllPriorities] = useState([]);
    const [priorityCurrentPage, setPriorityCurrentPage] = useState(0);
    const [hasMorePriorities, setHasMorePriorities] = useState(true);
    const [prioritiesIsFetching, setPrioritiesIsFetching] = useState(false);

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

    const { data: statusesData, isLoading: statusesLoading, error: statusesError } = useGetAllTaskStatusesQuery({
        page: statusCurrentPage,
        perPage: 10,
    }, {skip: !hasMoreStatuses});

    const { data: prioritiesData, isLoading: prioritiesLoading, error: prioritiesError } = useGetAllTaskPrioritiesQuery({
        page: priorityCurrentPage,
        perPage: 10,
    }, {skip: !hasMorePriorities});

    const { data: projectsData, isLoading: projectsLoading, error: projectsError } = useGetAllProjectsQuery({
        page: projectCurrentPage,
        perPage: 10,
    }, {skip: !hasMoreProjects});

    useEffect(() => {
        if (statusesData && statusesData.data.length > 0) {
            const uniqueItems = statusesData.data.filter((item) =>
                !allStatuses.some((existingItem) => existingItem.id === item.id)
            );
            setAllStatuses((prevItems) => [...prevItems, ...uniqueItems]);
            setHasMoreStatuses(statusesData.total_pages > statusCurrentPage + 1);
        }
    }, [statusesData]);

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
        {title: "Задачи", path: "/admin/tasks"},
        {title: "Новая задача", path: ""},
    ]


    const handleLoadMoreStatuses = async () => {
        if (hasMoreStatuses && !statusesIsFetching) {
            setStatusesIsFetching(true);
            try {
                await setStatusCurrentPage((prevPage) => prevPage + 1);
            } finally {
                setStatusesIsFetching(false);
            }
        }
    };

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

    const debouncedHandleLoadMoreStatuses = debounce(handleLoadMoreStatuses, 300);
    const debouncedHandleLoadMorePriorities = debounce(handleLoadMorePriorities, 300);
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
        const formattedDeadline = deadline.toISOString();
        try {
            await createTask({ title: title, description: description, status_id: statusId, project_id: projectId, priority_id: priorityId, deadline: formattedDeadline, assignee_ids: users.map((user) => user.id) }).unwrap();
            setTitle('');
            setDescription('');
            setStatusId('')
            setPriorityId('')
            setProjectId('')
            setUsers([])
            setDeadline(dayjs())

            toast.success("Задача успешно добавлена")
        } catch (err) {
            console.error('Ошибка при создании задачи:', err);
            toast.error("Ошибка при добавлении задачи")
        }
    };

    return(
        <PageBuilder paths={paths} sideComponent={<SideNavigation title="Администрирование" paths={getAdminSidePaths()} alias={"tasks"}/>}>
            <div className={styles.spaceBetween}>
                <h3>Новая задача</h3>
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
                    label="Статус:"
                    options={allStatuses}
                    selectedOption={allStatuses.find((item) => item.id === statusId)}
                    onSelect={(item) => setStatusId(item.id)}
                    isLoading={statusesLoading}
                    isError={!!statusesError}
                    onScroll={(e) => handleScroll(e, {hasMore: hasMoreStatuses, onLoadMore: debouncedHandleLoadMoreStatuses})}
                    hasMoreOptions={hasMoreStatuses}
                    placeholder="Выберите статус"
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
                <Dropdown
                    label="Проект:"
                    options={allProjects}
                    selectedOption={allProjects.find((item) => item.id === projectId)}
                    onSelect={(item) => setProjectId(item.id)}
                    isLoading={projectsLoading}
                    isError={!!projectsError}
                    onScroll={(e) => handleScroll(e,{hasMore: hasMoreProjects, onLoadMore: debouncedHandleLoadMoreProjects})}
                    hasMoreOptions={hasMorePriorities}
                    placeholder="Выберите проект"
                />
                <CustomDateTimePicker label="Дедлайн:" value={deadline} onChange={(value) => setDeadline(value)} required={true}></CustomDateTimePicker>
                <MultipleDropdown
                    label="Выберите несколько значений"
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