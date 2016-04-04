define([
	'dojo/_base/declare',
	'dojo/_base/lang',
	'dojo/_base/array',
	'dojo/topic',
	'esri/dijit/Legend',
	'gis/dijit/common/Manager/ObjectCacheManager'
], function (declare, lang, arrayUtils, topic, Legend, ObjectCacheManager) {
	return declare([Legend], {
		postCreate: function() {
			this.inherited(arguments);

			// 凡例にレイヤーを追加
			// 追加したいレイヤーの layerInfo を受け取る → legend.layerInfos に受け取った layerInfo を push → legend を refresh
			// PubSub だと ↓
			/*topic.subscribe('customLegend/addLayers', lang.hitch(this, function(layerInfo){
				this.layerInfos.push(layerInfo);
				this.refresh();
			}));*/
			// ObjectCacheManager だと ↓
			topic.subscribe('customLegend/addLayers', lang.hitch(this, function(){
				var layerInfo = ObjectCacheManager.getCachedData(['layerManager', 'customLegend', 'addLayers']);
				this.layerInfos.push(layerInfo);
				this.refresh();
			}));

			// 凡例からレイヤーを削除
			// 削除したいレイヤーの配列を受け取る → legend.layerInfos をループして、削除したいレイヤーと同じレイヤーが含まれる layerInfos を探して削除、を繰り返す → legend を refresh
			// PubSub だと ↓
			/*topic.subscribe('customLegend/removeLayers', lang.hitch(this, function(layers){
				arrayUtils.forEach(layers, lang.hitch(this, function(layer){
					for (var i = this.layerInfos.length - 1; i >= 0; i--) {
						var layerInfo = this.layerInfos[i];
						if (layerInfo.layer === layer) {
							this.layerInfos.splice(i, 1);
						}
					}
				}));
				this.refresh();
			}));*/
			// ObjectCacheManager だと ↓
			topic.subscribe('customLegend/removeLayers', lang.hitch(this, function(){
				var layers = ObjectCacheManager.getCachedData(['layerManager', 'customLegend', 'removeLayers']);
				arrayUtils.forEach(layers, lang.hitch(this, function(layer){
					for (var i = this.layerInfos.length - 1; i >= 0; i--) {
						var layerInfo = this.layerInfos[i];
						if (layerInfo.layer === layer) {
							this.layerInfos.splice(i, 1);
						}
					}
				}));
				this.refresh();
				//this.destroy();
			}));
		}
	});
});