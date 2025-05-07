import {FaBoxTissue, FaUser, FaUserShield} from "react-icons/fa6";
import {GoProject} from "react-icons/go";
import {FaTasks} from "react-icons/fa";

export default function getAdminSidePaths(){
    return [
        {Icon: FaUser, text: "Пользователи", path: "/admin/users", alias: "users"},
        {Icon: GoProject, text: "Проекты", path: "/admin/projects", alias: "projects"},
        {Icon: FaBoxTissue, text: "Заявки", path: "/admin/requests", alias: "requests"},
        {Icon: FaTasks, text: "Задачи", path: "/admin/tasks", alias: "tasks"},
        {Icon: FaUserShield, text: "Роли", path: "/admin/roles", alias: "roles"},
    ]
}