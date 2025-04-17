import getRefreshToken from "../utils/tokenUtils/getRefreshToken.js";
import {baseQuery, weltApi} from "../services/welt.js";
import {setCredentials} from "../services/authSlice.js";
import {isRejectedWithValue} from "@reduxjs/toolkit/react";
import {toast} from "react-toastify";

let isRefreshing = false;

export const authMiddleware =
    ({ dispatch }) =>
        (next) =>
            async (action) => {
                if (isRejectedWithValue(action) && action.payload?.status === 401) {
                    if (!isRefreshing) {
                        isRefreshing = true;
                        console.log("Trying to refresh")
                        try {
                            // Попытка обновить токен
                            const refreshResult = await dispatch(weltApi.endpoints.refreshToken.initiate({refresh_token: getRefreshToken()}));
                            if (refreshResult.data) {
                                console.log('Refresh successful:', refreshResult.data);
                                await dispatch(setCredentials(refreshResult.data));
                                console.log('Action:', JSON.stringify(action));
                                if (action.meta?.arg) {
                                    console.log('Action meta arg:', JSON.stringify(action.meta.arg));
                                    const { endpointName, originalArgs } = action.meta.arg;
                                    return dispatch(weltApi.endpoints[endpointName].initiate(originalArgs || {}, { forceRefetch: true }));
                                } else {
                                    console.warn('Original arguments are not available');
                                    return next(action);
                                }
                            }
                        } catch (error) {
                            toast.error("Не удалось")
                            console.error(`refresh error: ${error}`)
                            // Если обновление токена не удалось, перенаправляем на страницу входа
                            //window.location.href = '/auth';
                        } finally {
                            isRefreshing = false;
                        }
                    } else {
                        // Ждём завершения обновления токена
                        await new Promise((resolve) => setTimeout(resolve, 1000));
                        if (action.meta?.arg) {
                            console.log('Action meta arg:', JSON.stringify(action.meta.arg));
                            const { endpointName, originalArgs } = action.meta.arg;
                            return dispatch(weltApi.endpoints[endpointName].initiate(originalArgs || {}, { forceRefetch: true }));
                        } else {
                            console.warn('Original arguments are not available');
                            return next(action);
                        }
                    }
                }

                return next(action);
            };
