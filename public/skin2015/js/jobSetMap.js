define(['jquery'], function($) {
    var map = new BMap.Map("setmap-con"),marker,point,styleStr;
        map.enableScrollWheelZoom();
        map.enableContinuousZoom();


    var JobMap = {};
    /**
     * 注册事件
     */
    JobMap.addevent = function() {
        var that = this;
        var _form = $(this.elem).parents("form"),
            _city = _form[0].city,
            _address = _form[0].address;

        // 搜索处理 
        $(this.elem).on("click", "#setmap-search", function() {
            that.showMap();
        });

        // 城市被改变时处理
        $(_city).change(function() {
            var code = this.value,
                text;

            $(this).find("option").each(function() {
                if ( this.value == code ) {
                    text = $(this).html();
                }
            });

            if ( text != $("#setmap-city").val() ) {
                $("#setmap-city").val(text);
                that.showMap();
            }
        });

        // 地址被改变时处理
        $(_address).blur(function() {
            var text = this.value;
            if ( text != $("#setmap-address").val() ) {
                $("#setmap-address").val(text);
                that.showMap();
            }
        });
    };

    /**
     * 重新定位地图
     */
    JobMap.showMap = function() {
        if (!document.getElementById('setmap-city').value) {
            alert("请输入城市");
            return;
        }

        var search = new BMap.LocalSearch(document.getElementById('setmap-city').value, {
            onSearchComplete: function (results){
                if (results && results.getNumPois()) {
                    var points = [];
                    for (var i=0; i<results.getCurrentNumPois(); i++) {
                        points.push(results.getPoi(i).point);
                    }
                    if (points.length > 1) {
                        map.setViewport(points);
                    } else {
                        map.centerAndZoom(points[0], 13);
                    }
                    point = map.getCenter();
                    marker.setPoint(point);
                } else {
                    alert(lang.errorMsg);
                }
            }
        });
        search.search(document.getElementById('setmap-address').value || document.getElementById('setmap-city').value);
    };

    /**
     * 初始化显示地图
     */
    JobMap.setMapInit = function() {
        var _form = $("#js-job-set-map").parents("form")[0],
            lng = _form.mapLng.value || 108.953439,
            lat = _form.mapLat.value || 34.265672,
            zoom = _form.mapZoom.value || 10;
        point = new BMap.Point(lng, lat);    // 创建点坐标【默认西安钟楼】
        marker = new BMap.Marker(point);
        map.addControl(new BMap.NavigationControl());
        map.centerAndZoom(point, zoom);// 初始化地图,设置中心点坐标和地图级别。
        marker.enableDragging();
        map.addOverlay(marker);
    };

    /**
     * 设置隐藏表单内容
     */
    JobMap.setHiddenInput = function() {
        var _form = $("#js-job-set-map").parents("form")[0];
        _form.mapLng.value = marker.point.lng;
        _form.mapLat.value = marker.point.lat;
        _form.mapZoom.value = map.zoomLevel;
    };
    window.JobMapSetHiddenInput = JobMap.setHiddenInput;

    /**
     * 初始化
     */
    JobMap.init = function() {
        this.elem = $("#js-job-set-map");
        var _form = $(this.elem).parents("form"),
            _city = _form[0].city.value,
            _address = _form[0].address.value;

        this.setMapInit();
        this.addevent();

        // 新建招聘，但企业有数据重新定位
        // if ( _city && _address && !_form[0].mapLng.value && !_form[0].mapLat.value && !_form[0].mapZoom.value ) {
        //     this.showMap();
        // }
    };

    JobMap.init();
    return JobMap;
});