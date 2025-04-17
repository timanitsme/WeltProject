import styles from "./AuthPage.module.scss"
import TextInput from "../../components/Inputs/TextInput/TextInput.jsx";
import PasswordInput from "../../components/Inputs/PasswordInput/PasswordInput.jsx";
import {useState} from "react";
import {toast} from "react-toastify";
import {useDispatch} from "react-redux";
import {useGetProfileQuery, useLoginMutation, weltApi} from "../../store/services/welt.js";
import {logout, setCredentials, setUserProfile} from "../../store/services/authSlice.js";
import {useNavigate} from "react-router-dom";

export default function AuthPage(){
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [login, {isLoading, isSuccess}] = useLoginMutation()
    const dispatch = useDispatch()
    const navigate = useNavigate()

    const validateEmail = () => {
        return String(email)
            .toLowerCase()
            .match(
                /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
            );
    };

    const handleSubmit = async () => {
        if (password.trim().length === 0 || email.trim().length === 0){
            toast.error("Заполните все поля")
        }
        else if (!validateEmail()){
            toast.error("Вы ввели некорректный Email")
        }
        else{
            try {
                const response = await login({email: email, password: password}).unwrap();
                await dispatch(setCredentials(response));
                // Загружаем профиль пользователя
                const profileResponse = await dispatch(weltApi.endpoints.getProfile.initiate());
                if (profileResponse.data) {
                    await dispatch(setUserProfile(profileResponse.data));
                }
                navigate("/")
                toast.success("Авторизация успешна")
            } catch (err) {
                console.error(`login error: ${JSON.stringify(err)}`)
                toast.error('Неверный email или пароль');
                dispatch(logout());
            }
        }
    }

    return(
        <div className={styles.authSection}>
            <div className={styles.authForm}>
                <h3>Авторизация</h3>
                <div className={styles.inputContainer}>
                    <p>Email</p>
                    <TextInput inputValue={email} setInputValue={setEmail} placeholder={"Введите ваш email"}></TextInput>
                </div>
                <div className={styles.inputContainer}>
                    <p>Пароль</p>
                    <PasswordInput  placeholder={"Введите пароль"} setInputValue={setPassword} inputValue={password}></PasswordInput>
                </div>
                <button onClick={handleSubmit} className="button-primary">Войти</button>
            </div>
        </div>
    )
}