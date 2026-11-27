import { GATEWAY_ENDPOINT_WITH_AUTH } from '../axios.config';

export interface FaceMatchSettings {
 enabled: boolean;
 /** 1-100; each of the BVN and NIN photos must reach it. */
 minimumScore: number;
 updatedAt: string;
 /** Whether the server can run the comparison, e.g. "OpenCV 4.12.0" or why not. */
 engine: { available: boolean; detail: string };
}

export const faceMatchSettings_api = {
 get: () => {
  return GATEWAY_ENDPOINT_WITH_AUTH.get('/admin/face-match-settings');
 },
 update: (payload: { enabled?: boolean; minimumScore?: number }) => {
  return GATEWAY_ENDPOINT_WITH_AUTH.patch('/admin/face-match-settings', payload);
 },
};
