<template>
<el-container style="
      position:absolute; left:0%; top:0%; 
      width:100%; height:100%; z-index:2000; 
      background:none; 
      pointer-events:none; 
      color:#ffffff; 
      font-family:Digital Sans EF,; 
    " :id="frame_id">
    <el-header style="text-align:center; pointer-events:none; ">
        <el-row>
            <el-col :span="20" id="header_left">
                <div class="grid-content">
                </div>
            </el-col>
            <el-col :span="4" id="header_right">
                <div class="grid-content"></div>
            </el-col>
        </el-row>
    </el-header>
    <el-container style="pointer-events:none; background:none; position:relative; ">
        <el-aside :width="current_width_l+'px'" style="pointer-events:all; align-self:center;  left:0%; position:relative; ">
            <el-tabs type="card">
                <el-tab-pane :label="this.$t('normal.busyRanklist')">
                    <rank_list_2 :title="'line'" :line_data="play_single_line_cap" :line_data_change="play_data_change"></rank_list_2>
                    <rank_list_2 :title="'port'" :line_data="play_single_port_cap" :line_data_change="play_data_change"></rank_list_2>
                </el-tab-pane>
                <el-tab-pane :label="this.$t('normal.ladenTransfer')">
                    <heatmap :title="'laden_transfer'" :line_data="full_laden_from_to" :line_data_change="play_data_change"></heatmap>
                </el-tab-pane>
            </el-tabs>
            <zoom_btn style="top:10px; right:10px; position:absolute" :width_options="width_options" :current_option="current_width_l" v-on:width_change="width_change_left" />
        </el-aside>
        <el-aside :width="current_width_r+'px'" style="pointer-events:all; position:absolute; align-self:center; right:0%; ">
            <el-tabs type="card">
                <el-tab-pane :label="this.$t('normal.businessMetrics')">
                    <stack_chart :title="'all_ports'" :line_data="range_all_ports_shortage_fulfill" :line_data_change="range_data_change" :data_play_position="data_play_percent" :tick_converter="cur_tick_converter"></stack_chart>
                </el-tab-pane>
                <el-tab-pane :label="this.$t('normal.port')">
                    <stack_chart_2 :title="'port_container'" :line_data="range_single_port_metrics" :line_data_change="range_data_change" :data_play_position="data_play_percent" :tick_converter="cur_tick_converter"></stack_chart_2>
                </el-tab-pane>
                <el-tab-pane :label="this.$t('normal.vessel')">
                    <stack_chart_2 :title="'vessel_container'" :line_data="range_single_vessel_metrics" :line_data_change="range_data_change" :data_play_position="data_play_percent" :tick_converter="cur_tick_converter"></stack_chart_2>
                </el-tab-pane>
            </el-tabs>
            <zoom_btn style="top:10px; right:10px; position:absolute" :width_options="width_options" :current_option="current_width_r" v-on:width_change="width_change_right" />
        </el-aside>
    </el-container>
    <el-footer style="height:80px; pointer-events:none; background:none; ">
    </el-footer>
</el-container>
</template>

<script>
import * as d3 from "d3";
import stack_chart from "./stack_chart.vue";
import stack_chart_2 from "./stack_chart_2.vue";
import rank_list_2 from "./rank_list_2.vue";
import heatmap from "./heatmap.vue";
import zoom_btn from "./zoom_btn.vue";

class tick_to_time {
    constructor(start_time, end_time) {
        this.start_time = start_time;
        this.end_time = end_time;
        this.tick_delta = 24 * 60 * 60 * 1000;
    }

    get_time(tick) {
        let tick_time = new Date(this.start_time.getTime() + tick * this.tick_delta);
        if (tick_time > this.end_time) {
            tick_time = this.end_time;
        }
        if (tick_time < this.start_time) {
            tick_time = this.start_time;
        }
        return tick_time;
    }
}

export default {
    props: {
        data_start: Number,
        data_end: Number,
        data_play_percent: Number,
        epoch: Number,
        start_date: Date,
        end_date: Date,
    },
    data: function () {
        return {
            range_all_ports_shortage_fulfill: new Object(), //over all shortage fulfill
            range_single_port_metrics: new Object(), // port empty full remain
            range_single_vessel_metrics: new Object(), // vessel empty full remain
            play_single_line_cap: new Object(),
            play_single_port_cap: new Object(),
            full_laden_from_to: new Object(),
            play_data_change: 0,
            range_data_change: 0,
            data_loaded: false,
            raw_port_data: new Array(),
            raw_ship_data: new Array(),
            org_data: new Object,
            width_options: [300, 600],
            current_width_l: 300,
            current_width_r: 300,
            play_cache: {
                data_start: 0,
                data_end: 0,
                data_play_percent: 0,
                epoch: 0,
                play_route_data: new Object(),
                ship_caps: new Object(),
                play_port_data: new Object(),
                port_trans: new Object(),
            },
            range_cache: {
                data_start: 0,
                data_end: 0,
                data_play_percent: 0,
                epoch: 0,
            },
            vessel_ref_data: new Object,
            port_ref_data: new Object,
            decisions: new Array(),
            orders: new Array(),
            ship_names: new Array(),
            port_names: new Array(),
            route_names: new Array(),
            operations: new Array(),
            operation_executing: false,
            cur_tick_converter: new Object,
        };
    },
    methods: {
        async update_range_data(data_start, data_end, data_play_percent, epoch) {
            // load all data
            //console.log("1", data_start, data_end, data_play_percent, epoch);
            if (!this.data_loaded) {
                this.data_loaded = true;
                this.vessel_ref_data = await d3.json(`/static/data/all.json`);
                this.port_ref_data = await d3.json(`/static/data/port.json`);
                this.ship_names = Object.keys(this.vessel_ref_data.vessels);
                this.port_names = this.port_ref_data.map(x => x.tooltip);
                this.route_names = Object.keys(this.vessel_ref_data.routes);
            }

            // load range data
            let start = 0;
            let end = data_play_percent + 50;
            if (end > data_end) {
                end = data_end
            }
            if (this.range_cache.data_start <= data_start && this.range_cache.data_play_percent >= data_play_percent && this.range_cache.epoch == epoch) {
                //no action
            } else if (this.range_cache.data_start <= data_start && this.range_cache.data_play_percent < data_play_percent && this.range_cache.epoch == epoch) {
                start = this.range_cache.data_play_percent + 1;
            } else {
                this.raw_port_data = new Array();
                this.raw_ship_data = new Array();
                this.decisions = new Array();
                this.orders = new Array();

            }

            this.range_cache.data_start = data_start;
            this.range_cache.data_play_percent = data_play_percent;
            this.range_cache.epoch = epoch;

            let temp_port_data = new Array();
            let temp_ship_data = new Array();
            let temp_decisions = new Array();
            let temp_orders = new Array();

            // console.log("async operations", start, end);

            for (let i = start; i < end; i++) {
                temp_port_data.push(await d3.json(`/static/data/epoch_${epoch}/port_run_data/port_run_${i}.json`));
                temp_ship_data.push(await d3.json(`/static/data/epoch_${epoch}/vessel_run_data/vessel_run_${i}.json`));
                try {
                    const response = await fetch(`/static/data/epoch_${epoch}/decision_run_data/decision_run_${i}.json`);
                    if (!response.ok) {
                        temp_decisions.push(new Array());
                    } else {
                        try {
                            const response_data = await response.json();
                            temp_decisions.push(response_data);
                        } catch (e) {
                            temp_decisions.push(new Array());
                        }
                    }
                } catch (error) {
                    temp_decisions.push(new Array());
                }
                try {
                    const response = await fetch(`/static/data/epoch_${epoch}/order_run_data/order_run_${i}.json`);
                    if (!response.ok) {
                        temp_orders.push(new Array());
                    } else {
                        try {
                            const response_data = await response.json();
                            temp_orders.push(response_data);
                        } catch (e) {
                            temp_orders.push(new Array());
                        }
                    }
                } catch (error) {
                    temp_orders.push(new Array());
                }
            }

            //cal range data

            this.raw_port_data = this.raw_port_data.concat(temp_port_data);
            this.raw_ship_data = this.raw_ship_data.concat(temp_ship_data);
            this.decisions = this.decisions.concat(temp_decisions);
            this.orders = this.orders.concat(temp_orders);

            start = data_play_percent - 50;
            if (start < data_start) {
                start = data_start;
            }
            // console.log("async operations completed", start, end);

            // generate range_all_ports_shortage_fulfill, range_single_port_metrics
            let range_all_ports_data = new Array();
            let range_single_port_data = new Object();

            for (let i = start; i < end; i++) {
                let fulfillment = 0;
                let shortage = 0;
                let tick_data = this.raw_port_data[i];

                for (let j = 0; j < tick_data.length; j++) {
                    fulfillment += tick_data[j].fulfillment;
                    shortage += tick_data[j].shortage;
                    if (!range_single_port_data.hasOwnProperty(tick_data[j].port_name)) {
                        range_single_port_data[tick_data[j].port_name] = {
                            full: new Array(),
                            empty: new Array(),
                        };
                    }
                    range_single_port_data[tick_data[j].port_name].full.push({
                        x: i,
                        y: tick_data[j].full,
                    })
                    range_single_port_data[tick_data[j].port_name].empty.push({
                        x: i,
                        y: tick_data[j].empty,
                    })
                }
                range_all_ports_data.push({
                    index: i,
                    fulfillment: fulfillment,
                    shortage: shortage
                })
            }
            // console.log("range_all_ports_data", range_all_ports_data)
            let list_fulfillment = new Array();
            let list_shortage = new Array();
            let acc_fulfillment = 0;
            let acc_shortage = 0;
            for (let i = 0; i < range_all_ports_data.length; i++) {
                list_fulfillment.push({
                    x: range_all_ports_data[i].index,
                    y: range_all_ports_data[i].fulfillment,
                });
                list_shortage.push({
                    x: range_all_ports_data[i].index,
                    y: range_all_ports_data[i].shortage,
                });
            }
            this.range_all_ports_shortage_fulfill = {
                fulfillment: list_fulfillment,
                shortage: list_shortage,
            }
            this.range_single_port_metrics = range_single_port_data;

            // generate range_single_vessel_metrics:new Object(), // vessel empty full remain
            let range_vessel_data = new Object();

            for (let i = start; i < end; i++) {

                let tick_data = new Array();
                this.raw_ship_data[i].forEach(router => {
                    router.vessel.forEach(vessel => {
                        tick_data.push(vessel);
                    })
                })
                // console.log(tick_data)
                for (let j = 0; j < tick_data.length; j++) {
                    if (!range_vessel_data.hasOwnProperty(tick_data[j].name)) {
                        range_vessel_data[tick_data[j].name] = {
                            full: new Array(),
                            empty: new Array(),
                            remaining: new Array(),
                        };
                    }
                    range_vessel_data[tick_data[j].name].full.push({
                        x: i,
                        y: tick_data[j].full,
                    })
                    range_vessel_data[tick_data[j].name].empty.push({
                        x: i,
                        y: tick_data[j].empty,
                    })
                    range_vessel_data[tick_data[j].name].remaining.push({
                        x: i,
                        y: tick_data[j].capacity - tick_data[j].empty - tick_data[j].full,
                    })
                }
            }
            this.range_single_vessel_metrics = range_vessel_data;

            this.range_data_change += 1;
            // console.log("range_data_change", "this.range_all_ports_shortage_fulfill")
        },
        update_play_data(data_start, data_end, data_play_percent, epoch) {
            let start = data_start;
            let end = data_play_percent;

            if (this.play_cache.data_start == data_start && this.play_cache.data_play_percent < data_play_percent && this.play_cache.epoch == epoch) {
                start = this.play_cache.data_play_percent + 1;
            } else {
                this.play_cache.play_route_data = new Object();
                this.route_names.forEach(route_name => {
                    this.play_cache.play_route_data[route_name] = {
                        x: route_name,
                        y: 0,
                    };
                })
                this.play_cache.ship_caps = new Object();
                this.play_cache.play_port_data = new Object();
                this.play_cache.port_trans = new Object();
                this.port_names.forEach(port_name => {
                    this.play_cache.play_port_data[port_name] = 0;
                })
            }
            this.play_cache.data_start = data_start;
            this.play_cache.data_play_percent = data_play_percent;
            this.play_cache.epoch = epoch;

            // generate play_single_line_cap:new Object(),

            for (let i = start; i <= end; i++) {
                let elements = this.raw_ship_data[i];
                elements.forEach(element => {
                    if (!this.play_cache.play_route_data[element.name]) {
                        this.play_cache.play_route_data[element.name] = {
                            x: element.name,
                            y: d3.sum(element.vessel, d => d.capacity),
                        };
                    } else {
                        this.play_cache.play_route_data[element.name].y += d3.sum(element.vessel, d => d.capacity)
                    }

                    element.vessel.forEach(vessel => {
                        if (!this.play_cache.ship_caps[vessel.name]) {
                            this.play_cache.ship_caps[vessel.name] = new Array();
                        }
                        this.play_cache.ship_caps[vessel.name].push(vessel.capacity);
                    })
                });
            };
            this.play_single_line_cap = {
                route: Object.values(this.play_cache.play_route_data)
            };
            // generate play_single_port_cap:new Object(),

            for (let i = start; i <= end; i++) {
                this.decisions[i].forEach(element => {
                    let port_name = String(this.port_names[element.port_idx]);
                    let vessel_name = String(this.ship_names[element.vessel_idx]);
                    if (!this.play_cache.play_port_data[port_name]) {
                        this.play_cache.play_port_data[port_name] = 0;
                    }

                    this.play_cache.play_port_data[port_name] += d3.mean(this.play_cache.ship_caps[vessel_name]);
                });

            };

            this.play_single_port_cap["port"] = Object.keys(this.play_cache.play_port_data).map(d => {
                return {
                    x: d,
                    y: this.play_cache.play_port_data[d]
                };
            });

            // generate fake full_laden_from_to:new Object(),
            for (let i = start; i <= end; i++) {
                this.orders[i].forEach(element => {
                    let src_name = String(this.port_names[element.src_port_idx]);
                    let tar_name = String(this.port_names[element.dest_port_idx]);
                    let nums = element.quantity;
                    if (!this.play_cache.port_trans.hasOwnProperty(src_name)) {
                        this.play_cache.port_trans[src_name] = new Object;
                    }
                    if (!this.play_cache.port_trans[src_name].hasOwnProperty(tar_name)) {
                        this.play_cache.port_trans[src_name][tar_name] = 0;
                    }
                    this.play_cache.port_trans[src_name][tar_name] += nums;
                });

            };
            let full_trans_data = new Object();

            full_trans_data["laden_transfer"] = new Array();
            this.port_names.forEach(x_name => {
                this.port_names.forEach(y_name => {
                    let trans_data = {
                        x: x_name,
                        y: y_name,
                        z: 0,
                    };
                    if (this.play_cache.port_trans[x_name] && this.play_cache.port_trans[x_name][y_name]) {
                        trans_data.z = this.play_cache.port_trans[x_name][y_name];
                    }
                    full_trans_data["laden_transfer"].push(trans_data);
                })
            });
            this.full_laden_from_to = full_trans_data;
            this.play_data_change += 1;
        },
        width_change_left(d) {
            this.current_width_l = d;
        },
        width_change_right(d) {
            this.current_width_r = d;
        },
        side_panel_resize(e) {
            d3.selectAll(`.el-tab-pane`).style("max-height", `${d3.max([window.innerHeight-200,20])}px`);
        },
        async execute_operation() {
            if ((!this.operation_executing) && (this.operations.length > 0)) {
                this.operation_executing = true;
                await this.operations.shift()().finally(() => {
                    this.operation_executing = false;
                });
            }
        }
    },
    components: {
        d3,
        stack_chart,
        rank_list_2,
        heatmap,
        stack_chart_2,
        zoom_btn,
    },
    watch: {
        data_start: function (oldValue, newValue) {
            // console.log("data_start change")
            this.operations = new Array();
            this.operations.push(async () => {
                await this.update_range_data(newValue, this.data_end, this.data_play_percent, this.epoch).catch(reason => {
                    // console.log(reason);
                });
            });

        },
        data_end: function (oldValue, newValue) {
            // console.log("data_end change")
            this.operations = new Array();
            this.operations.push(async () => {
                await this.update_range_data(this.data_start, newValue, this.data_play_percent, this.epoch).catch(reason => {
                    // console.log(reason);
                });
            });
        },
        data_play_percent: function (oldValue, newValue) {
            // console.log(this.data_start, this.data_end, this.data_play_percent)
            this.operations.push(async () => {
                await this.update_range_data(this.data_start, this.data_end, newValue, this.epoch)
                    .then(() => {
                        this.update_play_data(this.data_start, this.data_end, newValue, this.epoch);
                    }, reason => {
                        // console.log(reason);
                    });
            });
        },
        epoch: function (oldValue, newValue) {
            this.raw_port_data = new Array();
            this.raw_ship_data = new Array();
            this.data_loaded = false;
            this.operations = new Array();
            this.operations.push(async () => {
                await this.update_range_data(this.data_start, this.data_end, this.data_play_percent, newValue)
                    .then(() => {
                        this.update_play_data(this.data_start, this.data_end, this.data_play_percent, newValue);
                    }, reason => {
                        // console.log(reason);
                    });
            });
            //this.update_play_data();
        }
    },
    mounted: function () {
        this.operations.push(async () => {
            await this.update_range_data(this.data_start, this.data_end, this.data_play_percent, this.epoch)
                .then(() => {
                    this.update_play_data(this.data_start, this.data_end, this.data_play_percent, this.epoch);
                }, reason => {
                    // console.log(reason);
                });
        });
        this.side_panel_resize(undefined);
        //console.log("cur_tick_converter", this.start_date, this.end_date)
        this.cur_tick_converter = new tick_to_time(this.start_date, this.end_date);
        setInterval(this.execute_operation, 100);
    },
    computed: {
        frame_id: function () {
            return `frame_${this._uid}`;
        }
    },
    created() {
        window.addEventListener("resize", this.side_panel_resize);
    },
    destroyed() {
        window.removeEventListener("resize", this.side_panel_resize);
    },

};
</script>

<style>

</style>
