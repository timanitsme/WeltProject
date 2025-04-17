import './App.scss'
import Sidebar from "./components/MainLayout/Sidebar/Sidebar.jsx";
import SideNavigation from "./components/Navigation/SideNavigation/SideNavigation.jsx";
import AllRequests from "./pages/AllRequests/AllRequests.jsx";
import PageBuilder from "./components/PageBuilder/PageBuilder.jsx";
import {BrowserRouter, Navigate, Route, Routes} from "react-router-dom";
import RequestDetail from "./pages/RequestDetail/RequestDetail.jsx";
import ChatPage from "./pages/ChatPage/ChatPage.jsx";
import Settings from "./pages/Settings/Settings.jsx";
import CompletedRequests from "./pages/CompletedRequests/CompletedRequests.jsx";
import AuthPage from "./pages/AuthPage/AuthPage.jsx";
import {useEffect} from "react";
import {initializeAuthState} from "./store/services/authSlice.js";
import {useDispatch} from "react-redux";
import useAuth from "./utils/customHooks/useAuth.js";
import Overview from "./pages/Overview/Overview.jsx";
import {FaFolderOpen} from "react-icons/fa6";
import {RiCloseCircleFill, RiProgress1Fill} from "react-icons/ri";
import {FaCheckSquare} from "react-icons/fa";
import RequestsInProgress from "./pages/RequestsInProgress/RequestsInProgress.jsx";
import RejectedRequests from "./pages/RejectedRequests/RejectedRequests.jsx";
import MyRequests from "./pages/MyRequests/MyRequests.jsx";

function App() {
    const dispatch = useDispatch();
    const {isAuthorized, userProfile, isLoading, error} = useAuth()

    useEffect(() => {
        dispatch(initializeAuthState());
    }, [dispatch]);

    const selectedTheme = localStorage.getItem('theme')
    if (selectedTheme){
        document.querySelector('body').setAttribute('data-theme', selectedTheme)
    }

    useEffect(() => {
        console.log(`isAuthorized: ${isAuthorized}`)
    }, [isAuthorized]);

    useEffect(() => {
        console.log(`isLoading: ${isAuthorized}`)
    }, [isLoading]);


    if (isLoading) {
        return <div className="app"><div>Loading...</div></div>;
    }

    const ProtectedRoute = ({ element }) => {
        return isAuthorized ? element : <Navigate to="/auth" />;
    };

    const paths = [
        {title: "Обзор", path: "/", element: <Overview/>},
        {title: "Авторизация", path: "/auth", element: <AuthPage/>},
        {title: "Заявки", path: ":project/requests", element: <AllRequests/>},
        {title: "Завершенные заявки", path: ":project/requests/completed/", element: <CompletedRequests/>},
        {title: "Заявки в работе", path: ":project/requests/in-progress/", element: <RequestsInProgress/>},
        {title: "Отклоненные заявки", path: ":project/requests/rejected/", element: <RejectedRequests/>},
        {title: "Мои заявки", path: ":project/requests/my/", element: <MyRequests/>},
        {title: "Все заявки", path: ":project/request/:id", element: <RequestDetail/>},
        {title: "Чат", path: "/chats", element: <ChatPage/>},
        {title: "Настройки", path: "/settings", element: <Settings/>}
    ]

    return (
    <BrowserRouter>
        <div className="app">
            <Sidebar/>
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
