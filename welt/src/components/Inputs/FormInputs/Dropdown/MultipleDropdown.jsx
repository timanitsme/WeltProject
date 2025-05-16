import {useRef, useState} from "react";
import styles from "./Dropdown.module.scss";
import {FaChevronDown, FaTimes} from "react-icons/fa";

export default function MultipleDropdown({label, options, selectedOptions = [], onSelect, isLoading, isError, onScroll, hasMoreOptions, placeholder = "Выберите",}) {
    const dropdownRef = useRef(null);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const handleSelect = (option) => {
        if (selectedOptions.some((selected) => selected.id === option.id)) {
            onSelect(selectedOptions.filter((selected) => selected.id !== option.id));
        } else {
            onSelect([...selectedOptions, option]);
        }
    };

    const removeOption = (optionToRemove) => {
        onSelect(selectedOptions.filter((option) => option.id !== optionToRemove.id));
    };

    return (
        <div className={styles.dropdownInput}>
            <label>{label}</label>
            <div style={{ position: "relative", width: "100%" }}>
                {/* Поле ввода */}
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        flexWrap: "wrap",
                        padding: "11px",
                        backgroundColor: "var(--fg)",
                        borderRadius: "5px",
                        cursor: "pointer",
                        minHeight: "40px",
                    }}
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                >
                    {selectedOptions.length > 0 ? (
                        selectedOptions.map((option) => (
                            <div
                                key={option.id}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    padding: "5px 10px",
                                    margin: "2px",
                                    backgroundColor: "var(--primary)",
                                    borderRadius: "5px",
                                    color: "#fff",
                                }}
                            >

                                {option?.title || `${option?.last_name} ${option?.first_name}`}
                                <FaTimes
                                    style={{ marginLeft: "5px", cursor: "pointer" }}
                                    onClick={(e) => {
                                        e.stopPropagation(); // Предотвращаем закрытие выпадающего списка
                                        removeOption(option);
                                    }}
                                />
                            </div>
                        ))
                    ) : (
                        <span style={{ color: "#aaa" }}>{placeholder}</span>
                    )}
                    <FaChevronDown style={{ marginLeft: "auto" }} />
                </div>

                {/* Выпадающий список */}
                {isDropdownOpen && (
                    <div
                        ref={dropdownRef}
                        onScroll={onScroll}
                        style={{
                            position: "absolute",
                            top: "100%",
                            left: 0,
                            right: 0,
                            maxHeight: "200px",
                            overflowY: "auto",
                            backgroundColor: "var(--fg)",
                            zIndex: 10,
                            borderRadius: "5px",
                        }}
                    >
                        {isLoading ? (
                            <p style={{ padding: "10px", textAlign: "center" }}>Загрузка...</p>
                        ) : isError ? (
                            <p style={{ padding: "10px", textAlign: "center" }}>Ошибка загрузки</p>
                        ) : (
                            options.map((option) => (
                                <div
                                    key={option.id}
                                    style={{
                                        padding: "10px",
                                        cursor: "pointer",
                                        backgroundColor:
                                            selectedOptions.some((selected) => selected.id === option.id)
                                                ? "var(--primary)"
                                                : "transparent",
                                        color: "var(--txt-active)"
                                    }}
                                    onClick={() => {
                                        handleSelect(option);
                                    }}
                                >
                                    {option?.title || `${option?.last_name} ${option?.first_name}`}
                                </div>
                            ))
                        )}
                        {hasMoreOptions && (
                            <p style={{ padding: "10px", textAlign: "center" }}>Загрузка...</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}