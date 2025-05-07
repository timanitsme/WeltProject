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
        {title: "Настройки", path: "/settings", element: <Settings/>},
        {title: "Администрирование", path: "/admin", element: <AdminIndexPage/>},
        {title: "Администрирование пользователей", path: "/admin/users", element: <AdminUsers/>},
        {title: "Администрирование ролей", path: "/admin/roles", element: <AdminRoles/>},
        {title: "Администрирование проектов", path: "/admin/projects", element: <AdminProjects/>},
        {title: "Администрирование заявок", path: "/admin/requests", element: <AdminRequests/>}
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
