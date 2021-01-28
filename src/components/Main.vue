<template>
<div id="app" :key="componentKey">
    <div style="position: absolute; left: 0%; width: 100%; height:100%; z-index:2000;">
        <VueLeaflet style="background-color:rgb(8,18,23)"
        v-bind:snapshot_number="snapshot_number_active" 
        v-bind:route_index="route_index" 
        v-bind:epoch="epoch"
        v-bind:port_index="port_index"
        v-bind:play_count="play_count"
        :providerUrl="this.$t('normal.providerUrl')"
        ></VueLeaflet>
    </div>
    <div style="
    color:#dee4ec;position:absolute;font-size:13px;z-index:10000;line-height:20px;
    top:2%;margin-left:300px;width:200px;font-family:'Digital Sans EF'">
        <div style="display:inline-flex;">{{$t('normal.route')}}:</div>
        <el-select  style="background:#dee4e;" v-model="selected_route" size="mini" multiple :placeholder="this.$t('normal.selectRoute')">
            <el-option v-for="x in route_data" :key="x.name" :label="x.name" :value="x.name"></el-option>
        </el-select>
    </div>
    <div style="
    color:#dee4ec;position:absolute;font-size:13px;z-index:10000;line-height:20px;
    top:2%;margin-left:500px;width:250px;font-family:'Digital Sans EF'">
        <div style="display:inline-flex;">{{$t('normal.epoch')}}:</div>
        <el-select style="background:#dee4e;" v-model="epoch" size="mini">
            <el-option v-for="x in epoch_index_list" :key="x" :label="x" :value="x"></el-option>
        </el-select>
    </div>
    <div style="
    color:#dee4ec;position:absolute;font-size:13px;z-index:10000;line-height:20px;
    top:2%;margin-left:685px;width:300px;font-family:'Digital Sans EF'">
        <div style="display:inline-flex;">{{$t('normal.port')}}:</div>
        <el-select style="background:#dee4e;" v-model="selected_port" size="mini" multiple :placeholder="this.$t('normal.selectPort')">
            <el-option v-for="x in port_data" :key="x.name" :label="x.name" :value="x.name"></el-option>
        </el-select>
    </div>
    <div class="slideBar">
        <div style="z-index:11000;display:inline-flex;">
            <div style="z-index:11000;display:inline-flex;justify-content:center;align-items:center;">
                <div style="z-index:12000" v-bind:class="{'classPause':!isPlay,'classPlay':true}" @click="toggle">
                </div>
            </div>
            <div style="z-index:11000;justify-content:center;align-items:center;">
                <HistogramSlider style="opacity:1.0;z-index:12000;" :width="1100" :data="data" :prettify="prettify" :drag-interval="true" :force-edges="false" :colors="['#4facfe', '#00f2fe']" :min="new Date(2014, 11, 24).valueOf()" :max="new Date(2017, 11, 24).valueOf()" :handle-size="13" @finish="finish" />
                <div :style="cssVars" class="play_progress"></div>
            </div>
        </div>
    </div>
    <div class="languageSwitch" style="
    color:#dee4ec;position:absolute;font-size:13px;z-index:10000;line-height:25px;
    top:2%;margin-left:960px;width:250px;font-family:'Digital Sans EF';cursor: pointer;" @click="changeLanguageValue">
        <!-- <el-tooltip :content="'Switch value: ' + languageValue" placement="top" style="display:inline-flex;">
        <el-switch
            v-model="languageValue"
            active-color="rgb(126,39,56)"
            inactive-color="rgb(26,39,56)"
            active-text="zh"
            inactive-text="en"
            @change="changeLanguageValue">
        </el-switch>
        </el-tooltip> -->
        <div style="width:110px;border: 1px solid white">
            {{ $t('normal.changeLanguage') }}
        </div>
    </div>

    <maro_ext :start_date="start_date" :end_date="end_date" :data_start="data_start_percent" :data_end="data_end_percent" :data_play_percent="snapshot_number_active" :epoch="epoch" ></maro_ext>

</div>
</template>

<script>
import VueLeafLet from "../components/VueLeaflet.vue"
import VueLeaflet from '../components/VueLeaflet.vue';
import maro_ext from "../components/maro_ext.vue";
import HistogramSlider from "../components/histogram/HistogramSlider.vue";
import * as d3 from "d3"

export default {
    name: "Main",
    components: {
        VueLeaflet: VueLeaflet,
        maro_ext: maro_ext,
        HistogramSlider: HistogramSlider,
        d3:d3,
    },

    data() {
        return {
            data: new Array(),
            componentKey: 0,
            languageValue: false,
            prettify: this.getPrettify,
            // start point of selected window
            data_start_percent: 0, 
            // end point of selected window
            data_end_percent: 1119, 
            // calculated index list (to play)
            play_index_result: new Object, 
            //name of selected route
            selected_route: "", 
            // route data
            route_data: new Array(),
            // index of selected route
            route_index: new Array(),
            // play or not
            isPlay: true, 
            // distance of the cursor to the start of slidebar
            left_margin: 0,
            // setInterval object
            fix_index_interval: null, 
            // play status
            play_status: 0, 
            // play index list
            index_list: new Array(),
            // The current active snapshot number is also used to calculate
            // the distance between the play vertical line and the slidebar's left starting point
            snapshot_number_active: 0, 
            // which index is active in play_index_list
            play_count: 0, 
            // epoch selection result
            epoch: 0, 
            // epoch selection candidates
            epoch_index_list: [0, 499],
            // port data
            port_data:new Array(),
            // selected port list
            selected_port:"",
            // selected port index list
            port_index:new Array(),
            start_date: new Date,
            end_date: new Date,

        };
    },
    computed: {
        languageValue () {
            return localStorage.getItem('lang') === 'en'
        },
        cssVars() {
            return {
                '--left-margin': this.left_margin + 'px',
                'pointer-events': 'none',
                'opacity': (this.isPlay && this.play_count == 0) ? 0 : 1,
            }
        },
    },
    mounted: () => {
    },
    // beforeCreate() {
    //     // 设置语言初始值
    //     localStorage.setItem('lang', 'zh')
    // },
    created: async () => {
        let data_list = await d3.json("/static/data/data_slider.json")
        this.data = data_list.map(d => new Date(d));
        let route_list = await d3.json('/static/data/route.json');
        this.route_data = route_list.map(d=>{
            return {
                "id": d.id,
                "name": d.name
            }
        });
        let port_list = await d3.json('/static/data/port.json');
        this.port_data = port_list.map(d=>{
            return {
                "id": d.id,
                "name": d.name
            }
        });
        this.start_date = d3.min(this.data);
        this.end_date = d3.max(this.data);
    },
    watch: {
        epoch() {
            this.epoch = parseInt(this.epoch)
            this.snapshot_number_active = 0
        },
        selected_route: {
            handler(val, oldVal) {
                let route_list = JSON.parse(JSON.stringify(val))
                this.route_index=[]
                for(let item in route_list){
                    
                    for(let standard_route in this.route_data){
                        let index=JSON.parse(JSON.stringify(standard_route))
                        if(this.route_data[index].name==route_list[item]){
                            
                            this.route_index.push(item)
                        }
                    }
                }
                JSON.parse(JSON.stringify(this.route_index))
            },
            immediate: true,
            deep: true
        },
        selected_port: {
            handler(val, oldVal) {
                let port_list = JSON.parse(JSON.stringify(val))
                this.port_index=[]
                for(let item in port_list){
                    for(let standard_port in this.port_data){
                        let index=JSON.parse(JSON.stringify(standard_port))
                        if(this.port_data[index].name==port_list[item]){
                            
                            this.port_index.push(item)
                        }
                    }
                }
                JSON.parse(JSON.stringify(this.port_index))
            },
            immediate: true,
            deep: true
        },
        play_index_result() {
            var playList = JSON.parse(JSON.stringify(this.play_index_result))
            this.index_list = playList['index']
            this.play_status = playList['status']
        },
        play_status() {
            let that = this
            let count;
            if (this.play_status == 1 && this.index_list != []) {
                count = Math.max(that.play_count, 0)
                this.fix_index_interval = setInterval(function () {
                    that.snapshot_number_active = that.index_list[count]
                    that.play_count = count
                    count++;
                    if (count >= that.index_list.length) count = 0;
                }, 750);

            } else {
                clearInterval(this.fix_index_interval);
            }
        },
        snapshot_number_active() {
            this.left_margin = (this.snapshot_number_active / 1120) * 1087
        }
    },

    methods: {
        getPrettify (ts) {
            if (localStorage.getItem('lang') === 'en') {
                return new Date(ts).toLocaleDateString("en", {
                    year: "numeric",
                    month: "short",
                    day: "numeric"
                });
            }
            return new Date(ts).toLocaleDateString("cn", {
                year: "numeric",
                month: "short",
                day: "numeric"
            });
        },
        changeLanguageValue () {
            // this.languageValue = !this.languageValue
            localStorage.getItem('lang') === 'en' ? localStorage.setItem('lang', 'zh') : localStorage.setItem('lang', 'en')
            location.reload()
        },
        toggle() {
            this.isPlay = !this.isPlay
            if (!this.isPlay) {
                let playIndexList = []
                let playListRes = {}
                for (let index = this.data_start_percent; index < this.data_end_percent; index++) {
                    playIndexList.push(index)
                }
                this.play_index_result = {
                    "status": 1,
                    "index": playIndexList
                }
            } else {
                this.play_index_result = {
                    "status": 0,
                    "index": []
                }
            }
        },
        finish(val) {
            if (!this.isPlay) {
                this.toggle();
            }
            this.play_count = 0
            this.data_start_percent = Math.floor(val.from_percent * 11.2);
            this.data_end_percent = Math.floor(val.to_percent * 11.2);
            if (this.snapshot_number_active < this.data_start_percent) {
                this.snapshot_number_active = this.data_start_percent;
            }
            if (this.snapshot_number_active > this.data_end_percent) {
                this.snapshot_number_active = this.data_end_percent;
            }
        },

    },
};
</script>

<style scoped>
#app {
    width: 100%;
    height: 100%;
    background-color: black;
    font-size: 11px;
    line-height: 20px;
}

.slideBar {
    position: absolute;
    z-index: 10000;
    bottom: 0%;
    width: 100%;

}

.classPlay {
    width: 50px;
    height: 50px;
    margin: 10px;
    transform: translateY(-7px);
    background: transparent;
    border: none;
    outline: none;
    position: relative;
    font-size: 20px;
    cursor: pointer;
}

.classPlay:before {
    content: "";
    position: absolute;
    top: 15px;
    left: 15px;
    height: 0px;
    border-style: solid;
    border-width: 10px 0 10px 20px;
    border-color: transparent transparent transparent #eeeeee;
    transition: 0.218s ease;
}

.classPlay.classPause:before {
    height: 20px;
    border-width: 0px 10px 0px 0px;
    border-color: #eeeeee #eeeeee #eeeeee #eeeeee;
}

.classPlay:after {
    content: "";
    position: absolute; 
    background: inherit;
    width: 0px;
    height: 0px;
    top: 25px;
    left: 30px;
    transition: 0.218s ease;
    border-style: solid;
    border-width: 0px 0px 0px 0px;
    border-color: #eeeeee #eeeeee #eeeeee #eeeeee;
}

.classPlay.classPause:after {
    height: 20px;
    width: 0px;
    top: 15px;
    border-width: 0px 0px 0px 10px;
    border-color: #eeeeee #eeeeee #eeeeee #eeeeee;
}

.play_progress {
    background: url('../assets/arrow.png');
    background-size: contain;
    background-repeat: no-repeat;
    margin-left: var(--left-margin);
    position: relative;
    z-index: 6;
    width: 12px;
    height: 22px;
    transform: translateY(-35px) translateX(5px);
}
</style>