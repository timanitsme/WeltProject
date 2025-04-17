import styles from "./ThemeToggle.module.css"

export default function ThemeToggle({theme}){
    const setTheme = () => {
        document.querySelector('body').setAttribute('data-theme', theme)
    }
    return <div onClick={setTheme} className={styles.themeOption} id={`theme-${theme}`}></div>
}