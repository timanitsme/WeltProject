import styles from "./PageBuilder.module.scss"
import NavChain from "../Navigation/NavChain/NavChain.jsx";
import {useEffect, useState} from "react";
import {FaAngleDoubleRight} from "react-icons/fa";
import {IoClose} from "react-icons/io5";
import {GiHamburgerMenu} from "react-icons/gi";
import {useSwipeable} from "react-swipeable";

export default function PageBuilder({sideComponent, children, removePaddings=false, withNav=true, paths=[], removeBg=false}){
    const [isMobile, setIsMobile] = useState(window.innerWidth < 700)
    const [isMenuOpen, setIsMenuOpen] = useState(false)

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 700);
        };
        window.addEventListener("resize", handleResize);
        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, []);

    useEffect(() => {
        const appContainer = document.querySelector(".app");
        if (isMenuOpen) {
            appContainer.scrollTo({ top: 0, behavior: "smooth" });
            appContainer.style.overflow = "hidden";
        } else {
            appContainer.style.overflow = "auto";
        }
    }, [isMenuOpen]);

    const swipeHandlers = useSwipeable({
        onSwipedLeft: () => setIsMenuOpen(false),
        trackMouse: true,
    });

    return(
        <div className='contentContainer'>
            {!isMobile && sideComponent}
            {isMobile && sideComponent &&
                <div className={styles.sideContainerRow}>
                    <button onClick={() => setIsMenuOpen(!isMenuOpen)}>
                        {isMenuOpen? <IoClose/> : <FaAngleDoubleRight/>}
                    </button>
                </div>
            }
            {isMobile && sideComponent && (
                <div className={`${styles.mobileMenuOverlay} ${isMenuOpen ? styles.open : ""}`} {...swipeHandlers}>
                    <div className={styles.mobileMenuContent}>
                        <div className={styles.contentButtonRow}>
                            <button onClick={() => setIsMenuOpen(!isMenuOpen)}>
                                <IoClose/>
                            </button>
                        </div>
                        {sideComponent}
                    </div>
                </div>
            )}
            <div className={`content ${removePaddings? "noPaddings": ""}`} style={{background: `${removeBg? "none": "var(--surface)"}`}}>
                {withNav && <NavChain style={removePaddings? {paddingTop: "10px", paddingLeft: "10px"}: {}} paths={paths}/>}
                {children}
            </div>
        </div>
    )
}