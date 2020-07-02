<template>
	<div class="map">
		<div id="mapName"></div>
		<div class="btnGroup">
			<RadioGroup v-model="buttonSize" type="button" @on-change="changeMap">
				<Radio label="satellite">卫星地图</Radio>
				<Radio label="map2d">二维底图</Radio>
			</RadioGroup>
		</div>
		<div class="toolBtn">
			<Button @click="addVectorLayer('标注',pointData)">标注</Button><br>
			<Button @click="plottingFun('Polygon')">绘制面</Button>
			<Button @click="plottingFun('Point')">绘制点</Button>
			<Button @click="plottingFun('LineString')">绘制线</Button>
			<Button @click="plottingFun('Box')">绘制矩形</Button>
			<Button @click="plottingFun('Text')">文字标记</Button><br>
			<Button @click="spaceMeasureFun('LineString')">测距</Button>
			<Button @click="spaceMeasureFun('Polygon')">测面</Button>
			<Button @click="spaceMeasureFun('Point')">测点</Button><br>
			<Button @click="addWMSLayer()">添加栅格数据图层</Button><br>
			<!-- <Button @click="">测距</Button> -->
			<Button @click="clearAll">清除</Button>
		</div>
	</div>
</template>
<script>
let map, satellite, map2D, imgWms;
import { Map, View } from "ol";
import "ol/ol.css";
import TileLayer from "ol/layer/Tile";
import { Group as LayerGroup } from "ol/layer";
import TileWMS from "ol/source/TileWMS";
import ImageWMS from "ol/source/ImageWMS";
import { getWidth, getTopLeft } from "ol/extent";
import WMTS from "ol/source/WMTS";
import WMTSTileGrid from "ol/tilegrid/WMTS";
import { defaults as defaultControls, ScaleLine } from "ol/control";
import { get as getProjection } from "ol/proj";
import { Draw, Modify, Snap, defaults } from "ol/interaction";
import OlSourceVector from "ol/source/Vector";
import OlGeomPoint from "ol/geom/Point";
import OlLayerVector from "ol/layer/Vector";
import OlStyleStyle from "ol/style/Style";
import OlStyleIcon from "ol/style/Icon";
import OlStyleText from "ol/style/Text";
import OlStyleFill from "ol/style/Fill";
import OlStyleStroke from "ol/style/Stroke";
import OlStyleCircle from "ol/style/Circle";
import OlFeature from "ol/Feature";
import OlOverlay from "ol/Overlay";
import { easeIn, easeOut } from "ol/easing";
import { getArea, getLength } from "ol/sphere.js";
import { LineString, Polygon } from "ol/geom";
import OlHeatmapLayer from "ol/layer/Heatmap";
import GeoJSON from "ol/format/GeoJSON";
import { Cluster } from "ol/source";
import { createBox } from "ol/interaction/Draw";
import ImageLayer from "ol/layer/Image";
export default {
	name: "app-map1",
	data() {
		return {
			borderUrl: "",
			td2_satellite: `http://t${Math.round(
				Math.random() * 7
			)}.tianditu.gov.cn/img_c/wmts?&tk=f2271d8cba86805bab5b7c703aebcec4`,
			td1_satellite: `http://t${Math.round(
				Math.random() * 7
			)}.tianditu.gov.cn/cia_c/wmts?&tk=f2271d8cba86805bab5b7c703aebcec4`,
			td1_2d: `http://t${Math.round(
				Math.random() * 7
			)}.tianditu.gov.cn/vec_c/wmts?&tk=f2271d8cba86805bab5b7c703aebcec4`,
			td2_2d: `http://t${Math.round(
				Math.random() * 7
			)}.tianditu.gov.cn/cva_c/wmts?&tk=f2271d8cba86805bab5b7c703aebcec4`,
			buttonSize: "satellite",
			pointData: [
				//标注数据
				{
					x: 120.09165129101564,
					y: 30.633679947021484,
					address: "洛舍中心学校"
				},
				{
					x: 120.01989683544923,
					y: 30.67582281506348,
					address: "管泽"
				}
			],
			// 标绘
			plottingOption: {
				textVector: null,
				layer: null,
				sketch: null,
				draw: null,
				listener: null
			},
			measureOption: {
				//空间测量
				layer: null,
				sketch: null,
				helpTooltipElement: null,
				helpTooltip: null,
				measureTooltipElement: null,
				measureTooltip: null,
				continuePolygonMsg: "",
				continueLineMsg: "",
				helpMsg: "",
				draw: null,
				listener: null,
				popupcloser: null
			},
			inputValue: ""
		};
	},
	computed: {},
	mounted() {
		this.initMap();
	},
	watch: {},

	methods: {
		//地图单击事件
		singleClickFun() {
			map.on("singleclick", event => {
				console.log(event);
			});
		},
		//初始化地图
		initMap() {
			let projection = getProjection("EPSG:4326");
			let projectionExtent = projection.getExtent();
			let size = getWidth(projectionExtent) / 256;
			let resolutions = new Array(18);
			let matrixIds = new Array(18);
			for (let z = 1; z < 19; ++z) {
				resolutions[z] = size / Math.pow(2, z);
				matrixIds[z] = z;
			}
			let tian_di_tu_satellite_layer = new TileLayer({
				source: new WMTS({
					url: this.td2_satellite,
					layer: "img",
					matrixSet: "EPSG:4326",
					format: "tiles",
					style: "default",
					projection: projection,
					matrixSet: "c",
					version: "1.0.0",
					tileGrid: new WMTSTileGrid({
						origin: getTopLeft(projectionExtent),
						resolutions: resolutions,
						matrixIds: matrixIds
					}),
					wrapX: true
				})
			}); //卫星图层
			let tian_di_tu_satellite_annotation = new TileLayer({
				source: new WMTS({
					url: this.td1_satellite,
					layer: "cia",
					matrixSet: "EPSG:4326",
					format: "tiles",
					style: "default",
					projection: projection,
					matrixSet: "c",
					version: "1.0.0",
					tileGrid: new WMTSTileGrid({
						origin: getTopLeft(projectionExtent),
						resolutions: resolutions,
						matrixIds: matrixIds
					}),
					wrapX: true
				})
			}); //卫星标注
			let tian_di_tu_2D_layer = new TileLayer({
				source: new WMTS({
					url: this.td1_2d,
					layer: "vec",
					matrixSet: "EPSG:4326",
					format: "tiles",
					style: "default",
					projection: projection,
					matrixSet: "c",
					version: "1.0.0",
					tileGrid: new WMTSTileGrid({
						origin: getTopLeft(projectionExtent),
						resolutions: resolutions,
						matrixIds: matrixIds
					}),
					wrapX: true
				})
			});
			let tian_di_tu_2D_annotation = new TileLayer({
				source: new WMTS({
					url: this.td2_2d,
					layer: "cva",
					matrixSet: "EPSG:4326",
					format: "tiles",
					style: "default",
					projection: projection,
					matrixSet: "c",
					version: "1.0.0",
					tileGrid: new WMTSTileGrid({
						origin: getTopLeft(projectionExtent),
						resolutions: resolutions,
						matrixIds: matrixIds
					}),
					wrapX: true
				})
			});
			map = new Map({
				target: "mapName",
				view: new View({
					projection: projection,
					center: [120.090278, 30.642778],
					zoom: 13
				}),
				interactions: defaults({
					doubleClickZoom: false // 取消双击放大功能交互
				})
			});
			satellite = new LayerGroup({
				layers: [
					tian_di_tu_satellite_layer,
					tian_di_tu_satellite_annotation
				]
			});
			map.addLayer(satellite);
			map2D = new LayerGroup({
				layers: [tian_di_tu_2D_layer, tian_di_tu_2D_annotation]
			});
			this.singleClickFun();
		},
		//添加栅格数据图层
		addWMSLayer() {
			if (imgWms) {
				map.removeLayer(imgWms);
			}
			imgWms = new ImageLayer({
				title: "栅格图层",
				// opactiy:'0.1',
				source: new ImageWMS({
					url: "http://192.168.140.117:8080/geoserver/cite/wms",
					params: {
						LAYERS: "cite:luoshe9yue",
						FORMAT: "image/jpeg",
						REQUEST: "GetMap",
						VERSION: "1.1.1",
						SERVICE: "WMS",
						SRS: "EPSG:4326",
						WIDTH:"768",
						HEIGHT:"650",
						TRANSPARENT: "true",
						exceptions: "application/vnd.ogc.se_inimage"
					}
				})
			});
			map.addLayer(imgWms);
		},
		//切换底图
		changeMap(name) {
			if (name == "satellite") {
				if (map2D) {
					map.removeLayer(map2D);
				}
				map.addLayer(satellite);
			} else if (name == "map2d") {
				if (satellite) {
					map.removeLayer(satellite);
				}
				map.addLayer(map2D);
			}
		},
		//设置文字标注样式
		setSymbolStyle(text) {
			let Styles = [];
			Styles.push(
				new OlStyleStyle({
					//设置图标
					image: new OlStyleIcon({
						src: require("../assets/ico.png"),
						anthor: [0.5, 1],
						scale: 1
					}),
					//设置图片下边文字的样式
					text: new OlStyleText({
						font: "14px",
						maxAngle: 30,
						offsetX: 0,
						offsetY: 30,
						text: text, //文字内容
						fill: new OlStyleFill({
							// 字体颜色
							color: "#000"
						}),
						stroke: new OlStyleStroke({
							// 文字描边
							color: "#fff",
							width: 5
						})
					})
				})
			);
			return Styles;
		},
		//添加自定义矢量标注
		addVectorLayer(name, data) {
			let vectorLayer = new OlLayerVector({
				source: new OlSourceVector(),
				zIndex: 13,
				name: name
			});
			map.addLayer(vectorLayer);
			let features = [];
			for (let i = 0; i < data.length; i++) {
				let feature = new OlFeature({
					geometry: new OlGeomPoint([data[i].x, data[i].y])
				});
				feature.setStyle(this.setSymbolStyle(data[i].address));
				features.push(feature);
			}
			vectorLayer.getSource().addFeatures(features);
		},
		//标绘
		plottingFun(type) {
			this.addPoltInteractionFun(type);
		},
		//标绘方法
		addPoltInteractionFun(type) {
			map.removeInteraction(this.plottingOption.draw); // 防止多次点击添加多个图层

			let source = new OlSourceVector();
			let style = null;
			let _type = type;
			let geometryFunction = null;
			if (type == "Box") {
				geometryFunction = createBox();
			} else {
				geometryFunction = null;
			}
			if (type != "Text" && type != "Box") {
				_type = type;
			} else if (type == "Text") {
				_type = "Point";
			} else if (type == "Box") {
				_type = "Circle";
			}
			//绘制时的样式
			this.plottingOption.draw = new Draw({
				source: source,
				type: _type,
				style: new OlStyleStyle({
					fill: new OlStyleFill({
						color: "rgba(255,255,255,.5)"
					}),
					stroke: new OlStyleStroke({
						color: "yellow",
						lineDash: [10, 10],
						width: 2
					}),
					image: new OlStyleCircle({
						radius: 5,
						stroke: new OlStyleStroke({
							color: "yellow"
						}),
						fill: new OlStyleFill({
							color: "red"
						})
					})
				}),
				geometryFunction: geometryFunction
			});
			map.addInteraction(this.plottingOption.draw);
			//监听绘制开始
			this.plottingOption.draw.on("drawstart", evt => {
				if (type === "Text") {
					this.$Modal.confirm({
						render: h => {
							return h("Input", {
								props: {
									value: this.inputValue,
									placeholder: "请输入文字"
								},
								on: {
									input: val => {
										this.plottingOption.textVector = new OlLayerVector(
											{
												source: source,
												style: new OlStyleStyle({
													text: new OlStyleText({
														font: "14px sans-serif",
														maxAngle: 30,
														offsetx: 10,
														offsetY: 10,
														text: val,
														fill: new OlStyleFill({
															color: "#000"
														}),
														stroke: new OlStyleStroke(
															{
																color: "#fff",
																width: 5
															}
														)
													})
												}),
												zIndex: 9,
												name: "标绘"
											}
										);
										map.addLayer(
											this.plottingOption.textVector
										);
										map.removeInteraction(
											this.plottingOption.draw
										);
									}
								}
							});
						}
					});
				} else {
					this.plottingOption.sketch = evt.feature;
					let plottingLayer = new OlLayerVector({
						source: source,
						style: new OlStyleStyle({
							fill: new OlStyleFill({
								color: "rgba(255,255,255,.5)"
							}),
							stroke: new OlStyleStroke({
								color: "yellow",
								lineDash: [10, 10],
								width: 2
							}),
							image: new OlStyleCircle({
								radius: 5,
								stroke: new OlStyleStroke({
									color: "yellow"
								}),
								fill: new OlStyleFill({
									color: "red"
								})
							})
						}),
						zIndex: 9,
						name: "标绘"
					});
					map.addLayer(plottingLayer);
				}
			});
			this.plottingOption.draw.on("drawend", evt => {
				map.removeInteraction(this.plottingOption.draw);
			});
		},
		// 添加测量标注
		createMeasureTooltip() {
			if (this.measureOption.measureTooltipElement) {
				this.measureOption.measureTooltipElement.parentNode.removeChild(
					this.measureOption.measureTooltipElement
				);
			}
			this.measureOption.measureTooltipElement = document.createElement(
				"div"
			);
			this.measureOption.measureTooltipElement.className =
				"ol-tooltip ol-tooltip-measure";
			this.measureOption.measureTooltip = new OlOverlay({
				id: "空间测量",
				element: this.measureOption.measureTooltipElement,
				offset: [0, -15],
				positioning: "bottom-center"
			});
			map.addOverlay(this.measureOption.measureTooltip);
		},
		//添加测量标注
		createHelpTooltip() {
			if (this.measureOption.helpTooltipElement) {
				this.measureOption.helpTooltipElement.parentNode.removeChild(
					this.measureOption.helpTooltipElement
				);
			}
			this.measureOption.helpTooltipElement = document.createElement(
				"div"
			);
			this.measureOption.helpTooltipElement.className =
				"ol-tooltip hidden";
			this.measureOption.helpTooltip = new OlOverlay({
				id: "空间测量",
				element: this.measureOption.helpTooltipElement,
				offset: [15, 0],
				positioning: "center-left"
			});
		},
		// 格式化距离
		formatLength(line) {
			let sourceProj = map.getView().getProjection(); // 获取投影坐标系
			let length = getLength(line, {
				projection: sourceProj
			});
			let output;
			if (length > 100) {
				output = Math.round((length / 1000) * 100) / 100 + " " + "km";
			} else {
				output = Math.round(length * 100) / 100 + " " + "m";
			}
			return output;
		},
		// 格式化面积
		formatArea(polygon) {
			let sourceProj = map.getView().getProjection(); // 获取投影坐标系
			let area = getArea(polygon, {
				projection: sourceProj
			});
			let output;
			if (area > 10000) {
				output =
					Math.round((area / 1000000) * 100) / 100 +
					" " +
					"km<sup>2</sup>";
			} else {
				output = Math.round(area * 100) / 100 + " " + "m<sup>2</sup>";
			}
			return output;
		},
		// 设置提示信息
		pointerMoveHandler(evt) {
			if (evt.dragging) {
				return;
			}
			if (this.measureOption.sketch) {
				let geom = this.measureOption.sketch.getGeometry();
				if (geom instanceof Polygon) {
					this.measureOption.helpMsg = this.measureOption.continuePolygonMsg;
				} else if (geom instanceof LineString) {
					this.measureOption.helpMsg = this.measureOption.continueLineMsg;
				}
			}
			this.measureOption.helpTooltipElement.innerHTML = this.measureOption.helpMsg;
			this.measureOption.helpTooltip.setPosition(evt.coordinate);
			this.measureOption.helpTooltipElement.classList.remove("hidden");
		},
		//空间测量
		spaceMeasureFun(measureType) {
			map.on("pointermove", this.pointerMoveHandler);
			map.getViewport().addEventListener("mouseout", () => {
				this.measureOption.helpTooltipElement.classList.add("hidden");
			});
			this.addInteractionFun(measureType);
		},
		//空间测量方法
		addInteractionFun(measureType) {
			map.removeInteraction(this.measureOption.draw); // 防止多次点击添加多个图层
			let source = new OlSourceVector();
			// 绘制时的样式
			this.measureOption.draw = new Draw({
				source: source,
				type: measureType,
				style: new OlStyleStyle({
					fill: new OlStyleFill({
						color: "rgba(255,255,255,.5)"
					}),
					stroke: new OlStyleStroke({
						color: "blue",
						lineDash: [10, 10],
						width: 2
					}),
					image: new OlStyleCircle({
						radius: 5,
						stroke: new OlStyleStroke({
							color: "yellow"
						}),
						fill: new OlStyleFill({
							color: "red"
						})
					})
				})
			});
			map.addInteraction(this.measureOption.draw);
			this.measureOption.draw.on("drawstart", evt => {
				this.measureOption.sketch = evt.feature;
				let type = this.measureOption.sketch.getGeometry();
				if (type instanceof OlGeomPoint) {
					// 如果是绘制点
					let pointCoordinates = this.measureOption.sketch.getGeometry()
						.flatCoordinates;
					this.measureOption.measureTooltipElement.innerHTML = pointCoordinates;
					this.measureOption.measureTooltip.setPosition(
						pointCoordinates
					);
				} else {
					// 如果是绘制线和面
					let tooltipCoord = evt.coordinate;
					this.measureOption.listener = this.measureOption.sketch
						.getGeometry()
						.on("change", evt => {
							let geom = evt.target;
							let output;
							if (geom instanceof Polygon) {
								output = this.formatArea(geom);
								tooltipCoord = geom
									.getInteriorPoint()
									.getCoordinates();
							} else if (geom instanceof LineString) {
								output = this.formatLength(geom);
								tooltipCoord = geom.getLastCoordinate();
							}
							this.measureOption.measureTooltipElement.innerHTML = output;
							this.measureOption.measureTooltip.setPosition(
								tooltipCoord
							);
						});
				}
			});

			this.measureOption.draw.on("drawend", () => {
				this.measureOption.measureTooltipElement.appendChild(
					this.measureOption.popupcloser
				);
				this.measureOption.measureTooltipElement.className =
					"ol-tooltip ol-tooltip-static";
				this.measureOption.measureTooltip.setOffset([0, -7]);
				this.measureOption.sketch = null;
				this.measureOption.measureTooltipElement = null;
				this.createMeasureTooltip();
				map.un("pointermove", this.pointerMoveHandler);
				map.removeInteraction(this.measureOption.draw);
				this.measureOption.helpTooltipElement.classList.add("hidden");
			});
			// 将画好的 VectorLayer 图层添加到 map 中
			let measureLayer = new OlLayerVector({
				source: source,
				style: new OlStyleStyle({
					fill: new OlStyleFill({
						color: "rgba(255,255,255,.5)"
					}),
					stroke: new OlStyleStroke({
						color: "blue",
						lineDash: [10, 10],
						width: 2
					}),
					image: new OlStyleCircle({
						radius: 5,
						stroke: new OlStyleStroke({
							color: "yellow"
						}),
						fill: new OlStyleFill({
							color: "red"
						})
					})
				}),
				zIndex: 9,
				name: "空间测量"
			});
			map.addLayer(measureLayer);
			this.createMeasureTooltip();
			this.createHelpTooltip();
			// 删除测量标注
			this.measureOption.popupcloser = document.createElement("a");
			this.measureOption.popupcloser.innerHTML =
				'<span style="color:red;font-size:18px;">X</span>';
			this.measureOption.popupcloser.href = "javascript:void(0);";
			this.measureOption.popupcloser.classList.add("ol-popup-closer");
			this.measureOption.popupcloser.onclick = e => {
				let parentNode = e.target.parentNode.parentNode.parentNode;
				parentNode.remove();
				measureLayer.getSource().clear();
			};
		},
		// 清除空间测量
		removePlotting() {
			this.removeLayerByName("标绘");
			map.un("pointermove", this.pointerMoveHandler);
			map.removeInteraction(this.plottingOption.draw);
		},
		// 获取所有覆盖图层
		getAllOverlay() {
			let layers = map.getOverlays().getArray();
			return layers;
		},
		// 清除所有覆盖图层
		removeAllOverlay() {
			let layers = this.getAllOverlay();
			layers.forEach(item => {
				map.removeOverlay(item);
			});
		},
		// 根据图层名移除图层
		removeLayerByName(name) {
			let layer = this.getLayerByName(name);
			layer.forEach(item => {
				map.removeLayer(item);
			});
		},
		//根据图层名获取图层
		getLayerByName(name) {
			let allLayers = this.getAllLayers();
			let layer = allLayers.filter(item => {
				return item.get("name") === name;
			});
			return layer;
		},
		// 获取所有图层
		getAllLayers() {
			let layers = map.getLayers().getArray();
			return layers;
		},
		//清除所有
		clearAll() {
			this.removeLayerByName("标注");
			this.removeLayerByName("标绘");
			this.removeLayerByName("空间测量");
			this.removePlotting();
			this.removeAllOverlay();
			if (imgWms) {
				map.removeLayer(imgWms);
			}
		}
	}
};
</script>

<style lang="less" scoped>
#mapName {
	padding: 0;
	margin: 0;
	width: 100%;
	height: 100%;
	position: absolute;
}
.map {
	width: 100%;
	height: 100%;
	position: relative;

	.btnGroup {
		position: absolute;
		bottom: 10px;
		right: 10px;
	}
	.toolBtn {
		position: absolute;
		right: 10px;
		top: 10px;
	}
}
</style>
<style lang='less'>
@import "./map.less";
.map {
}
.ol-tooltip-measure,
.ol-tooltip-static {
	color: red;
}
</style>