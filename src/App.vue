<template>
	<div id="app">
		<router-view />
	</div>
</template>
<script>

</script>
<style lang="less">
html,
body {
	height: 100%;
	width: 100%;
	//  font-size: 14px;
	//  overflow: hidden
}
* {
	margin: 0;
	padding: 0;
}
p {
	margin: 5px 5px;
	font-size: 12px;
}
#app {
	font-family: "Avenir", Helvetica, Arial, sans-serif;
	-webkit-font-smoothing: antialiased;
	-moz-osx-font-smoothing: grayscale;
	text-align: left;
	color: #2c3e50;
	height: 100%;
	width: 100%;
	// overflow: hidden;
}
.van-notify {
	height: 40px;
	// line-height: 0px !important;
}
</style>
