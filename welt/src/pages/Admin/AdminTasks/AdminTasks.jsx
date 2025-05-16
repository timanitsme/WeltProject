import {useEffect, useMemo, useState} from "react";
import {
    useDeleteRoleMutation,
    useDeleteTaskMutation,
    useGetAllRequestsQuery,
    useGetAllTasksQuery
} from "../../../store/services/welt.js";
import {toast} from "react-toastify";
import {Box, CircularProgress, IconButton, Menu, MenuItem} from "@mui/material";
import {MdMoreVert} from "react-icons/md";
import {useNavigate} from "react-router-dom";
import PageBuilder from "../../../components/PageBuilder/PageBuilder.jsx";
import SideNavigation from "../../../components/Navigation/SideNavigation/SideNavigation.jsx";
import getAdminSidePaths from "../../../utils/adminSidePaths.js";
import styles from "../AdminRequests/AdminRequests.module.scss";
import {FaPlus} from "react-icons/fa6";
import {DataGrid} from "@mui/x-data-grid";
import {ruRU} from "@mui/x-data-grid/locales";
import WarnModal from "../../../components/Modals/WarnModal/WarnModal.jsx";

export default function AdminTasks(){
    const [paginationModel, setPaginationModel] = useState({page: 0, perPage: 5})
    const [selectedTask, setSelectedTask] = useState(null);
    const {data: tasks, isLoading: tasksIsLoading, error: tasksError, refetch} = useGetAllTasksQuery({page: paginationModel.page, perPage: paginationModel.perPage})
    const [rowId, setRowId] = useState(null)
    const [anchorEl, setAnchorEl] = useState(null);
    const [showWarn, setShowWarn] = useState(false)
    const [deleteTask, {isLoading, isSuccess}] = useDeleteTaskMutation()

    const handleDeleteTask = async () => {
        if (selectedTask !== null){
            try {
                const response = await deleteTask({id: selectedTask.id}).unwrap();
                toast.success("Задача успешно удалена")
                setShowWarn(false)
                refetch()
            } catch (err) {
                console.error(`delete task error: ${JSON.stringify(err)}`)
                toast.error('Не удалось удалить задачу');

            }
        }
    }

    const columns = useMemo(() => [
        {field: 'id', headerName: "Id", flex: 1},
        {field: 'title', headerName: "Название", flex: 3},
        {field: 'description', headerName: "Описание", flex: 3},
        {field: 'status_id', headerName: "Id статуса", flex: 1},
        {field: 'project_id', headerName: "Id проекта", flex: 1},
        {field: 'priority_id', headerName: "Id приоритета", flex: 1},
        {field: 'deadline', headerName: "Дедлайн", flex: 2,
            renderCell: (params) => {
                const date = new Date(`${params.row.deadline}Z`);
                if (isNaN(date.getTime())) return '';

                const day = String(date.getDate()).padStart(2, '0');
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const year = date.getFullYear();
                const hours = String(date.getHours()).padStart(2, '0');
                const minutes = String(date.getMinutes()).padStart(2, '0');

                return (
                    <span title={date.toLocaleString()}>{`${day}.${month}.${year} ${hours}:${minutes}`}</span>
                );
            }},
        {field: 'created_at', headerName: "Дата создания", flex: 1,
            renderCell: (params) => {
                const date = new Date(`${params.row.created_at}Z`);
                if (isNaN(date.getTime())) return '';

                const day = String(date.getDate()).padStart(2, '0');
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const year = date.getFullYear();
                const hours = String(date.getHours()).padStart(2, '0');
                const minutes = String(date.getMinutes()).padStart(2, '0');

                return (
                    <span title={date.toLocaleString()}>{`${day}.${month}.${year} ${hours}:${minutes}`}</span>
                );
            }},
        {field: 'updated_at', headerName: "Дата обновления", flex: 1,
            renderCell: (params) => {
                const date = new Date(`${params.row.updated_at}Z`);
                if (isNaN(date.getTime())) return '';

                const day = String(date.getDate()).padStart(2, '0');
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const year = date.getFullYear();
                const hours = String(date.getHours()).padStart(2, '0');
                const minutes = String(date.getMinutes()).padStart(2, '0');

                return (
                    <span title={date.toLocaleString()}>{`${day}.${month}.${year} ${hours}:${minutes}`}</span>
                );
            }},
        {
            field: 'actions',
            headerName: "Действия",
            flex: 1,
            sortable: false,
            filterable: false,
            headerAlign: 'center',
            renderCell: (params) => (
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        height: '100%',
                    }}
                >
                    <IconButton
                        onClick={(event) => {
                            setAnchorEl(event.currentTarget);
                            setSelectedTask(params.row);
                        }}
                    >
                        <MdMoreVert/>
                    </IconButton>
                </Box>
            ),
        },
    ], [rowId])

    useEffect(() => {
        let isMounted = true;

        if (isMounted) {
            refetch();
        }

        return () => {
            isMounted = false;
        };
    }, [paginationModel.page, paginationModel.perPage, refetch]);

    const navigate = useNavigate()

    const paths =[
        {title: "Welt", path: "/"},
        {title: "Администрирование", path: "/admin"},
        {title: "Задачи", path: ""},
    ]



    return(
        <PageBuilder paths={paths} sideComponent={<SideNavigation title="Администрирование" paths={getAdminSidePaths()} alias={"tasks"}/>}>
            <div className={styles.spaceBetween}>
                <h3>Задачи</h3>
                <button className={`button-primary ${styles.iconButton}`} onClick={() => navigate("/admin/tasks/add")}><FaPlus/> Добавить задачу</button>
            </div>
            <div className="horizontal-divider"></div>
            {tasksIsLoading &&
                <Box
                    sx={{
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexDirection: 'column',
                    }}>
                    <CircularProgress sx={{width:100, height: 100, color: 'primary'}}/>
                </Box>}
            {!tasksIsLoading && !tasksError &&
                <>
                    <Box
                        sx={{
                            width: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                        }}>
                        <DataGrid
                            columns={columns}
                            rows={tasks?.data || []}
                            getRowId={(row) => row.id}
                            paginationModel={{
                                page: tasks?.page > 0 ? tasks.page : paginationModel.page,
                                pageSize: tasks?.perPage || paginationModel.perPage,
                            }}
                            onPaginationModelChange={(newModel) => {
                                setPaginationModel({ page: newModel.page, perPage: newModel.pageSize });
                            }}
                            rowCount={tasks?.total_items || 0}
                            pageSizeOptions={[1, 5, 10, 20]}
                            paginationMode="server"
                            localeText={ruRU.components.MuiDataGrid.defaultProps.localeText}
                        />
                    </Box>
                    <Menu
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl)}
                        onClose={() => {
                            setAnchorEl(null);
                            setSelectedTask(null);
                        }}
                    >
                        <MenuItem onClick={() => {setAnchorEl(null); setShowWarn(true)}}>Удалить</MenuItem>
                    </Menu>
                </>
            }
            <WarnModal show={showWarn} setShow={setShowWarn} title="Удаление задачи" text="Вы уверенны что хотите удалить задачу?" onYes={handleDeleteTask}></WarnModal>
        </PageBuilder>
    )
}