import styles from "./FileInput.module.scss"

export default function FileInput({ label, id, onChange, accept, file }) {
    return (
        <div className={`${styles.fileInput} ${styles.customFileButton}`}>
            <label htmlFor={id} className="cus">
                {label}
            </label>
            <input
                type="file"
                id={id}
                accept={accept}
                style={{ display: "none" }}
                onChange={onChange}
            />
            {file && <span>{file.name}</span>}
        </div>
    );
}