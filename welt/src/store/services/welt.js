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







    })
})


export const {useLoginMutation, useGetProfileQuery, useGetMyProjectsQuery,
useGetMyDialoguesQuery, useGetChatMessagesQuery, useSendMessageMutation,
useDeleteMessageMutation, useCreatePrivateChatMutation, useGetRequestsQuery,
useGetRequestByIdQuery, useGetSentRequestsQuery, useChangeRequestStatusMutation,
useGetAllUsersQuery, useDeleteUserMutation, useGetAllRolesQuery,
useDeleteRoleMutation, useGetAllProjectsQuery, useDeleteProjectMutation,
useGetAllRequestsQuery, useDeleteRequestMutation} = weltApi

export { baseQuery };