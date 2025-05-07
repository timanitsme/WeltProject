import {useSelector} from "react-redux";

const useAuth = () => {
    const isAuthorized = useSelector((state) => state.auth.isAuthorized);
    const userProfile = useSelector((state) => state.auth.userProfile);
    const currentProject = useSelector((state) => state.auth.currentProject);
    const isLoading = useSelector((state) => state.auth.isLoading);
    const error = useSelector((state) => state.auth.error);
    return { isAuthorized, userProfile, currentProject, isLoading, error };
};

export default useAuth;