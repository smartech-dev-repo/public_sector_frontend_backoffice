import { GATEWAY_ENDPOINT, GATEWAY_ENDPOINT_WITH_AUTH } from '../axios.config';

export const auth_api = {
 login: (payload: any) => {
 return GATEWAY_ENDPOINT.post('/auth/login', payload);
 },
 
 getProfile: () => {
 return GATEWAY_ENDPOINT_WITH_AUTH.get('/auth/profile');
 },
};
