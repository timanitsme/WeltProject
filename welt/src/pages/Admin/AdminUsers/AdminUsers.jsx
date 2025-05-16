import styles from "./AdminUsers.module.scss"
import {useNavigate} from "react-router-dom";
import {FaBoxTissue, FaPlus, FaUser, FaUserShield} from "react-icons/fa6";
import {GoProject} from "react-icons/go";
import {FaTasks} from "react-icons/fa";
import PageBuilder from "../../../components/PageBuilder/PageBuilder.jsx";
import SideNavigation from "../../../components/Navigation/SideNavigation/SideNavigation.jsx";
import {useDeleteUserMutation, useGetAllUsersQuery, weltApi} from "../../../store/services/welt.js";
import {useEffect, useMemo, useState} from "react";
import {Avatar, Box, CircularProgress, IconButton, Menu, MenuItem} from "@mui/material";
import {MdMoreVert} from "react-icons/md";
import {ruRU} from "@mui/x-data-grid/locales";
import {DataGrid} from "@mui/x-data-grid";
import SimpleModal from "../../../components/Modals/SimpleModal/SimpleModal.jsx";
import {IoWarning} from "react-icons/io5";
import WarnModal from "../../../components/Modals/WarnModal/WarnModal.jsx";
import {logout, setCredentials, setUserProfile} from "../../../store/services/authSlice.js";
import {toast} from "react-toastify";
import getAdminSidePaths from "../../../utils/adminSidePaths.js";

export default function AdminUsers(){
    const [paginationModel, setPaginationModel] = useState({page: 0, perPage: 5})
    const [selectedUser, setSelectedUser] = useState(null);
    const {data: users, isLoading: usersIsLoading, error: usersError, refetch} = useGetAllUsersQuery({page: paginationModel.page, perPage: paginationModel.perPage})
    const [rowId, setRowId] = useState(null)
    const [anchorEl, setAnchorEl] = useState(null);
    const [showWarn, setShowWarn] = useState(false)
    const [deleteUser, {isLoading, isSuccess}] = useDeleteUserMutation()

    const handleDeleteUser = async () => {
        if (selectedUser !== null){
            try {
                const response = await deleteUser({id: selectedUser.id}).unwrap();
                toast.success("Пользователь успешно удален")
                setShowWarn(false)
                refetch()
            } catch (err) {
                console.error(`delete user error: ${JSON.stringify(err)}`)
                toast.error('Не удалось удалить пользователя');

            }
        }
    }

    const columns = useMemo(() => [
        {field: 'id', headerName: "Id", flex: 1},
        {field: 'first_name', headerName: "Имя", flex: 3},
        {field: 'last_name', headerName: "Фамилия", flex: 3},
        {field: 'email', headerName: "Email", flex: 3},
        /*{field: 'last_name', headerName: "Роль", flex: 2, type: 'singleSelect', valueOption: ['ADMIN','USER'], editable: true},*/
        {field: 'avatar', headerName: "Аватар", flex: 1, renderCell: (params) => (
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'center', // Горизонтальное центрирование
                        alignItems: 'center',     // Вертикальное центрирование
                        height: '100%',           // Занимает всю высоту ячейки
                    }}
                >
                    <Avatar src={params.row.avatar} />
                </Box>
            ), sortable: false, filterable: false, headerAlign: 'center'},
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
                            setSelectedUser(params.row);
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
        {title: "Пользователи", path: ""},
    ]



    return(
        <PageBuilder paths={paths} sideComponent={<SideNavigation title="Администрирование" paths={getAdminSidePaths()} alias={"users"}/>}>
            <div className={styles.spaceBetween}>
                <h3>Пользователи</h3>
                <button className={`button-primary ${styles.iconButton}`} onClick={() => navigate("/admin/users/add")}><FaPlus/> Добавить пользователя</button>
            </div>
            <div className="horizontal-divider"></div>
            {usersIsLoading &&
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
            {!usersIsLoading && !usersError &&
                <>
                    <Box
                        sx={{
                            width: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                        }}>
                        <DataGrid
                            columns={columns}
                            rows={users?.data || []}
                            getRowId={(row) => row.id}
                            paginationModel={{
                                page: users?.page > 0 ? users.page : paginationModel.page,
                                pageSize: users?.perPage || paginationModel.perPage,
                            }}
                            onPaginationModelChange={(newModel) => {
                                console.log(`new model: ${JSON.stringify(newModel)}`);
                                setPaginationModel({ page: newModel.page, perPage: newModel.pageSize });
                            }}
                            rowCount={users?.total_items || 0}
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
                            setSelectedUser(null);
                        }}
                    >
                        <MenuItem onClick={() => {setAnchorEl(null); }}>Добавить в проект</MenuItem>
                        <MenuItem onClick={() => {setAnchorEl(null); setShowWarn(true)}}>Удалить</MenuItem>
                    </Menu>
                </>
            }
            <WarnModal show={showWarn} setShow={setShowWarn} title="Удаление пользователя" text="Вы уверенны что хотите удалить пользователя?" onYes={handleDeleteUser}></WarnModal>
        </PageBuilder>
    )
}