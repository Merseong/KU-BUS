
var recordList;
var map
var markers = [];


var mylat, mylng;
var from={
    "lat": Intl,
    "lng": Intl,
    "name": String
};
var to={
    "lat": Intl,
    "lng": Intl,
    "name": String
};
var fromclicked = false,
    toclicked = false;
var clickblocked = false;
var StarMarkerSrc = "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png"; 
var imageSize = new kakao.maps.Size(24, 35);

function StartMap(callback) {
    var getpos = new Promise(function(resolve, reject){
        navigator.geolocation.getCurrentPosition(resolve, reject);
    });
    if (!!navigator.geolocation) {
        getpos.then(function(data){
            successCallback(data);
            callback();
        }).catch(function(error){
            console.log(error);
            alert("현재 위치를 가져올 수 없습니다.");
        });
    } else {
        alert("현재 위치를 가져올 수 없습니다.");
    }
}

function successCallback(position) {
//    var args = top.args;
    var coord = position["coords"];
    var lat = coord["latitude"];
    var lng = coord["longitude"];
//    mylat = lat;
//    mylng = lng;
//    from["lat"] = lat;
//    from["lng"] = lng;
    //To Be cleared 09.14 TBDJS
    //Anam station
        lat = 37.586232954034564;
        lng = 127.02928291766814;
    //end
    $("#set_location").html('latitude : ' + lat + ', longitude : ' + lng);
    var container = document.getElementById('Map');
    var options = {
        center: new kakao.maps.LatLng(lat, lng),
        level: 3
    };
    map = new kakao.maps.Map(container, options);
}

function RecordPositionGet(){
    if(!top.debugging && self != top){
        $.ajax({
            url:  window.location.origin + "/node/record-position",
            type: "GET",
            error:function(request,status,error){
                //alert("code:"+request.status+"\n"+"message:"+request.responseText+"\n"+"error:"+error);
                alert("record position get error");
            },
            success: function(data, status, xhr){
                MapPinWithRecord(data);
            },
        });

    } else{
        $.ajax({
            url: window.location.origin + "/src/json/recordPosition.json",
            error:function(request,status,error){
                alert("record position get error");
            },
            success:function(data){
                MapPinWithRecord(data);
            }
        });
    }
}
var UserMarker = {
    'DRIVER': null,
    'STUDENT': null,
};

function MarkerCreate(position, who){
    const imgconvert={
        'DRIVER': window.location.origin + '/src/img/car-pin.png',
        'STUDENT': window.location.origin + '/src/img/human-pin.png',
        null : null,
        undefined : null,
    }
    var marker;
    var v = {};
    v['lat']= position['latitude'];
    v['lng']= position['longitude'];

    marker = CreateMarker(imgconvert[who], v, null);
    return marker;

}

function MarkerLocationChange(marker, position){
    console.log('This function are deprecated.');
    Marker.FindMarker(marker).LocationChange(position);
}
function Pinupdate(position, who){
    if(UserMarker[who] == null){
        UserMarker[who] = MarkerCreate(position, who);
    } else {
        MarkerLocationChange(UserMarker[who], position);
    }
}

async function TraceAnother(id, who){
    setInterval(()=>UpdateAnother(id, who),1000);
}

async function UpdateAnother(id, who){
    var result = await top.GetPositionById(id);
    Pinupdate(result,who);
}

function CreateMarker(imgSrc, value, event){
    console.log('This function are deprecated.');
    var marker = new Marker(map, imgSrc, value);
    return marker.kakaoMarker;
}

var imgChangedMarker = null;
var deletedMarker = [];

function MarkerImageChange(what ,marker){
    if(!marker) return;
    console.log('This function are deprecated.');
    Marker.FindMarker(marker).ImgChange(what);
}
function ClickedMarkerDelete(){
    imgChangedMarker.setMap(null);
    deletedMarker.push(imgChangedMarker);
}

function DeletedMarkerRevive(){
    deletedMarker.forEach(function(value, index){
        value.setMap(map);
    });
}

var openedIwcontent = null;
function MarkerClickEvent(value, marker, imageSize){
    function InfowindowOpen(status){
        var iwContent = "", // 인포윈도우에 표출될 내용으로 HTML 문자열이나 document element가 가능합니다
            iwRemoveable = true; // removeable 속성을 ture 로 설정하면 인포윈도우를 닫을 수 있는 x버튼이 표시됩니다
        $("#PositionName").html(value.name)

        if(openedIwcontent){
            openedIwcontent.close();
        }
        iwContent = $("#InfowindowTemplete").html();
        var infowindow = new kakao.maps.InfoWindow({
            content : iwContent,
            removable : iwRemoveable
        });   
        infowindow.open(map, marker);
        return infowindow;
    }
    function OrderInput(status){
        if(status == orderStat[0]){      //from
            from = value;

        } else if(status == orderStat[1]){      //to
            to = value;
        } else{
            console.log("Too many click");            
        }
    }
    MarkerImageChange('star', imgChangedMarker);
    MarkerImageChange(null, marker);
    NextButtonSwitch(true);
    OrderInput(orderStat[statnum]);
    openedIwcontent = InfowindowOpen(orderStat[statnum]);
}

function NextStat(){
    statnum++;
    if(statnum >= orderStat.length) console.log("Error On NextStat()");
    console.log("Stat is " + orderStat[statnum]);
    MarkerImageChange(null, imgChangedMarker);
    openedIwcontent.close();
}


function MapPinWithRecord(data){
    if(typeof(data) == "string"){
        recordList = JSON.parse(data);

    } else{
        recordList = data;
    }
    //var bluepin = window.location.origin + "/src/img/blue-map-pin.png";
    //var redpin =  window.location.origin + "/src/img/red-map-pin.png";

    


    recordList.forEach(function(value, index){
        //refernce with https://apis.map.kakao.com/web/sample/multipleMarkerImage/

        // 마커 이미지의 이미지 크기 입니다
        //var imageSize = new kakao.maps.Size(24, 35);
        

        // 마커를 생성합니다
        var marker = CreateMarker(StarMarkerSrc, value, null);
        markers.push(marker);
        marker.setMap(map);
        kakao.maps.event.addListener(marker, 'click', ()=>MarkerClickEvent(value, marker, imageSize));
    });
}

