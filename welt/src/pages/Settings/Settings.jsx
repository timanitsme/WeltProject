import styles from "./Settings.module.scss"
import SideNavigation from "../../components/Navigation/SideNavigation/SideNavigation.jsx";
import Request from "../../components/Request/Request.jsx";
import PageBuilder from "../../components/PageBuilder/PageBuilder.jsx";
import {useState} from "react";
import ThemeToggle from "../../components/Settings/ThemeToggle/ThemeToggle.jsx";
import Toggle from "../../components/Toggle/Toggle.jsx";
import {useDispatch} from "react-redux";
import {logout} from "../../store/services/authSlice.js";
import {useNavigate} from "react-router-dom";
import {toast} from "react-toastify";

export default function Settings(){
    const selectedTheme = localStorage.getItem('theme')
    const [themeToggle, setThemeToggle] = useState(selectedTheme && selectedTheme === "dark")
    const setTheme = (theme) => {
        document.querySelector('body').setAttribute('data-theme', theme)
        localStorage.setItem('theme', theme)
    }
    const dispatch = useDispatch()
    const navigate = useNavigate()


    const handleLogout = async() => {
        try {
            await dispatch(logout());
            toast.success("Вы успешно покинули аккаунт")
            navigate("/auth");
        }
        catch (err){
            console.log(`error while logout: ${err}`)
        }
    }

    return(
        <PageBuilder withNav={false}>
            <h3>Настройки</h3>
            <div className="horizontal-divider"></div>
            <div className={styles.settingsList}>
                <div className={styles.setting}>
                    <h6 className={styles.title}>Тема</h6>
                    <Toggle isToggled={themeToggle} setIsToggled={setThemeToggle} onChange={(value) => value? setTheme("dark"): setTheme("light")} label={selectedTheme && selectedTheme === "dark"? "Темная": "Светлая"}/>
                </div>
                <div className={styles.setting}>
                    <h6>Аккаунт</h6>
                    <div className={styles.row}>
                        <p className="text-secondary">Выйти из аккаунта: </p>
                        <button className="button-primary" onClick={handleLogout}>Выход</button>
                    </div>
                </div>
            </div>
        </PageBuilder>
    )
}