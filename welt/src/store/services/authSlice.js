import { createSlice } from '@reduxjs/toolkit/react';
import {weltApi} from "../services/welt.js";
import getAccessToken from "../utils/tokenUtils/getAccessToken.js";
import getRefreshToken from "../utils/tokenUtils/getRefreshToken.js";
import {jwtDecode} from "jwt-decode";

const initialState = {
    isAuthorized: false,
    userProfile: null,
    currentProject: null,
    isLoading: true,
    error: null,
    isInitialized: false
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setCredentials: (state, action) => {
            const { access_token, refresh_token } = action.payload;
            state.isAuthorized = true;
            document.cookie = `access_token=${access_token}; path=/; max-age=${60 * 30}`;
            document.cookie = `refresh_token=${refresh_token}; path=/; max-age=${60 * 60 * 24 * 7}`;
        },
        logout: (state) => {
            state.isAuthorized = false;
            state.userProfile = null;
            document.cookie = `access_token=; path=/; max-age=0`;
            document.cookie = `refresh_token=; path=/; max-age=0`;
        },
        setUserProfile: (state, action) => {
            state.userProfile = action.payload;
        },
        setIsLoading: (state, action) => {
            state.isLoading = action.payload;
        },
        setCurrentProject: (state, action) => {
            state.currentProject = action.payload;
        },
        setError: (state, action) => {
            state.error = action.payload;
        },
        setIsInitialized: (state, action) => {
            state.isInitialized = action.payload;
        },
    },
});

export const { setCredentials, logout, setUserProfile, setIsLoading, setError, setIsInitialized, setCurrentProject } = authSlice.actions;

export const initializeAuthState = () => async (dispatch, getState) => {
    const { isInitialized } = getState().auth;
    if (isInitialized) return;
    dispatch(setIsLoading(true)); // Устанавливаем состояние загрузки
    dispatch(setIsInitialized(true));

    try {
        // Проверяем наличие токенов в куках
        let accessToken = getAccessToken();
        let refreshToken = getRefreshToken();

        if (!accessToken || !refreshToken) {
            throw new Error('Access токен или refresh токен не найдены');
        }

        const decodedToken = jwtDecode(accessToken);
        const currentTime = Date.now() / 1000;

        if (decodedToken.exp < currentTime) {
            // Access токен истёк, пытаемся обновить его
            const refreshResult = await dispatch(weltApi.endpoints.refreshToken.initiate({ refresh_token: refreshToken }));
            if (refreshResult.data) {
                await dispatch(setCredentials(refreshResult.data));
                accessToken = refreshResult.data.access_token
                refreshToken = refreshResult.data.refresh_token
            }
        }

        // Загружаем профиль пользователя через API
        const response = await dispatch(weltApi.endpoints.getProfile.initiate());
        if (response.data) {
            dispatch(setCredentials({ access_token: accessToken, refresh_token: refreshToken })); // Устанавливаем токены в состояние
            dispatch(setUserProfile(response.data)); // Устанавливаем данные профиля
        }

        const savedProject = localStorage.getItem("currentProject");
        if (savedProject) {
            dispatch(setCurrentProject(JSON.parse(savedProject)));
        }

    } catch (error) {
        console.error('Ошибка при проверке сессии:', error);
        dispatch(logout()); // Выполняем выход в случае ошибки
    } finally {
        dispatch(setIsLoading(false)); // Снимаем состояние загрузки
    }
};

export default authSlice.reducer;