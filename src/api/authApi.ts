import { APIStatus } from "../types";
import axios from 'axios';

interface Credentials {
    username: string;
    password: string;
}

export const AuthApi = {
    login: async ({ username, password }: Credentials): Promise<APIStatus> => {
        try {
             // Make a request to the server to login
             //const response = await axios.post('http://localhost:3000/api/login', { username, password },{ withCredentials: true });
             const response = await axios.post('https://final-project-gateway.onrender.com/api/login', { username, password },{ withCredentials: true });
             if (response.status === 200) {
                 return APIStatus.Success;
             } else {
                 return handleError(response.status);
             }
        } catch (e) {
            return handleError(e);
        }
    },
    signUp: async ({ username, password }: Credentials): Promise<APIStatus> => {
        try {
            // Make a request to the server to sign up
            //const response = await axios.post('http://localhost:3000/api/signup', { username, password },{ withCredentials: true });
            const response = await axios.post('https://final-project-gateway.onrender.com/api/signup', { username, password },{ withCredentials: true });
            if (response.status === 201) {
                return APIStatus.Success;
            } else {
                return handleError(response.status);
            }
        } catch (e) {
            return handleError(e);
        }
    },
    logout: async (): Promise<APIStatus> => {
        try {
            // Make a request to the server to logout
            //const response = await axios.post('http://localhost:3000/api/logout',null,{ withCredentials: true });
            const response = await axios.post('https://final-project-gateway.onrender.com/api/logout',null,{ withCredentials: true });
            if (response.status === 200) {
                return APIStatus.Success;
            } else {
                return handleError(response.status);
            }
        } catch (e) {
            return handleError(e);
        }
    },
    getUserName: async (): Promise<string | APIStatus> => {
        try {
            // Make a request to the server to get the username
            // const response = await axios.get('http://localhost:3000/api/username',{ withCredentials: true });
            const response = await axios.get('https://final-project-gateway.onrender.com/api/username',{ withCredentials: true });
            if (response.status === 200) {
                return response.data.username;
            } else {
                return handleError(response.status);
            }
        } catch (e) {
            return handleError(e);
        }
    },
    getAvailableEvents: async (limit:number = 50,skip:number = 0): Promise<any | APIStatus> => {
        try {
            // Make a request to the server to get the available events
            // const response = await axios.get(`http://localhost:3000/api/event/available?limit=${limit}&skip=${skip}`,{ withCredentials: true });
            const response = await axios.get(`https://final-project-gateway.onrender.com/api/event/available?limit=${limit}&skip=${skip}`,{ withCredentials: true });
            if (response.status === 200) {
                return response;
            } else {
                return handleError(response.status);
            }
        } catch (e) {
            return handleError(e);
        }
    },
    getEventTicketsAmount: async (eventID: string): Promise<any | APIStatus> => {
        try {
            // Make a request to the server to get the available events
            // const response = await axios.get(`http://localhost:3000/api/event/tickets/amount/${eventID}`,{ withCredentials: true });
            const response = await axios.get(`https://final-project-gateway.onrender.com/api/event/tickets/amount/${eventID}`,{ withCredentials: true });
            if (response.status === 200) {
                return response;
            } else {
                return handleError(response.status);
            }
        } catch (e) {
            return handleError(e);
        }
    },
    getEventLowestTicketPrice: async (eventID: string): Promise<any | APIStatus> => {
        try {
            // Make a request to the server to get the lowest ticket price for the event
            // const response = await axios.get(`http://localhost:3000/api/event/tickets/price/${eventID}`,{ withCredentials: true });
            const response = await axios.get(`https://final-project-gateway.onrender.com/api/event/tickets/price/${eventID}`,{ withCredentials: true });
            if (response.status === 200) {
                return response;
            } else {
                return handleError(response.status);
            }
        } catch (e) {
            return handleError(e);
        }
    },
    getNextEvent: async (username: string): Promise<any | APIStatus> => {
        try {
            // Make a request to the server to get the next upcoming event for the user
            // const user = await axios.get(`http://localhost:3000/api/user/${username}`,{ withCredentials: true });
            // const orders = await axios.get(`http://localhost:3000/api/user/orders/${user.data._id}`,{ withCredentials: true });
            // const eventIDs = orders.data.map((order:any) => {
            //     return order.eventID;
            // });
            // if(eventIDs.length == 0){
            //     return '';
            // }
            // const response = await axios.post('http://localhost:3000/api/event/date', {eventIDs: eventIDs} , {withCredentials: true} );
            const user = await axios.get(`https://final-project-gateway.onrender.com/api/user/${username}`,{ withCredentials: true });
            const orders = await axios.get(`https://final-project-gateway.onrender.com/api/user/orders/${user.data._id}`,{ withCredentials: true });
            const eventIDs = orders.data.map((order:any) => {
                return order.eventID;
            });
            if(eventIDs.length == 0){
                return '';
            }
            const response = await axios.post('https://final-project-gateway.onrender.com/api/event/date', {eventIDs: eventIDs} , {withCredentials: true} );
            if (response.status === 200) {
                return response.data;
            } else {
                return handleError(response.status);
            }
        } catch (e) {
            return handleError(e);
        }
    },
    getEvent: async (eventID: string): Promise<any | APIStatus> => {
        try {
            // const response = await axios.get(`http://localhost:3000/api/event/${eventID}`,{ withCredentials: true });
            const response = await axios.get(`https://final-project-gateway.onrender.com/api/event/${eventID}`,{ withCredentials: true });
            if (response.status === 200) {
                return response;
            } else {
                return handleError(response.status);
            }
        } catch (e) {
            return handleError(e);
        }
    },
    getComments: async (id:string,limit:number = 50,skip:number = 0): Promise<any | APIStatus> => {
        try {
            // const response = await axios.get(`http://localhost:3000/api/event/comments/${id}?limit=${limit}&skip=${skip}`,{ withCredentials: true });
            const response = await axios.get(`https://final-project-gateway.onrender.com/api/event/comments/${id}?limit=${limit}&skip=${skip}`,{ withCredentials: true });
            if (response.status === 200) {
                return response;
            } else {
                return handleError(response.status);
            }
        } catch (e) {
            return handleError(e);
        }
    },
    postComment: async (id:string, comment:string, username:string): Promise<any | APIStatus> => {
        try {
            // const response = await axios.post(`http://localhost:3000/api/event/comments/${id}`,{username: username, content: comment},{ withCredentials: true });
            const response = await axios.post(`https://final-project-gateway.onrender.com/api/event/comments/${id}`,{username: username, content: comment},{ withCredentials: true });
            if (response.status === 201) {
                return response;
            } else {
                return handleError(response.status);
            }
        } catch (e) {
            return handleError(e);
        }
    },
    updateTicketsAmount: async (id:string, amount:number, ticketType:string): Promise<any | APIStatus> => {
        try {
            // const response = await axios.put(`http://localhost:3000/api/event/tickets/${id}`,{amount: amount, ticketType: ticketType},{ withCredentials: true });
            const response = await axios.put(`https://final-project-gateway.onrender.com/api/event/tickets/${id}`,{amount: amount, ticketType: ticketType},{ withCredentials: true });
            if (response.status === 200) {
                return response;
            } else {
                return handleError(response.status);
            }
        } catch (e) {
            return handleError(e);
        }
    }, 
    createPayment: async (cc:string, holder:string, cvv:string, exp:string, charge:number): Promise<any | APIStatus> => {
        try {

            // const response = await axios.post('http://localhost:3000/_functions/pay',{cc: cc, holder: holder, cvv: cvv, exp: exp, charge: charge},{ withCredentials: true });
            const response = await axios.post('https://final-project-gateway.onrender.com/_functions/pay',{cc: cc, holder: holder, cvv: cvv, exp: exp, charge: charge},{ withCredentials: true });
            if (response.status === 200) {
                return response;
            } else {
                return handleError(response.status);
            }
        } catch (e) {
            return handleError(e);
        }
    },
    refundPayment: async (orderId:string): Promise<any | APIStatus> => {
        try {
            // const response = await axios.post('http://localhost:3000/_functions/refund',{orderId: orderId},{ withCredentials: true });
            const response = await axios.post('https://final-project-gateway.onrender.com/_functions/refund',{orderId: orderId},{ withCredentials: true });
            if (response.status === 200) {
                return response;
            } else {
                return handleError(response.status);
            }
        } catch (e) {
            return handleError(e);
        }
    },
    createOrder: async (username:string, orderId:string, eventId:string, ticketType:string, ticketQuantity: number,start_date:Date): Promise<any | APIStatus> => {
        try {
            
            // const user = await axios.get(`http://localhost:3000/api/user/${username}`,{ withCredentials: true });
            // const response = await axios.post(`http://localhost:3000/api/user/orders/${user.data._id}`,{orderID:orderId, eventID:eventId, ticketType:ticketType, ticketQuantity:ticketQuantity,start_date:start_date},{ withCredentials: true });
            const user = await axios.get(`https://final-project-gateway.onrender.com/api/user/${username}`,{ withCredentials: true });
            const response = await axios.post(`https://final-project-gateway.onrender.com/api/user/orders/${user.data._id}`,{orderID:orderId, eventID:eventId, ticketType:ticketType, ticketQuantity:ticketQuantity,start_date:start_date},{ withCredentials: true });
            if (response.status === 201) {
                return response;
            } else {
                return handleError(response.status);
            }
        } catch (e) {
            return handleError(e);
        }
    },
    getOrders: async (username:string,limit:number = 50,skip:number = 0): Promise<any | APIStatus> => {
        try {
            // const user = await axios.get(`http://localhost:3000/api/user/${username}`,{ withCredentials: true });
            // const response = await axios.get(`http://localhost:3000/api/user/orders/${user.data._id}?limit=${limit}&skip=${skip}`,{ withCredentials: true });
            const user = await axios.get(`https://final-project-gateway.onrender.com/api/user/${username}`,{ withCredentials: true });
            const response = await axios.get(`https://final-project-gateway.onrender.com/api/user/orders/${user.data._id}?limit=${limit}&skip=${skip}`,{ withCredentials: true });
            if (response.status === 200) {
                return response;
            } else {
                return handleError(response.status);
            }
        } catch (e) {
            return handleError(e);
        }
    },
    deleteOrder: async (username:string,orderID:string): Promise<any | APIStatus> => {
        try {
            // const user = await axios.get(`http://localhost:3000/api/user/${username}`,{ withCredentials: true });
            // const response = await axios.delete(`http://localhost:3000/api/user/orders/${user.data._id}`,{data:{orderID: orderID}, withCredentials: true });
            const user = await axios.get(`https://final-project-gateway.onrender.com/api/user/${username}`,{ withCredentials: true });
            const response = await axios.delete(`https://final-project-gateway.onrender.com/api/user/orders/${user.data._id}`,{data:{orderID: orderID}, withCredentials: true });
            if (response.status === 204) {
                return response;
            } else {
                return handleError(response.status);
            }
        } catch (e) {
            return handleError(e);
        }
    },
    getUserPermission: async (username:string): Promise<any | APIStatus> => {
        try {
            // const user = await axios.get(`http://localhost:3000/api/user/${username}`,{ withCredentials: true });
            const user = await axios.get(`https://final-project-gateway.onrender.com/api/user/${username}`,{ withCredentials: true });
            if (user.status === 200) {
                return user.data.permission;
            } else {
                return handleError(user.status);
            }
        } catch (e) {
            return handleError(e);
        }
    },
    getEvents: async (limit:number = 50,skip:number = 0): Promise<any | APIStatus> => {
        try {
            // const response = await axios.get(`http://localhost:3000/api/event?limit=${limit}&skip=${skip}`,{ withCredentials: true });
            const response = await axios.get(`https://final-project-gateway.onrender.com/api/event?limit=${limit}&skip=${skip}`,{ withCredentials: true });
            if (response.status === 200) {
                return response;
            } else {
                return handleError(response.status);
            }
        } catch (e) {
            return handleError(e);
        }
    },
    getCommentsAmount: async (id:string): Promise<any | APIStatus> => {
        try {
            // const response = await axios.get(`http://localhost:3000/api/event/comments/amount/${id}`,{ withCredentials: true });
            const response = await axios.get(`https://final-project-gateway.onrender.com/api/event/comments/amount/${id}`,{ withCredentials: true });
            if (response.status === 200) {
                return response;
            } else {
                return handleError(response.status);
            }
        } catch (e) {
            return handleError(e);
        }
    },
    updateEventDate: async (id:string,start_date: Date, end_date: Date): Promise<any | APIStatus> => {
        try {
            // const response = await axios.put(`http://localhost:3000/api/event/${id}`,{start_date: start_date, end_date: end_date},{ withCredentials: true });
            const response = await axios.put(`https://final-project-gateway.onrender.com/api/event/${id}`,{start_date: start_date, end_date: end_date},{ withCredentials: true });
            console.log(response);
            if (response.status === 200) {
                return response;
            } else {
                return handleError(response.status);
            }
        } catch (e) {
            return handleError(e);
        }
    },
    createEvent: async (title:string,category:string,description:string,organizer:string,location:string,start_date:Date,end_date:Date,tickets:any,image:string): Promise<any | APIStatus> => {
        try {
            // let response;
            // if(image && image != ''){
            //     response = await axios.post(`http://localhost:3000/api/event`,{title:title,category:category,description:description,organizer:organizer,
            //     location:location,image:image,tickets:tickets,start_date: start_date, end_date: end_date},{ withCredentials: true });
            // }else{
            //     response = await axios.post(`http://localhost:3000/api/event`,{title:title,category:category,description:description,organizer:organizer,
            //     location:location,tickets:tickets,start_date: start_date, end_date: end_date},{ withCredentials: true });
            // }
            let response;
            if(image && image != ''){
                response = await axios.post(`https://final-project-gateway.onrender.com/api/event`,{title:title,category:category,description:description,organizer:organizer,
                location:location,image:image,tickets:tickets,start_date: start_date, end_date: end_date},{ withCredentials: true });
            }else{
                response = await axios.post(`https://final-project-gateway.onrender.com/api/event`,{title:title,category:category,description:description,organizer:organizer,
                location:location,tickets:tickets,start_date: start_date, end_date: end_date},{ withCredentials: true });
            }
           
            if (response.status === 201) {
                return response;
            } else {
                return handleError(response.status);
            }
        } catch (e) {
            return handleError(e);
        }
    }, 
};

const handleError = async (e: unknown | number): Promise<APIStatus> => {
    
    // Handle errors based on status code
    switch (e) {
        case 400:
            return APIStatus.BadRequest;
        case 401:
            return APIStatus.Unauthorized;
        case 404:
            return APIStatus.NotFound;
        default:
            return APIStatus.ServerError;
    }
};