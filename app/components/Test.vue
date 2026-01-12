<template>
    <div>
        <h1 class="bg-red-500">{{ title }}</h1>
        <p>{{ message }}</p>
    </div>
</template>

<script>
export default {
    name: 'Test',
    data() {
        return {
            title: 'Welcome',
            message: 'This is a test component'
        }
    }
}
</script>

<style scoped>
div {
    padding: 20px;
}
</style>