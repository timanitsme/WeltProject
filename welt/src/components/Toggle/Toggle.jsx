import styles from "./Toggle.module.scss"

export default function Toggle( {label, isToggled, setIsToggled, onChange}) {

    const callback = () => {
        setIsToggled(!isToggled)
        if (onChange)
            onChange(!isToggled)
    }

    return (
        <label className={styles.toggle}>
            <input type="checkbox" defaultChecked={isToggled} onClick={callback} />
            <span />
            <p className="noSelect text-min">{label}</p>
        </label>
    )
}