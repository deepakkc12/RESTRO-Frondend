import axios from "axios";
import initializeAxiosClient from "../AxiosClient";
import { data } from "autoprefixer";

const api = await initializeAxiosClient()


// export const api = axios.create({
//     baseURL: API_BASE_URL,
//     withCredentials: true,
// });


export const getRequest = async (url,data) => { 
    // console.log(data)
    try { 
        const response = await api.get(url,data); 
        // console.log('Response from GET request:', response); 
        return response.data; 
    } catch (err) { 
        console.error('Error in GET request:', err); 
        if (err.response) {
            // More detailed error logging
            console.error('Error details:', err.response.data);
            return err.response.data;
        }
        // throw { error: 'Network Error', originalError: err }; 
    } 
};


export const fileRequest = async (url,data) => { 
    // console.log(data)
    try { 
        const response = await api.get(url,data); 
        // console.log('Response from File request:', response); 
        return response; 
    } catch (err) { 
        console.error('Error in GET request:', err); 
        if (err.response) {
            // More detailed error logging
            console.error('Error details:', err.response.data);
            return err.response.data;
        }
        // throw { error: 'Network Error', originalError: err }; 
    } 
};

   export const postRequest = async (url, data) => {
       try {
           const response = await api.post(`${url}`, data,{
            // withCredentials: true,  // Ensures cookies are included\
            // headers: { 
            //     'Cookie': 'sessionid=zpbtoxxuxytuha6ydo7qj3t3yzc0pexg'
            //   }
          });
        //    console.log('Response:', {...response,});
        //    console.log('Cookies after request:', document.cookie);
           return response.data;
       } catch (err) {
           console.error('Error:', err);
           return err.response ? err.response.data : { error: 'Network Error' };
       }
   };

   
   export const patchRequest = async (url, data) => {
    try {
        const response = await api.patch(`${url}`, data,{
         // withCredentials: true,  // Ensures cookies are included\
         // headers: { 
         //     'Cookie': 'sessionid=zpbtoxxuxytuha6ydo7qj3t3yzc0pexg'
         //   }
       });
        // console.log('Response:', response);
        // console.log('Cookies after request:', document.cookie);
        return response.data;

    } catch (err) {
        console.error('Error:', err);
        
        return err.response ? err.response.data : { error: 'Network Error' };
    }
};

   export const checkCookies = () => {
       console.log('All cookies:', document.cookie);
   };