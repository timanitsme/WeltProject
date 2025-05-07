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
                        try {
                            // Попытка обновить токен
                            const refreshResult = await dispatch(weltApi.endpoints.refreshToken.initiate({refresh_token: getRefreshToken()}));
                            if (refreshResult.data) {
                                await dispatch(setCredentials(refreshResult.data));
                                if (action.meta?.arg) {
                                    const { endpointName, originalArgs } = action.meta.arg;
                                    return dispatch(weltApi.endpoints[endpointName].initiate(originalArgs || {}, { forceRefetch: true }));
                                } else {
                                    return next(action);
                                }
                            }
                        } catch (error) {
                            console.error(`Не удалось обновить токены: ${error}`)
                            //window.location.href = '/auth';
                        } finally {
                            isRefreshing = false;
                        }
                    } else {
                        // Ждём завершения обновления токена
                        await new Promise((resolve) => setTimeout(resolve, 1000));
                        if (action.meta?.arg) {
                            const { endpointName, originalArgs } = action.meta.arg;
                            return dispatch(weltApi.endpoints[endpointName].initiate(originalArgs || {}, { forceRefetch: true }));
                        } else {
                            return next(action);
                        }
                    }
                }
                return next(action);
            };
