import {useRef, useState} from "react";
import {FaChevronDown} from "react-icons/fa";
import styles from "./Dropdown.module.scss"

export default function Dropdown({label, options, selectedOption, onSelect, isLoading, isError, onScroll, hasMoreOptions, placeholder="Выберите"}) {
    const dropdownRef = useRef(null);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false)

    return (
        <div className={styles.dropdownInput}>
            <label>{label}</label>
            <div style={{position: "relative", width: "100%"}}>
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "11px",
                        backgroundColor: "var(--fg)",
                        borderRadius: "5px",
                        cursor: "pointer",
                    }}
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                >
                    {selectedOption?.title || placeholder}
                    <FaChevronDown />
                </div>

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
                        }}
                    >
                        {isLoading ? (
                            <p>Загрузка...</p>
                        ) : isError ? (
                            <p>Ошибка загрузки</p>
                        ) : (
                            options.map((option) => (
                                <div
                                    key={option.id}
                                    style={{
                                        padding: "10px",
                                        cursor: "pointer",
                                        backgroundColor:
                                            selectedOption?.id === option.id ? "var(--primary)" : "transparent",
                                    }}
                                    onClick={() => {onSelect(option); setIsDropdownOpen(false)}}
                                >
                                    {option.title}
                                </div>
                            ))
                        )}
                        {hasMoreOptions && <p>Загрузка...</p>}
                    </div>
                )}
            </div>
        </div>
    );
}