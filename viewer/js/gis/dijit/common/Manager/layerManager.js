define([
	'dojo/_base/declare', 
	'dojo/_base/lang',
	'dojo/_base/array',
	'dojo/topic',
	'esri/InfoTemplate',
	'esri/layers/FeatureLayer',
	'esri/graphic',
	'esri/graphicsUtils',
	'gis/dijit/common/Manager/ObjectCacheManager'
], function(declare, lang, arrayUtils, topic, InfoTemplate, FeatureLayer, Graphic, graphicsUtils, ObjectCacheManager){
	var layerManager = declare([], {

		// ポイントのレイヤーを作成するメソッド
			/*layerManager.createPointLayer({
				map: this.map,	//必須
				features: [],	//必須
				fields: [],		//必須
				drawingInfo: {},	//オプション
				title: '',		//必須
				layerOptions: {}	//オプション
			});*/
		createPointLayer: function(arg){
			var map, features, fields, drawingInfo, layerOptions;

			// マップ オブジェクト（必須）。このクラスからマップ オブジェクトにアクセスできないので
			map = arg.map;

			// フィーチャ（必須）
			features = arg.features;

			// フィールド（オプション）。定義されていなかったら ObjectID と Name のふたつを使う
			if (arg.fields === undefined) {
				fields = [
					{ 'name': 'ObjectID', 'type': 'esriFieldTypeOID' }, 
					{ 'name': 'Name', 'type': 'esriFieldTypeString' }
				];
			} else {
				fields = arg.fields;
			}

			// drawingInfo（レンダリングの情報）（オプション）。定義されていなかったらこちらで決めたシンボルを適用する
			if (arg.drawingInfo === undefined) {
				drawingInfo = {
					'renderer': {
						'type': 'simple',
						'symbol': {
							'angle': 0, 
							'color': [238, 69, 0, 128], 
							'size': 15, 
							'type': 'esriSMS', 
							'xoffset': 0, 
							'yoffset': 0
						}
					}
				};
			} else {
				drawingInfo = arg.drawingInfo;
			}

			// layerOptions（オプション）
			if (arg.layerOptions === undefined) {
				layerOptions = {
					mode: FeatureLayer.MODE_ONDEMAND,
					infoTemplate: new InfoTemplate('Attributes', '${*}')
				};
			} else {
				layerOptions = arg.layerOptions;
			}
			// 同じ ID を持つレイヤーがある場合は削除しておく
			if (layerOptions.id !== undefined) {
				this._checkLayerId({ map:map, id:layerOptions.id });
			}

			// パラメーターをまとめて featureCollection を作成
			var featureCollection = {
				'layerDefinition': {
					'geometryType': 'esriGeometryPoint',
					'objectIdField': 'ObjectID',
					'fields': fields,
					'drawingInfo': drawingInfo
				},
				'featureSet': {
					'features': features,
					'geometryType': 'esriGeometryPoint'
				}
			};
			// フィーチャ レイヤーを生成
			this.featureLayer = new FeatureLayer(featureCollection, layerOptions);
			// マップに追加
			map.addLayers([this.featureLayer]);

			// layerControl と凡例に追加
			// title （必須）。layerControl と凡例に表示するタイトルを引数に
			this._addLayerInfo(arg.title);

			return this.featureLayer;
		},

		// ポリゴンのレイヤーを作成するメソッド
			/*layerManager.createPolygonLayer({
				map: this.map,	//必須
				features: [],	//必須
				fields: [],		//必須
				drawingInfo: {},	//オプション
				title: '',		//必須
				layerOptions: {}	//オプション
			});*/
		createPolygonLayer: function(arg){
			var map, features, fields, drawingInfo, layerOptions;

			map = arg.map;

			features = arg.features;

			if (arg.fields === undefined) {
				fields = [
					{ 'name': 'ObjectID', 'type': 'esriFieldTypeOID' }, 
					{ 'name': 'Name', 'type': 'esriFieldTypeString' }
				];
			} else {
				fields = arg.fields;
			}

			if (arg.drawingInfo === undefined) {
				drawingInfo = {
					'renderer': {
						'type': 'simple',
						'symbol': {
							'color': [255, 0, 0, 89],
							'outline': { 'color': [255, 0, 0, 166], 'style': 'esriSLSSolid', 'type': 'esriSLS', 'width': 1.5 },
							'style': 'esriSFSNull',
							'type': 'esriSFS'
						}
					}
				};
			} else {
				drawingInfo = arg.drawingInfo;
			}

			if (arg.layerOptions === undefined) {
				layerOptions = {
					mode: FeatureLayer.MODE_ONDEMAND,
					infoTemplate: new InfoTemplate('Attributes', '${*}')
				};
			} else {
				layerOptions = arg.layerOptions;
			}
			if (layerOptions.id !== undefined) {
				this._checkLayerId({ map:map, id:layerOptions.id });
			}

			var featureCollection = {
				'layerDefinition': {
					'geometryType': 'esriGeometryPolygon',
					'objectIdField': 'ObjectID',
					'fields': fields,
					'drawingInfo': drawingInfo
				},
				'featureSet': {
					'features': features,
					'geometryType': 'esriGeometryPolygon'
				}
			};
			this.featureLayer = new FeatureLayer(featureCollection, layerOptions);
			map.addLayers([this.featureLayer]);

			this._addLayerInfo(arg.title);

			return this.featureLayer;
		},

		// ArcGIS server が配信しているサービスを使ってレイヤーを作成するメソッド
			/*layerManager.createServerLayer({
				title: '',		//必須
				map: this.map,	//必須
				url: '//domain/arcgis/rest/services/sample/MapService/0',	//必須
				layerOptions: {}	//オプション
			});*/
		createServerLayer: function(arg){
			var layerOptions;

			if (arg.layerOptions === undefined) {
				layerOptions = {
					mode: FeatureLayer.MODE_ONDEMAND,
					infoTemplate: new InfoTemplate('Attributes', '${*}')
				};
			} else {
				layerOptions = arg.layerOptions;
			}
			if (layerOptions.id !== undefined) {
				this._checkLayerId({ map:arg.map, id:layerOptions.id });
			}

			this.featureLayer = new FeatureLayer(arg.url, layerOptions);
			arg.map.addLayers([this.featureLayer]);

			//this._addLayerInfo(arg.title);

			return this.featureLayer;
		},

		// 暫定的に対応 3/25
		createServerLayerNoAddLayerInfo: function(arg){
			var infoTemplate, layerOptions;

			if (arg.infoTemplate === undefined) {
				infoTemplate = new InfoTemplate('Attributes', '${*}');
			} else {
				infoTemplate = arg.infoTemplate;
			}

			if (arg.layerOptions === undefined) {
				layerOptions = {
					mode: FeatureLayer.MODE_ONDEMAND,
					infoTemplate: infoTemplate
				};
			} else {
				layerOptions = arg.layerOptions;
			}

			this.featureLayer = new FeatureLayer(arg.url, layerOptions);
			arg.map.addLayers([this.featureLayer]);

			//this._addLayerInfo(arg.title);

			return this.featureLayer;
		},

		// 同じ ID を持つレイヤーは削除する
		_checkLayerId: function(arg){
			var map = arg.map;
			var id = arg.id;
			var targetIds = map.layerIds.concat(map.graphicsLayerIds);

			arrayUtils.forEach(targetIds, lang.hitch(this, function(targetId){
				if (targetId === id) {
					var layer = map.getLayer(targetId);
					this.removeLayer({ map:map, layer:layer });
				}
			}));
		},

		// layerControl と凡例にレイヤーを追加する
		_addLayerInfo: function(layer, title){
			// layerControl
			var layerControlInfo = { 
				controlOptions:{ expanded:true, metadataUrl:false, swipe:false },
				layer: layer,
				title: title,
				type: 'feature'
			};
			topic.publish('layerControl/addLayerControls', [layerControlInfo]);

			// 凡例
			// 凡例をアップデートするには、layerInfos に layerInfo を push → legend.refresh する
			// ここからでは legend にアクセスできないので、イベントを飛ばすと上記の動作をするようにカスタマイズした legend を使う（gis/dijit/common/customLegend）
			var legendInfo = { layer: layer,  title: title };
			// PubSub だと ↓
			//topic.publish('customLegend/addLayers', legendInfo);
			// ObjectCacheManager だと ↓
			ObjectCacheManager.addCachedData(['layerManager', 'customLegend', 'addLayers'], legendInfo);
			topic.publish('customLegend/addLayers');
		},

		// レイヤーをすべてクリアする
		//layerManager.removeAllLayers({
		//	map: this.map	//必須
		//});
		removeAllLayers: function(arg){
			// マップ オブジェクト（必須）
			var map = arg.map;

			// ↓ これだとベースマップも削除されてしまうので
			//map.removeAllLayers();

			// インデックスでレイヤー取得 → ベースマップ以外のレイヤーを配列に入れなおす
			var layers = [];
			var basemapId = map.basemapLayerIds[0];
			for (var i = map.layerIds.length - 1; i >= 0; i--) {
				var id = map.layerIds[i];
				if (id !== basemapId) {
					var layer = map.getLayer(id);
					layers.push(layer);
				}
			}
			// フィーチャ レイヤーは graphicsLayerIds に格納されるみたいなのでここでもう一度 for して配列に追加
			for (var j = 0; j < map.graphicsLayerIds.length; j++) {
				var gId = map.graphicsLayerIds[j];
				var gLayer = map.getLayer(gId);
				layers.push(gLayer);
			}
			// 配列に入っているレイヤーをマップから削除
			arrayUtils.forEach(layers, function(layer){
				map.removeLayer(layer);
			});

			// layerControlからレイヤーを削除
			topic.publish('layerControl/removeLayerControls', layers);

			// 凡例からレイヤーを削除
			// PubSub だと ↓
			//topic.publish('customLegend/removeLayers', layers);
			// ObjectCacheManager だと ↓
			ObjectCacheManager.addCachedData(['layerManager', 'customLegend', 'removeLayers'], layers);
			topic.publish('customLegend/removeLayers');
		},

		// レイヤーを１つ削除する
		//layerManager.removeLayer({
		//	map: this.map,	//必須
		//	layer: layer	//必須
		//});
		removeLayer: function(arg){
			// マップ オブジェクト（必須）
			var map = arg.map;
			// 削除対象のレイヤー（必須）
			var layer = arg.layer;

			// レイヤーを削除
			map.removeLayer(layer);

			// layerControl からレイヤーを削除
			topic.publish('layerControl/removeLayerControls', [layer]);

			// 凡例からレイヤーを削除
			// PubSub だと ↓
			//topic.publish('customLegend/removeLayers', [layer]);
			// ObjectCacheManager だと ↓
			ObjectCacheManager.addCachedData(['layerManager', 'customLegend', 'removeLayers'], [layer]);
			topic.publish('customLegend/removeLayers');
		},

		// ジオメトリ配列よりfeaturesを作成する。
		createFeatures: function(geometries){
			var features = [];
			var idx = 0;
			arrayUtils.forEach(geometries, function(geometry) {
				var attr = {};
				attr['ObjectID'] = idx;
				attr['Name'] = String(idx);
				var graphic = new Graphic(geometry);
				graphic.setAttributes(attr);
				features.push(graphic);
				idx++;
			});
			return features;
		},

		// extent を調べて返す
		getExtent: function(layer){
			var extent;
			// featureCollection の場合
			if (layer.initialExtent.xmax === undefined) {
				extent = graphicsUtils.graphicsExtent(layer.graphics);
			// ArcGIS services の場合
			} else {
				extent = layer.initialExtent;
			}
			return extent;
		}
	});
	if (!_instance) {
		var _instance = new layerManager();
	}
	return _instance;
});