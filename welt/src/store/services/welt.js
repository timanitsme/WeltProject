import {createApi, fetchBaseQuery} from "@reduxjs/toolkit/query/react";
import getAccessToken from "../utils/tokenUtils/getAccessToken.js";

const baseQuery = fetchBaseQuery({
    baseUrl: '/api',
    prepareHeaders: (headers) => {
        const token = getAccessToken();
        console.log(`getAccess token: ${token}`)
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
        getMyProjects: (builder.query({
            query: () => `projects/my-projects`
        })),
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
        getRequestById: (builder.query({
            query: ({requestId}) => `requests/requests/${requestId}`
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
    })
})


export const {useLoginMutation, useGetProfileQuery, useGetMyProjectsQuery,
useGetMyDialoguesQuery, useGetChatMessagesQuery, useSendMessageMutation,
useDeleteMessageMutation, useCreatePrivateChatMutation, useGetRequestsQuery,
useGetRequestByIdQuery, useGetSentRequestsQuery, useChangeRequestStatusMutation} = weltApi
export { baseQuery };