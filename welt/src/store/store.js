import {setupListeners} from "@reduxjs/toolkit/query/react";
import {configureStore} from "@reduxjs/toolkit";
import {weltApi} from "./services/welt.js";
import {authMiddleware} from "./middleware/authMiddleware.js";
import authReducer from "./services/authSlice.js"
import {projectSyncMiddleware} from "./middleware/projectSyncMiddleware.js";

export const store = configureStore({
    reducer: {
        [weltApi.reducerPath]: weltApi.reducer,
        auth: authReducer
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware()
            .prepend(projectSyncMiddleware.middleware)
            .concat(weltApi.middleware)
            .concat(authMiddleware),
})

setupListeners(store.dispatch)