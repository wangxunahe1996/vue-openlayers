<template>
	<div class="home">
		
		<keep-alive>
			<router-view v-if="this.$route.meta.keepAlive" />
		</keep-alive>
		<router-view v-if="!this.$route.meta.keepAlive" />
		
	</div>
</template>

<script>

export default {
	name: "home",
	components: {
		
	}
};
</script>
<style lang="less" scoped>
.home {
	height: 100%;
	width: 100%;
}
</style>
