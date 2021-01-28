<template>
<div style="height: 100%; width: 100%;">
    <l-map :zoom=2 :options="mapOptions" :center="center" :min-zoom="minZoom" :max-zoom="maxZoom" style="height: 100%; width: 100%;background-color:#0c1321;">
        <l-tile-layer v-for="tileProvider in tileProviders" :key="tileProvider.name" :name="tileProvider.name" :visible="tileProvider.visible" :url="tileProvider.url" :attribution="tileProvider.attribution" layer-type="base" />

        <l-layer-group layer-type="overlay" name="Routes">
             <l-polyline 
                v-for="port_line in attention_port_list"
                :key="port_line.index"
                :lat-lngs="port_line.position" 
                :visible="true" 
                :color="red"
                :weight="0.8" 
                :opacity="0.9" 
            />
            <l-polyline v-for="route in route_data" :key="route.name" :lat-lngs="route.new_route_geo" :visible="true" :color="route_color" :weight="0.8" :opacity="0.25" />
            <l-polyline v-for="route in route_obvious_list" :key="'highlight'+route.name" :lat-lngs="route.new_route_geo" :visible="true" :color="route_obvious_color" :weight="2" :opacity="0.9" />
            <l-marker v-for="vessel in vessel_run" :key="vessel.name" :visible="true" :draggable="false" :lat-lng="vessel.position" :icon="vessel.icon">
                <l-tooltip class="vessel_tooltip">
                    <div>
                        <span style="font-size:12px;font-weight: bold">{{vessel.name}}</span>
                        <br />
                        <div style="font-size:10px;color:grey">
                            {{$t('vessel.laden')}}:{{vessel.full}}
                            <br />
                            {{$t('vessel.remainingSpace')}}:{{vessel.remaining_space}}
                            <br />
                            {{$t('vessel.empty')}}:{{vessel.empty}}
                        </div>
                    </div>
                </l-tooltip>
            </l-marker>
            <l-marker v-for="vessel in vessel_obvious_list" :key="'highlight'+vessel.name" :visible="true" :draggable="false" :lat-lng="vessel.position" :icon="icon_vessel_obvious">
                <l-tooltip class="vessel_tooltip">
                    <div>
                        <span style="font-size:12px;font-weight: bold">{{vessel.name}}</span>
                        <br />
                        <div style="font-size:10px;color:grey">
                            {{$t('vessel.laden')}}:{{vessel.full}}
                            <br />
                            {{$t('vessel.remainingSpace')}}:{{vessel.remaining_space}}
                            <br />
                            {{$t('vessel.empty')}}:{{vessel.empty}}
                        </div>
                    </div>
                </l-tooltip>
            </l-marker>
        </l-layer-group>
        <l-layer-group v-for="item in stuff" :key="item.id" :visible.sync="item.visible" layer-type="overlay" name="Ports">
            <l-layer-group :visible="item.markersVisible">
                <l-marker v-for="marker in item.markers" :key="marker.id" :visible="marker.visible" :draggable="marker.draggable" :lat-lng="marker.position" :icon="icon" />
                <l-marker v-for="marker in markers" :key="marker.id" :lat-lng="marker.position" :icon="marker.status">
                    <l-tooltip class="port_tooltip">
                        <div>
                            <span class="name">{{marker.port_name}}</span>
                            <br />
                            <div style="width:200px">
                                <div style="float:left;width:40%">
                                    <span style="font-size:13px">{{$t('port.realTime')}}</span>
                                    <br />
                                    <div style="font-size:11px;color:grey">
                                        {{$t('port.booking')}}: {{marker.booking}}
                                        <br />
                                        {{$t('port.laden')}}: {{marker.full}}
                                        <br />
                                        {{$t('port.empty')}}: {{marker.empty}}
                                        <br />
                                        {{$t('port.fulfillment')}}: {{marker.fulfillment}}
                                        <br />
                                        {{$t('port.shortage')}}: {{marker.shortage}}
                                        <br />
                                    </div>
                                </div>
                                <div style="float:left;width:57%">
                                    <span style="font-size:13px">{{$t('port.accumulated')}}</span>
                                    <br />
                                    <div style="font-size:11px;color:grey">
                                        {{$t('port.booking')}}: {{marker.acc_booking}} + {{marker.booking}}
                                        <br />
                                        {{$t('port.laden')}}: {{marker.acc_full}} + {{marker.full}}
                                        <br />
                                        {{$t('port.empty')}}: {{marker.acc_empty}} + {{marker.empty}}
                                        <br />
                                        {{$t('port.fulfillment')}}: {{marker.acc_fulfillment}} + {{marker.fulfillment}}
                                        <br />
                                        {{$t('port.shortage')}}: {{marker.acc_shortage}} + {{marker.shortage}}
                                        <br />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </l-tooltip>
                </l-marker>
            </l-layer-group>
            <l-polyline :lat-lngs="item.polyline.points" :visible="item.polyline.visible" />

        </l-layer-group>
    </l-map>

</div>
</template>

<script>
import {
    LMap,
    LTileLayer,
    LMarker,
    LPolyline,
    LLayerGroup,
    LTooltip,
    LPopup,
    LControlZoom,
    LControlAttribution,
    LControlScale,
    LControlLayers
} from 'vue2-leaflet';
import NavBar from '../components/NavBar.vue'
import NavContent from '../components/navContent.vue'
import * as d3 from "d3"

const markers1 = [{
    position: {
        lng: -1.219482,
        lat: 47.41322
    },
    visible: false,
    draggable: true,
}];

const poly1 = [];

function rand(n) {
    const max = n + 0.01
    const min = n - 0.01
    return Math.random() * (max - min) + min
}
const locations = []
for (let i = 0; i < 10; i++) {
    locations.push({
        id: i,
        latlng: L.latLng(rand(48.8929425), rand(2.3821873)),
        text: 'Moving Marker #' + i,
    })
}
const icon = L.icon({
    iconUrl: require('../assets/vessel.png'),
    iconSize: [15, 15],
    popupAnchor: [4, -25],
})
const icon_vessel_obvious = L.icon({
    iconUrl: require('../assets/vessel_1.png'),
    iconSize: [12, 12],
    popupAnchor: [4, -25],
})

const balance = L.icon({
    iconUrl: require('../assets/balance.png'),
    iconSize: [21, 21],
    popupAnchor: [4, -25],
})
const surplus = L.icon({
    iconUrl: require('../assets/surplus.png'),
    iconSize: [21, 21],
    popupAnchor: [4, -25],
})
const demand = L.icon({
    iconUrl: require('../assets/demand.png'),
    iconSize: [21, 21],
    popupAnchor: [4, -25],
})
export default {
    name: 'VueLeafLet',
    components: {
        LMap,
        LTileLayer,
        LMarker,
        LPolyline,
        LLayerGroup,
        LTooltip,
        LPopup,
        LControlZoom,
        LControlAttribution,
        LControlScale,
        LControlLayers,
        NavBar,
        NavContent
    },
    props: {
        snapshot_number: {
            type: Number,
            default: 0
        },
        route_index: {
            type: Array,
            default: []
        },
        epoch: {
            type: Number,
            default: 0
        },
        port_index:{
            type:Array,
            default:[]
        },
        play_count:{
            type:Number,
            default:0
        },
        providerUrl: {
            type: String,
            default: 'https://api.mapbox.com/styles/v1/zhangy123/ckkessgis1ktq17oad1yky6sf/tiles/512/{z}/{x}/{y}?access_token=pk.eyJ1Ijoiemhhbmd5MTIzIiwiYSI6ImNra2RyMGprczA1amsybnF0NmZmMjZ0MXcifQ.cFSvfTNV6AQKP4g2FmTL7w'
        }
    },
    data() {
        return {
            balance,
            surplus,
            demand,
            icon_vessel_obvious,
            input: 0,
            z: 300,
            locations,
            icon,
            center: [21.505, 5.09],
            opacity: 0.6,
            mapOptions: {
                zoomControl: false,
                attributionControl: false,
                zoomSnap: false,
            },
            zoom: 15,
            minZoom: 3,
            maxZoom: 20,
            tileProviders: [{
                "name": "test",
                "visible": true,
                // "url": "https://api.mapbox.com/styles/v1/meroychen/ckiod6ao60b0p17sg086wtnb4/tiles/512/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWVyb3ljaGVuIiwiYSI6ImNraTc2NTR2ejRlNGQyeHJtc29jcTJ4ZXUifQ.xrCXPnyPfIuxHpXXdmcPMQ"
                "url": this.providerUrl
            }],
            markers: [],
            route_data: [],
            route_color: 'white',
            route_obvious_color: '#feb776',
            stuff: [{
                id: 's1',
                markers: markers1,
                polyline: {
                    points: poly1,
                    visible: true
                },
                visible: true,
                markersVisible: true,
            }, ],
            vessel_run: [],
            vessel_run_data: [],
            route_obvious_list: [],
            vessel_obvious_list: [],
            previous_ports:[],
            attention_port_line:[],
            attention_port_list:[]
        };
    },
    mounted() {
        d3.json('/static/data/route.json').then(route_data => {
            route_data.forEach(route => {
                let new_route_geo = new Array();
                if (route.route_geo.length > 0) {
                    new_route_geo.push(route.route_geo[0])
                }
                for (let i = 1; i < route.route_geo.length; i++) {
                    for (let j = 1; j < 10; j++) {
                        new_route_geo.push(this.get_accurate_vessel_position(route.route_geo[i - 1], route.route_geo[i], j / 10));
                    }
                    new_route_geo.push(route.route_geo[i])
                }
                route.new_route_geo = new_route_geo;

            });
            this.route_data = route_data;
            d3.json(`/static/data/epoch_${this.epoch}/port_run_data/port_run_${this.snapshot_number}.json`).then(markers_data => {
                this.markers = markers_data;
                this.get_port_status_and_acc_attr()
                d3.json(`/static/data/epoch_${this.epoch}/vessel_run_data/vessel_run_${this.snapshot_number}.json`).then(vessel_data => {
                    this.vessel_run = this.get_vessel_position(vessel_data)
                    this.change_obvious_object()
                })
            })
        })

    },
    watch: {
        epoch() {
            d3.json(`/static/data/epoch_${this.epoch}/port_run_data/port_run_${this.snapshot_number}.json`).then(markers_data => {
                this.markers = markers_data;
                this.previous_ports = [];
                this.get_port_status_and_acc_attr()
                d3.json(`/static/data/epoch_${this.epoch}/vessel_run_data/vessel_run_${this.snapshot_number}.json`).then(vessel_data => {
                    this.get_vessel_position(vessel_data);
                    this.change_obvious_object();
                })
            })
        },
        snapshot_number() {
            this.previous_ports = this.markers
            d3.json(`/static/data/epoch_${this.epoch}/port_run_data/port_run_${this.snapshot_number}.json`).then(markers_data => {
                this.markers = markers_data;
                this.get_port_status_and_acc_attr()
                d3.json(`/static/data/epoch_${this.epoch}/vessel_run_data/vessel_run_${this.snapshot_number}.json`).then(vessel_data => {
                    this.vessel_run = this.get_vessel_position(vessel_data)
                    try {
                        d3.json(`/static/data/epoch_${this.epoch}/decision_run_data/decision_run_${this.snapshot_number}.json`).then(cur_attention_port => {
                            let port_line = []
                            for (let item in cur_attention_port){
                                for(let line_index in cur_attention_port[item]["line_list"]){
                                    port_line.push({"port_idx":cur_attention_port[item]["port_idx"],"position":cur_attention_port[item]["line_list"][line_index]})
                                }
                            }
                            this.attention_port_line = port_line
                        }, reason => {
                        // console.log(reason);
                        })
                    } catch (e) {
                        this.attention_port_line = []
                    }
                    this.change_attention_port()
                    this.change_obvious_object()
                })
            })
        },
        route_index() {
            this.change_obvious_object()
        },
        port_index(){
            this.change_attention_port()
        },
    },
    methods: {
        change_attention_port(){
            let port_index_list = JSON.parse(JSON.stringify(this.port_index))
            let attention_port_list = []
            for(let index in port_index_list){
                for(let port_index in this.attention_port_line){
                    let temp_index = parseInt(port_index_list[index])
                    if (this.attention_port_line[port_index]["port_idx"]==temp_index){
                        attention_port_list.push(this.attention_port_line[port_index])
                    }
                }
            }
            this.attention_port_list = attention_port_list
        },
        get_port_status_and_acc_attr() {
            let prev = JSON.parse(JSON.stringify(this.previous_ports))
            for (let index = 0; index < this.markers.length; index++) {
                if (this.markers[index].status == "surplus") {
                    this.markers[index].status = surplus
                } else if (this.markers[index].status == "demand") {
                    this.markers[index].status = demand
                } else if (this.markers[index].status == "balance") {
                    this.markers[index].status = balance
                }
                if (prev == [] || prev.length == 0 ||this.play_count==0) {
                    this.markers[index].acc_empty = 0
                    this.markers[index].acc_shortage = 0
                    this.markers[index].acc_booking = 0
                    this.markers[index].acc_fulfillment = 0
                    this.markers[index].acc_full = 0
                } else {
                    if (prev[index].hasOwnProperty('acc_empty')) {
                        this.markers[index].acc_empty = prev[index].acc_empty + prev[index].empty
                        this.markers[index].acc_shortage = prev[index].acc_shortage + prev[index].shortage
                        this.markers[index].acc_booking = prev[index].acc_booking + prev[index].booking
                        this.markers[index].acc_fulfillment = prev[index].acc_fulfillment + prev[index].fulfillment
                        this.markers[index].acc_full = prev[index].acc_full + prev[index].full
                    } else {
                        this.markers[index].acc_empty = 0
                        this.markers[index].acc_shortage = 0
                        this.markers[index].acc_booking = 0
                        this.markers[index].acc_fulfillment = 0
                        this.markers[index].acc_full = 0
                    }
                }
            }
        },
        change_obvious_object() {
            let route_list = JSON.parse(JSON.stringify(this.route_index))
            this.route_obvious_list = []
            this.vessel_obvious_list = []
            for(let item in route_list){
                let index=parseInt(route_list[item])
                this.route_obvious_list.push(this.route_data[index])

                let start_vessel_idx = 0
                for (let idx = 0; idx < this.route_index[index]; idx++) {
                    start_vessel_idx += this.route_data[idx].vessel_num
                }
                for (let idx = start_vessel_idx; idx < start_vessel_idx + this.route_data[index].vessel_num; idx++) {
                    this.vessel_obvious_list.push(this.vessel_run[idx])
                }
            }
        },
        get_vessel_position(vessel_data) {
            let all_vessel_data = []
            let route_data_temp = this.route_data
            for (let index = 0; index < vessel_data.length; index++) {
                let route_vessel_info = vessel_data[index]
                let route_info = route_data_temp[index]
                let vessel_position_data = this.get_single_vessel_potision(route_vessel_info, route_info)
                all_vessel_data = all_vessel_data.concat(vessel_position_data)

            }
            return all_vessel_data
        },
        get_single_vessel_potision(route_vessel_info, route_info) {
            //route_info.route_config.length
            let port_num = route_info.route_geo.length - 1 
            //route is divided into {point_number} parts
            let point_number = route_info.route_geo.length - 1
            //overall physical distance of route
            let single_distance = route_info.single_distance
            //distance of each part of route
            let part_distance = single_distance / point_number
            let route_vessel_data = []
            let route_distance_list = route_info['route_distance_list']
            for (let index = 0; index < route_vessel_info.vessel.length; index++) {
                let vessel_speed = route_vessel_info.vessel[index].speed
                let start_position = route_vessel_info.vessel[index].start
                let current_distance = (vessel_speed * this.snapshot_number + start_position) % (route_info.all_distance)
                let geo_position = {}
                let test_geo_position = {}
                if (current_distance > single_distance) {
                    geo_position = this.get_appropriate_position(route_info, current_distance, port_num, 0)
                } else {
                    geo_position = this.get_appropriate_position(route_info, current_distance, port_num, 1)

                }
                route_vessel_data.push({
                    "name": route_vessel_info.vessel[index].name,
                    "full": route_vessel_info.vessel[index].full,
                    "position": geo_position,
                    "capacity": route_vessel_info.vessel[index].capacity + '',
                    "empty": route_vessel_info.vessel[index].empty + '',
                    "remaining_space": route_vessel_info.vessel[index].remaining_space + '',
                    "icon": icon,

                })
            }
            return route_vessel_data
        },
        get_appropriate_position(route_info, current_distance, port_num, type) {
            //port that just passed by
            let vessel_port_position = 0
            if (type == 0) // convert the "backward action" into "forward action"
            //physical distance between forward/backward are different, need to be converted
            {
                current_distance = parseInt(route_info.single_distance) - (current_distance - route_info.single_distance) * (route_info.single_distance / route_info.route_config[0].distance)
            }
            for (var i in route_info["route_distance_list"]) {
                if (current_distance >= route_info["route_distance_list"][i]) {
                    vessel_port_position = i
                }
            }
            for (var i in route_info["route_distance_list"]) {
                if (current_distance == route_info["route_distance_list"][i]) {
                    return route_info.route_config[vessel_port_position].position
                }
            }
            let next_position = 0,
                segment_number = 0,
                segment_distance = 0,
                surplus_all = 0,
                station_pass = 0,
                surplus = 0,
                segment_single = 0
            next_position = vessel_port_position + 1
            // this section of route is divided into {segment_number} parts
            segment_number = route_info.route_point.forward[parseInt(vessel_port_position)] + 1
            // physical distance of this section of route
            segment_distance = route_info.route_config[parseInt(vessel_port_position) + 1].distance
            // each part of route = {segment_single} in physical distance
            segment_single = segment_distance / segment_number
            // how far beyond the beginning of the road
            surplus_all = current_distance - route_info.route_distance_list[parseInt(vessel_port_position)]
            // passed by which station in this section of route
            station_pass = Math.floor(surplus_all / segment_single)
            // passed by station of how much distance
            surplus = surplus_all % segment_single
            let passed_other_stations = 0
            for (let route_point_index = 0; route_point_index <= parseInt(vessel_port_position) - 1; route_point_index++) {
                passed_other_stations += parseInt(route_info.route_point.forward[route_point_index])
            }
            // in the list of lat-lng, the station index of just passed by =
            // vessel_port_position+1: Number of ports that have passed through
            //station_pass: How many stops are there on this stretch of the road
            //passed_other_stations: Total number of stations for the rest of the road
            //-1: Index needs to be minus 1 based on numbers
            let station_just_pass = parseInt(vessel_port_position) + 1 + parseInt(station_pass) + parseInt(passed_other_stations) - 1
            let res = {}
            if (surplus == 0) {
                res = route_info.route_geo[station_just_pass]
            } else {
                res = this.get_accurate_vessel_position(route_info.route_geo[station_just_pass], route_info.route_geo[station_just_pass + 1], surplus / segment_single)
            }
            return res

        },
        get_accurate_vessel_position(pos0, pos1, scale) {
            let lat0 = pos0.lat
            let lng0 = pos0.lng
            let lat1 = pos1.lat
            let lng1 = pos1.lng
            return {
                "lat": lat0 + (lat1 - lat0) * scale,
                "lng": lng0 + (lng1 - lng0) * scale
            }
        },
    },
};
</script>

<style scoped>

.leaflet-popup-content-wrapper {
    background: black;
    border-radius: 1px;
}

.vessel_tooltip {
    text-align: left;
}

.port_tooltip {
    text-align: left;
}

.name {
    font-weight: bold;
    font-size: 14px;
}
</style>
