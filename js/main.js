//global variables section
var layers_param;
var map;
var tiled;
var projection;
var mousePositionControl;

  function showMap(){

      layer1_checked = document.getElementById('layer1').checked;
      layer2_checked = document.getElementById('layer2').checked;
      layer3_checked = document.getElementById('layer3').checked;
        
      var layers_array = [];
        if(layer1_checked){
          layers_array.push('topp:tasmania_state_boundaries');
        }
        if(layer2_checked){
          layers_array.push('topp:tasmania_roads');
        }
        if(layer3_checked){
          layers_array.push('topp:tasmania_water_bodies');
        }     
          

      layers_param = "";
      for(var i=0;i<layers_array.length;i++){
        layers_param = layers_param+layers_array[i]+",";
      }
      layers_param = layers_param.substring(0,layers_param.length-1);      

      document.getElementById('map').innerHTML="";
  
      var format = 'image/png';
      var bounds = [145.19754, -43.423512,148.27298000000002, -40.852802];
          
      var mousePositionControl = new ol.control.MousePosition({
          className: 'custom-mouse-position',
          target: document.getElementById('location'),
          coordinateFormat: ol.coordinate.createStringXY(5),
          undefinedHTML: '&nbsp;'
      });

          
        tiled = new ol.layer.Tile({
        visible: true,
        source: new ol.source.TileWMS({
          url: 'http://localhost:8080/geoserver/topp/wms',
          params: {'FORMAT': format, 
                   'VERSION': '1.1.1',
                   tiled: true,
                   STYLES: '',
                LAYERS: layers_param,
             tilesOrigin: 145.19754 + "," + -43.423512
          }
        })
      });

       projection = new ol.proj.Projection({
          code: 'EPSG:4326',
          units: 'degrees',
          axisOrientation: 'neu',
          global: true
      });

       map = new ol.Map({
        controls: ol.control.defaults({
          attribution: false
        }).extend([mousePositionControl]),
        target: 'map',
        layers: [          
          tiled
        ],
        view: new ol.View({
           projection: projection
        })
      });

      map.getView().on('change:resolution', function(evt) {
        var resolution = evt.target.get('resolution');
        var units = map.getView().getProjection().getUnits();
        var dpi = 25.4 / 0.28;
        var mpu = ol.proj.METERS_PER_UNIT[units];
        var scale = resolution * mpu * 39.37 * dpi;
        if (scale >= 9500 && scale <= 950000) {
          scale = Math.round(scale / 1000) + "K";
        } else if (scale >= 950000) {
          scale = Math.round(scale / 1000000) + "M";
        } else {
          scale = Math.round(scale);
        }
      });
      map.getView().fit(bounds, map.getSize());
      map.on('singleclick', function(evt) {
        var view = map.getView();
        var viewResolution = view.getResolution();
        var source = tiled.getSource();
        var url = source.getGetFeatureInfoUrl(
          evt.coordinate, viewResolution, view.getProjection(),
          {'INFO_FORMAT': 'text/html', 'FEATURE_COUNT': 50});
        
             });          

}

function printMap(){
      var extent=map.getView().calculateExtent(map.getSize());
      var mapbb = extent;
      var mapbb_str = String(mapbb);
      var bbvalues = mapbb_str.split(',');
      var bb1=parseFloat(bbvalues[0]);
      var bb2=parseFloat(bbvalues[1]);
      var bb3=parseFloat(bbvalues[2]);
      var bb4=parseFloat(bbvalues[3]);

      var download_url = 'http://localhost:8080/geoserver/topp/wms?service=WMS&version=1.1.0&request=GetMap&layers='+layers_param+'&styles=&bbox='+bb1+','+bb2+','+bb3+','+bb4+'&width=1000&height=500&srs=EPSG:4326&format=application/pdf';
      window.open(download_url);
}
     
