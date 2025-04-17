import {useSelector} from "react-redux";

const useAuth = () => {
    const isAuthorized = useSelector((state) => state.auth.isAuthorized);
    const userProfile = useSelector((state) => state.auth.userProfile);
    const isLoading = useSelector((state) => state.auth.isLoading);
    const error = useSelector((state) => state.auth.error);
    console.log('useAuth values:', { isAuthorized, userProfile, isLoading, error });
    return { isAuthorized, userProfile, isLoading, error };
};

export default useAuth;