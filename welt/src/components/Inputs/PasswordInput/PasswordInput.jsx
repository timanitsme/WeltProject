import styles from "./PasswordInput.module.scss"
import {useState} from "react";
import {FiEye, FiEyeOff} from "react-icons/fi";

export default function PasswordInput({inputValue, setInputValue, placeholder=""}){
    const [showPassword, setShowPassword] = useState(false);
    const togglePasswordVisibility = () => {
        setShowPassword((prev) => !prev);
    };
    return(
        <div className={styles.passwordContainer}>
            <input
                type={showPassword ? 'text' : 'password'} // Переключение типа
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={placeholder}
                className={styles.textInput}
            />


            <span
                className={styles.eyeIcon}
                onClick={togglePasswordVisibility}
                role="button"
                tabIndex="0"
            >
                {showPassword ? <FiEyeOff/> : <FiEye/>}
            </span>
        </div>
    )
}