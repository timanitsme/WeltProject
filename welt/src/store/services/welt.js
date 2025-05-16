import {createApi, fetchBaseQuery} from "@reduxjs/toolkit/query/react";
import getAccessToken from "../utils/tokenUtils/getAccessToken.js";

const baseQuery = fetchBaseQuery({
    baseUrl: '/api',
    prepareHeaders: (headers) => {
        const token = getAccessToken();
        if (token) {
            headers.set('Authorization', `Bearer ${token}`);
        }
        return headers;
    },
})


export const weltApi = createApi({
    reducerPath: 'weltApi',
    baseQuery: baseQuery,
    endpoints: (builder) => ({
        // auth
        login: builder.mutation({
            query: ({email, password}) => {
                const params = new URLSearchParams();
                params.append("username", email);
                params.append("password", password);
                return({
                    url: 'auth/login',
                    method: 'POST',
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded",
                    },
                    body: params.toString(),
                })}
        }),
        getProfile: (builder.query({
            query: () => `auth/me`
        })),
        refreshToken: builder.mutation({
            query: ({refresh_token}) => {
                return({
                    url: 'auth/refresh',
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ refresh_token: refresh_token }),
                })
            }
        }),

        // admin
        getAllUsers: (builder.query({
            query: ({page, perPage}) => {
                return `admin/all-users?page=${page}&per_page=${perPage}`
            }
        })),
        deleteUser: builder.mutation({
            query: ({id}) => {
                return({
                    url: 'admin/delete-user',
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ id: id }),
                })
            }
        }),
        getAllRoles: (builder.query({
            query: ({page, perPage}) => {
                return `admin/all-roles?page=${page}&per_page=${perPage}`
            }
        })),
        deleteRole: builder.mutation({
            query: ({id}) => {
                return({
                    url: 'admin/delete-role',
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ id: id }),
                })
            }
        }),
        getAllProjects: (builder.query({
            query: ({page, perPage}) => {
                return `admin/all-projects?page=${page}&per_page=${perPage}`
            }
        })),
        deleteProject: builder.mutation({
            query: ({id}) => {
                return({
                    url: 'admin/delete-project',
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ id: id }),
                })
            }
        }),
        getAllRequests: (builder.query({
            query: ({page, perPage}) => {
                return `admin/all-requests?page=${page}&per_page=${perPage}`
            }
        })),
        getAllTasks: (builder.query({
            query: ({page, perPage}) => {
                return `admin/all-tasks?page=${page}&per_page=${perPage}`
            }
        })),
        getAllTaskPriorities: (builder.query({
            query: ({page, perPage}) => {
                return `admin/all-task-priorities?page=${page}&per_page=${perPage}`
            }
        })),
        getAllTaskStatuses: (builder.query({
            query: ({page, perPage}) => {
                return `admin/all-task-statuses?page=${page}&per_page=${perPage}`
            }
        })),
        deleteRequest: builder.mutation({
            query: ({id}) => {
                return({
                    url: 'admin/delete-request',
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ id: id }),
                })
            }
        }),
        deleteTask: builder.mutation({
            query: ({id}) => {
                return({
                    url: 'admin/delete-task',
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ id: id }),
                })
            }
        }),
        createProject: builder.mutation({
            query: ({ title, icon }) => {
                const formData = new FormData();
                formData.append('title', title);

                if (icon) {
                    formData.append('icon', icon);
                }

                return {
                    url: 'admin/create-project',
                    method: 'POST',
                    body: formData,
                };
            },
        }),
        createUser: builder.mutation({
            query: ({ first_name, last_name, email, password, role_id, avatar }) => {
                const formData = new FormData();
                formData.append('first_name', first_name);
                formData.append('last_name', last_name);
                formData.append('email', email);
                formData.append('password', password);
                formData.append('role_id', role_id);
                if (avatar) {
                    formData.append('avatar', avatar);
                }

                return {
                    url: 'auth/signup',
                    method: 'POST',
                    body: formData,
                };
            },
        }),
        createRole: (builder.mutation({
            query: ({title}) => {
                return({
                    url: `admin/create-role`,
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ title }),
                })
            }
        })),
        createTask: (builder.mutation({
            query: ({title, description, project_id, status_id, priority_id, deadline, assignee_ids}) => {
                return({
                    url: `admin/create-task`,
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ title, description, project_id, status_id, priority_id, deadline, assignee_ids }),
                })
            }
        })),

        // chats
        getMyDialogues: (builder.query({
            query: (params = {}) => {
                const { searchQuery } = params;
                if (searchQuery) {
                    return `chats/my-chats?search_query=${searchQuery}`;
                } else {
                    return `chats/my-chats`;
                }
            }
        })),
        createPrivateChat: (builder.mutation({
            query: ({userId}) => {
                return({
                    url: `chats/create-private-chat`,
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ user_id: userId}),
                })
            }
        })),
        getChatMessages: (builder.query({
            query: ({chatId}) => `chats/chat-messages/${chatId}`
        })),

        sendMessage: (builder.mutation({
            query: ({chatId, text}) => {
                return({
                    url: `chats/send-message`,
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ chat_id: chatId, text: text}),
                })
            }
        })),
        deleteMessage: (builder.mutation({
            query: ({messageId}) => {
                return({
                    url: `chats/delete-message`,
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ id: messageId}),
                })
            }
        })),

        // projects
        getMyProjects: (builder.query({
            query: () => `projects/my-projects`
        })),


        // requests
        getRequests: (builder.query({
            query: (params = {}) => {
                const { status } = params;
                if (status) {
                    return `requests/requests?status_title=${status}`;
                } else {
                    return `requests/requests`;
                }
            }
        })),
        getSentRequests: (builder.query({
            query: () => `requests/sent-requests`
        })),
        getRequestById: (builder.query({
            query: ({requestId}) => `requests/requests/${requestId}`
        })),
        changeRequestStatus: (builder.mutation({
            query: ({requestId, newStatusTitle}) => {
                return({
                    url: `requests/requests/${requestId}/status?new_status_title=${newStatusTitle}`,
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                })
            }
        })),

        // users


        //tasks
        getTasksByProject: (builder.query({
            query: ({projectId}) => `tasks/project/${projectId}`
        })),




    })
})


export const {useLoginMutation, useGetProfileQuery, useGetMyProjectsQuery,
useGetMyDialoguesQuery, useGetChatMessagesQuery, useSendMessageMutation,
useDeleteMessageMutation, useCreatePrivateChatMutation, useGetRequestsQuery,
useGetRequestByIdQuery, useGetSentRequestsQuery, useChangeRequestStatusMutation,
useGetAllUsersQuery, useDeleteUserMutation, useGetAllRolesQuery,
useDeleteRoleMutation, useGetAllProjectsQuery, useDeleteProjectMutation,
useGetAllRequestsQuery, useDeleteRequestMutation, useCreateProjectMutation,
useCreateRoleMutation, useGetAllTasksQuery, useDeleteTaskMutation,
useCreateUserMutation, useCreateTaskMutation, useGetAllTaskPrioritiesQuery,
useGetAllTaskStatusesQuery, useGetTasksByProjectQuery} = weltApi

export { baseQuery };