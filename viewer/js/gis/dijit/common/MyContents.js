define([
	'dojo/_base/declare',
	'dijit/_WidgetBase',
	'dijit/_TemplatedMixin',
	'dijit/_WidgetsInTemplateMixin',
	'gis/dijit/_FloatingWidgetMixin',

	'dojo/_base/lang',
	'dojo/_base/array',
	'dojo/aspect',
	'dojo/dom-construct',
	'dojo/on',
	'dojo/query',

	'esri/Color',
	'esri/graphic',
	'esri/InfoTemplate',
	'esri/graphicsUtils',
        'esri/renderers/smartMapping',

	'gis/dijit/common/Manager/layerManager',

	'dojo/topic',

	'dojo/text!./MyContents/templates/myContents.html',

	'xstyle/css!./MyContents/css/myContents.css',
	'dijit/form/TextBox',
	'dijit/form/Button',
	'dijit/form/Select'
], function (declare, _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, _FloatingWidgetMixin, lang, arrayUtils, aspect, domConstruct, on, query, Color, Graphic, InfoTemplate, graphicsUtils, smartMapping, layerManager, topic, template) {

	return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, _FloatingWidgetMixin], {
		widgetsInTemplate: true,
		templateString: template,
		title: 'コンテンツの検索',
		html: '<a href="#" title="コンテンツの検索"><img src="./js/gis/dijit/common/MyContents/images/Lights@40w.png" alt="コンテンツの検索"></a>',
		domTarget: 'common1_Dijit',
		baseClass: 'MyContents',
		draggable: true,
		meshLayer: null,
		cityLayer: null,
		prefLayer: null,
		legendLayerInfos: [],
		postCreate: function () {
			this.inherited(arguments);
			this.parentWidget.draggable = this.draggable;
			if (this.parentWidget.toggleable) {
				this.own(aspect.after(this.parentWidget, 'toggle', lang.hitch(this, function () {
					this.containerNode.resize();
				})));
			} else {
				var myContents = domConstruct.place(this.html, this.domTarget);
				on(myContents, 'click', lang.hitch(this.parentWidget, 'show'));
			}

       		this.map.on("layer-add-result", function(args) {

            	var layer = args.layer;
                var title = "mesh_tokyo";

                layerManager._addLayerInfo(layer, title);

            });

		},
		onOpen: function () {
			if (!this.openOnStartup) {
				this.containerNode.resize();
			}
		},
		onClose: function () {
			if (this.parentWidget.hide) {
				this.parentWidget.hide();
			}
		},
		_clickAddLayer: function(){

			var url = "http://services.arcgis.com/wlVTGRSYTzAbjjiC/arcgis/rest/services/mesh_tokyo/FeatureServer/0";
			var options = {mode: 1, id: "mesh_tokyo", maxScale: 80000, minScale: 300000, opacity: 0.8};

			this.meshLayer = layerManager.createServerLayer({
				title: "mesh_tokyo",
				url: url,
				map: this.map,
				layerOptions: options
			});

			var	self = this;
			this.meshLayer.on("load", function(layerInfo) {
				self.createRenderer(layerInfo.layer);
			});

		},
		_clickRemoveLayer: function(){
			layerManager.removeLayer({ map:this.map, layer:this.meshLayer });
		},
		createRenderer: function (layer) {
			//smart mapping functionality begins
			smartMapping.createClassedColorRenderer({
				layer: layer,  
				field: "M_TOTPOP_H22",  
				basemap: this.map.getBasemap(),  
				classificationMethod: "quantile", 
				numClasses: 5
			}).then(function (response) {
				response.renderer.setColorInfo({
					field: "M_TOTPOP_H22",
					minDataValue: response.minValue,
					maxDataValue: response.maxValue,
					colors:[
						new Color([255, 255, 255]),
						new Color([0, 0, 255, 1])
					]
				});
				layer.setRenderer(response.renderer);  
				//layer.redraw();
				layer.refresh();
			});
		}

	});
});
