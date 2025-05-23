import './App.scss'
import Sidebar from "./components/MainLayout/Sidebar/Sidebar.jsx";
import SideNavigation from "./components/Navigation/SideNavigation/SideNavigation.jsx";
import AllRequests from "./pages/Requests/AllRequests/AllRequests.jsx";
import PageBuilder from "./components/PageBuilder/PageBuilder.jsx";
import {BrowserRouter, Navigate, Route, Routes} from "react-router-dom";
import RequestDetail from "./pages/Requests/RequestDetail/RequestDetail.jsx";
import ChatPage from "./pages/ChatPage/ChatPage.jsx";
import Settings from "./pages/Settings/Settings.jsx";
import CompletedRequests from "./pages/Requests/CompletedRequests/CompletedRequests.jsx";
import AuthPage from "./pages/AuthPage/AuthPage.jsx";
import {useEffect, useState} from "react";
import {initializeAuthState} from "./store/services/authSlice.js";
import {useDispatch} from "react-redux";
import useAuth from "./utils/customHooks/useAuth.js";
import Overview from "./pages/Overview/Overview.jsx";
import {FaFolderOpen} from "react-icons/fa6";
import {RiCloseCircleFill, RiProgress1Fill} from "react-icons/ri";
import {FaCheckSquare} from "react-icons/fa";
import RequestsInProgress from "./pages/Requests/RequestsInProgress/RequestsInProgress.jsx";
import RejectedRequests from "./pages/Requests/RejectedRequests/RejectedRequests.jsx";
import MyRequests from "./pages/Requests/MyRequests/MyRequests.jsx";
import MobileSidebar from "./components/MainLayout/MobileSidebar/MobileSidebar.jsx";
import Tasks from "./pages/Tasks/Tasks.jsx";
import AdminIndexPage from "./pages/Admin/AdminIndexPage/AdminIndexPage.jsx";
import AdminUsers from "./pages/Admin/AdminUsers/AdminUsers.jsx";
import AdminRoles from "./pages/Admin/AdminRoles/AdminRoles.jsx";
import AdminProjects from "./pages/Admin/AdminProjects/AdminProjects.jsx";
import AdminRequests from "./pages/Admin/AdminRequests/AdminRequests.jsx";
import AddProject from "./pages/Admin/AdminProjects/AddProject/AddProject.jsx";
import AddRole from "./pages/Admin/AdminRoles/AddRole/AddRole.jsx";
import AdminTasks from "./pages/Admin/AdminTasks/AdminTasks.jsx";
import AddUser from "./pages/Admin/AdminUsers/AddUser/AddUser.jsx";
import AddTask from "./pages/Admin/AdminTasks/AddTask/AddTask.jsx";
import AddRequest from "./pages/Admin/AdminRequests/AddRequest/AddRequest.jsx";
import AddUserRequest from "./pages/Requests/AddUserRequest/AddUserRequest.jsx";
import AddUserTask from "./pages/Tasks/AddUserTask/AddUserTask.jsx";

function App() {
    const dispatch = useDispatch();
    const {isAuthorized, userProfile, isLoading, error} = useAuth()
    const [isMobile, setIsMobile] = useState(window.innerWidth < 700);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 700);
        };
        window.addEventListener("resize", handleResize);
        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, []);

    useEffect(() => {
        dispatch(initializeAuthState());
    }, [dispatch]);

    const selectedTheme = localStorage.getItem('theme')
    if (selectedTheme){
        document.querySelector('body').setAttribute('data-theme', selectedTheme)
    }

    if (isLoading) {
        return <div className="app"><div>Loading...</div></div>;
    }

    const ProtectedRoute = ({ element }) => {
        return isAuthorized ? element : <Navigate to="/auth" />;
    };

    const paths = [
        {title: "Обзор", path: "/", element: <Overview/>},
        {title: "Авторизация", path: "/auth", element: <AuthPage/>},
        {title: "Заявки", path: "/requests", element: <AllRequests/>},
        {title: "Завершенные заявки", path: "/requests/completed/", element: <CompletedRequests/>},
        {title: "Заявки в работе", path: "/requests/in-progress/", element: <RequestsInProgress/>},
        {title: "Отклоненные заявки", path: "/requests/rejected/", element: <RejectedRequests/>},
        {title: "Мои заявки", path: "/requests/my/", element: <MyRequests/>},
        {title: "Все заявки", path: "/request/:id", element: <RequestDetail/>},
        {title: "Задачи", path: "/tasks", element: <Tasks/>},
        {title: "Чат", path: "/chats", element: <ChatPage/>},
        {title: "Чат", path: "/chats/:id", element: <ChatPage/>},
        {title: "Настройки", path: "/settings", element: <Settings/>},
        {title: "Администрирование", path: "/admin", element: <AdminIndexPage/>},
        {title: "Администрирование пользователей", path: "/admin/users", element: <AdminUsers/>},
        {title: "Администрирование ролей", path: "/admin/roles", element: <AdminRoles/>},
        {title: "Администрирование проектов", path: "/admin/projects", element: <AdminProjects/>},
        {title: "Новый проект", path: "/admin/projects/add", element: <AddProject/>},
        {title: "Новая роль", path: "/admin/roles/add", element: <AddRole/>},
        {title: "Новый пользователь", path: "/admin/users/add", element: <AddUser/>},
        {title: "Новая задача", path: "/admin/tasks/add", element: <AddTask/>},
        {title: "Новая задача от пользователя", path: "/tasks/add/:id", element: <AddUserTask/>},
        {title: "Новая заявка", path: "/admin/requests/add", element: <AddRequest/>},
        {title: "Новая заявка от пользователя", path: "/requests/add", element: <AddUserRequest/>},
        {title: "Администрирование заявок", path: "/admin/requests", element: <AdminRequests/>},
        {title: "Администрирование задач", path: "/admin/tasks", element: <AdminTasks/>}
    ]

    return (
    <BrowserRouter>
        <div className="app">
            {isMobile? <MobileSidebar/>: <Sidebar/>}
                <Routes>
                    {paths.map((path) => {
                        return <Route key={path.title} path={path.path} element={path.path === "/auth"? (path.element): (<ProtectedRoute element={path.element}/>)}></Route>
                    })}
                </Routes>
        </div>
    </BrowserRouter>
    )
}

export default App
