import {DateTimePicker} from "@mui/x-date-pickers";
import {TextField} from "@mui/material";
import styles from "./CustomDateTimePicker.module.scss"

export default function CustomDateTimePicker({ label, value, onChange, required = false }) {
    return (
        <div style={{ margin: "0 0 15px 0" }} className={styles.pickerContainer}>
            <label className={styles.dateTimeLabel}>{label}</label>
            <DateTimePicker
                value={value}
                onChange={onChange}
                slotProps={{
                    textField: {
                        fullWidth: true,
                        variant: "outlined", // Используем вариант "outlined"

                    },
                }}
                renderInput={(params) => <TextField
                    {...params}
                    fullWidth
                />}
                inputFormat="DD.MM.YYYY HH:mm"
                ampm={false}
                required={required}
            />
        </div>
    );
}