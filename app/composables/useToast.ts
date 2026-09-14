import { ref } from 'vue';

const toasts = ref([]);
let toastIdCounter = 0;

export const useToast = () => {
 const addToast = (message, type = 'success', duration = 3000) => {
 const id = ++toastIdCounter;
 toasts.value.push({ id, message, type });
 
 if (duration > 0) {
 setTimeout(() => {
 removeToast(id);
 }, duration);
 }
 };

 const removeToast = (id) => {
 const index = toasts.value.findIndex(t => t.id === id);
 if (index > -1) {
 toasts.value.splice(index, 1);
 }
 };

 return {
 toasts,
 addToast,
 removeToast
 };
};
