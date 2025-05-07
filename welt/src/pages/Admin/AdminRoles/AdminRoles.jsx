import {useEffect, useMemo, useState} from "react";
import {
    useDeleteRoleMutation,
    useDeleteUserMutation,
    useGetAllRolesQuery,
    useGetAllUsersQuery
} from "../../../store/services/welt.js";
import {toast} from "react-toastify";
import {Avatar, Box, CircularProgress, IconButton, Menu, MenuItem} from "@mui/material";
import {MdMoreVert} from "react-icons/md";
import {useNavigate} from "react-router-dom";
import {FaBoxTissue, FaPlus, FaUser, FaUserShield} from "react-icons/fa6";
import {GoProject} from "react-icons/go";
import {FaTasks} from "react-icons/fa";
import PageBuilder from "../../../components/PageBuilder/PageBuilder.jsx";
import SideNavigation from "../../../components/Navigation/SideNavigation/SideNavigation.jsx";
import styles from "./AdminRoles.module.scss";
import {DataGrid} from "@mui/x-data-grid";
import {ruRU} from "@mui/x-data-grid/locales";
import WarnModal from "../../../components/Modals/WarnModal/WarnModal.jsx";
import getAdminSidePaths from "../../../utils/adminSidePaths.js";

export default function AdminRoles(){
    const [paginationModel, setPaginationModel] = useState({page: 0, perPage: 5})
    const [selectedRole, setSelectedRole] = useState(null);
    const {data: roles, isLoading: rolesIsLoading, error: rolesError, refetch} = useGetAllRolesQuery({page: paginationModel.page, perPage: paginationModel.perPage})
    const [rowId, setRowId] = useState(null)
    const [anchorEl, setAnchorEl] = useState(null);
    const [showWarn, setShowWarn] = useState(false)
    const [deleteRole, {isLoading, isSuccess}] = useDeleteRoleMutation()

    const handleDeleteUser = async () => {
        if (selectedRole !== null){
            try {
                const response = await deleteRole({id: selectedRole.id}).unwrap();
                toast.success("Роль успешно удалена")
                setShowWarn(false)
                refetch()
            } catch (err) {
                console.error(`delete role error: ${JSON.stringify(err)}`)
                toast.error('Не удалось удалить роль');

            }
        }
    }

    const columns = useMemo(() => [
        {field: 'id', headerName: "Id", flex: 1},
        {field: 'title', headerName: "Название", flex: 3},
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
                            setSelectedRole(params.row);
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
        {title: "Роли", path: ""},
    ]



    return(
        <PageBuilder paths={paths} sideComponent={<SideNavigation title="Администрирование" paths={getAdminSidePaths()} alias={"roles"}/>}>
            <div className={styles.spaceBetween}>
                <h3>Роли</h3>
                <button className={`button-primary ${styles.iconButton}`}><FaPlus/> Добавить роль</button>
            </div>
            <div className="horizontal-divider"></div>
            {rolesIsLoading &&
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
            {!rolesIsLoading && !rolesError &&
                <>
                    <Box
                        sx={{
                            width: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                        }}>
                        <DataGrid
                            columns={columns}
                            rows={roles?.data || []}
                            getRowId={(row) => row.id}
                            paginationModel={{
                                page: roles?.page > 0 ? roles.page : paginationModel.page,
                                pageSize: roles?.perPage || paginationModel.perPage,
                            }}
                            onPaginationModelChange={(newModel) => {
                                console.log(`new model: ${JSON.stringify(newModel)}`);
                                setPaginationModel({ page: newModel.page, perPage: newModel.pageSize });
                            }}
                            rowCount={roles?.total_items || 0}
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
                            setSelectedRole(null);
                        }}
                    >
                        <MenuItem onClick={() => {setAnchorEl(null); setShowWarn(true)}}>Удалить</MenuItem>
                    </Menu>
                </>
            }
            <WarnModal show={showWarn} setShow={setShowWarn} title="Удаление роли" text="Вы уверенны что хотите удалить роль?" onYes={handleDeleteUser}></WarnModal>
        </PageBuilder>
    )
}