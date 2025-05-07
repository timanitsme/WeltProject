import {useEffect, useMemo, useState} from "react";
import {
    useDeleteProjectMutation,
    useGetAllProjectsQuery,
} from "../../../store/services/welt.js";
import {toast} from "react-toastify";
import {Avatar, Box, CircularProgress, IconButton, Menu, MenuItem} from "@mui/material";
import {MdMoreVert} from "react-icons/md";
import {useNavigate} from "react-router-dom";
import {
    FaBoxTissue, FaPiedPiperAlt, FaPiedPiperHat,
    FaPiedPiperPp,
    FaPlus,
    FaUser,
    FaUserShield
} from "react-icons/fa6";
import {GoProject} from "react-icons/go";
import {FaTasks} from "react-icons/fa";
import PageBuilder from "../../../components/PageBuilder/PageBuilder.jsx";
import SideNavigation from "../../../components/Navigation/SideNavigation/SideNavigation.jsx";
import styles from "./AdminProjects.module.scss";
import {DataGrid} from "@mui/x-data-grid";
import {ruRU} from "@mui/x-data-grid/locales";
import WarnModal from "../../../components/Modals/WarnModal/WarnModal.jsx";
import getAdminSidePaths from "../../../utils/adminSidePaths.js";

export default function AdminProjects(){
    const [paginationModel, setPaginationModel] = useState({page: 0, perPage: 5})
    const [selectedProject, setSelectedProject] = useState(null);
    const {data: projects, isLoading: projectsIsLoading, error: projectsError, refetch} = useGetAllProjectsQuery({page: paginationModel.page, perPage: paginationModel.perPage})
    const [rowId, setRowId] = useState(null)
    const [anchorEl, setAnchorEl] = useState(null);
    const [showWarn, setShowWarn] = useState(false)
    const [deleteProject, {isLoading, isSuccess}] = useDeleteProjectMutation()

    const handleDeleteUser = async () => {
        if (selectedProject !== null){
            try {
                const response = await deleteProject({id: selectedProject.id}).unwrap();
                toast.success("Проект успешно удален")
                setShowWarn(false)
                refetch()
            } catch (err) {
                console.error(`delete project error: ${JSON.stringify(err)}`)
                toast.error('Не удалось удалить проект');

            }
        }
    }

    const columns = useMemo(() => [
        {field: 'id', headerName: "Id", flex: 1},
        {field: 'title', headerName: "Название", flex: 3},
        {field: 'icon', headerName: "Иконка", flex: 1, renderCell: (params) => (
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        height: '100%',
                    }}
                >
                    <Avatar src={params.row.icon}>
                        <FaPiedPiperHat/>
                    </Avatar>
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
                        setSelectedProject(params.row);
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
        {title: "Проекты", path: ""},
    ]



    return(
        <PageBuilder paths={paths} sideComponent={<SideNavigation title="Администрирование" paths={getAdminSidePaths()} alias={"projects"}/>}>
            <div className={styles.spaceBetween}>
                <h3>Проекты</h3>
                <button className={`button-primary ${styles.iconButton}`}><FaPlus/> Добавить проект</button>
            </div>
            <div className="horizontal-divider"></div>
            {projectsIsLoading &&
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
            {!projectsIsLoading && !projectsError &&
                <>
                    <Box
                        sx={{
                            width: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                        }}>
                        <DataGrid
                            columns={columns}
                            rows={projects?.data || []}
                            getRowId={(row) => row.id}
                            paginationModel={{
                                page: projects?.page > 0 ? projects.page : paginationModel.page,
                                pageSize: projects?.perPage || paginationModel.perPage,
                            }}
                            onPaginationModelChange={(newModel) => {
                                console.log(`new model: ${JSON.stringify(newModel)}`);
                                setPaginationModel({ page: newModel.page, perPage: newModel.pageSize });
                            }}
                            rowCount={projects?.total_items || 0}
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
                            setSelectedProject(null);
                        }}
                    >
                        <MenuItem onClick={() => {setAnchorEl(null); setShowWarn(true)}}>Удалить</MenuItem>
                    </Menu>
                </>
            }
            <WarnModal show={showWarn} setShow={setShowWarn} title="Удаление проекта" text="Вы уверенны что хотите удалить проект?" onYes={handleDeleteUser}></WarnModal>
        </PageBuilder>
    )
}