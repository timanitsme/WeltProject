import {createListenerMiddleware, isAnyOf} from "@reduxjs/toolkit";
import {setCurrentProject} from "../services/authSlice.js";

export const projectSyncMiddleware = createListenerMiddleware();

projectSyncMiddleware.startListening({
    matcher: isAnyOf(setCurrentProject),
    effect: async (action, listenerApi) => {
        const { currentProject } = listenerApi.getState().auth;

        if (currentProject) {
            localStorage.setItem("currentProject", JSON.stringify(currentProject));
        } else {
            localStorage.removeItem("currentProject");
        }
    }
});