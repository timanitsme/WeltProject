import styles from "./TextInput.module.scss"

export default function TextInput({label, id, value, onChange, placeholder, type="text", required=false}){
    return(
        <div className={styles.textInput}>
            <label htmlFor={id}>{label}</label>
            <input
                type={type}
                id={id}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                required={required}
            />
        </div>
    )
}