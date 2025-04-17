import styles from "./Overview.module.scss"
import PageBuilder from "../../components/PageBuilder/PageBuilder.jsx";
import SideNavigation from "../../components/Navigation/SideNavigation/SideNavigation.jsx";
import Request from "../../components/Request/Request.jsx";
import useAuth from "../../utils/customHooks/useAuth.js";

export default function Overview(){
    const {isAuthorized, userProfile, isLoading, error} = useAuth()



    if (isLoading || !isAuthorized) return null
    return(
        <PageBuilder>
            <h3>Добро пожаловать, {userProfile?.first_name}!</h3>
            <div className="horizontal-divider"></div>

        </PageBuilder>
    )
}