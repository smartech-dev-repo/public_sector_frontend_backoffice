<script setup>
import { useRouter } from 'vue-router';
import { onMounted } from 'vue';

const router = useRouter();

onMounted(() => {
 router.push('/login');
});
</script>

<template>
 <div>Redirecting to login...</div>
</template>
