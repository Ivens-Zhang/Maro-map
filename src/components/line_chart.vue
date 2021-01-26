<template>
<div style="font-size:8px;">
    <el-select v-model="view_range" placeholder="select view range" style="margin:10px; ">
        <el-option v-for="item in view_range_options" :key="item.range" :label="item.display" :value="item.range">
        </el-option>
    </el-select>
    <div :id="chart_id" style="display:inline_block; ">{{ title }}</div>
    <div :id="legend_id" style="display:inline_block; width:580px; 
      "></div>
</div>
</template>

<script>
import * as d3 from "d3";

function gen_color(specifier) {
    var n = specifier.length / 6 | 0,
        colors = new Array(n),
        i = 0;
    while (i < n) colors[i] = "#" + specifier.slice(i * 6, ++i * 6);
    return colors;
}

let default_color = gen_color("97b7eeffc05993d586da393cf99841");
let color = d3.scaleOrdinal(default_color);

let x_scale_ref = new Object();
let y_scale_ref = new Object();
let y_range_max = 0;
let y_range_min = 0;
let line = d3
    .line()
    .x(function (d) {
        return x_scale_ref(d.x);
    })
    .y(function (d) {
        return y_scale_ref(d.y);
    });

function render_chart(chart_id, legend_id, all_chart_data, tick_converter, cur_pos = 0, range_option = 0) {
    // console.log(chart_id, legend_id, all_chart_data); 
    let chart_width = 300;
    let chart_height = 150;
    let chart_margin = {
        left: 30,
        top: 10,
        right: 10,
        bottom: 20,
    };
    d3.select("#" + chart_id)
        .selectAll("*")
        .remove();
    d3.select("#" + legend_id)
        .selectAll("*")
        .remove();
    var chart_root = d3
        .select("#" + chart_id)
        .style("width", "290px")
        .append("svg")
        .attr("viewBox", "0,0," + chart_width + "," + chart_height)
        .append("g")
        .attr("transform", "translate(" + chart_margin.left + "," + chart_margin.top + ")");

    let x_min = Number.MAX_VALUE;
    let x_max = 0;
    let y_min = 0;
    let y_max = 1;
    let width = chart_width - chart_margin.left - chart_margin.right;
    let height = chart_height - chart_margin.top - chart_margin.bottom;

    let x_filter = false;
    let x_filter_min = 0;
    let x_filter_max = 0;
    if (range_option != 0) {
        x_filter = true;
        x_filter_min = cur_pos - range_option / 2;
        if (x_filter_min < 0) {
            x_filter_min = 0;
        }
        x_filter_max = x_filter_min + range_option;
    }
    let chart_data = new Object();
    let titles = Object.keys(all_chart_data);
    for (let k = 0; k < titles.length; k++) {
        chart_data[titles[k]] = new Array();
        for (let j = 0; j < all_chart_data[titles[k]].length; j++) {
            let push_data = {
                x: Number(all_chart_data[titles[k]][j].x),
                y: Number(all_chart_data[titles[k]][j].y),
            };

            if (x_filter) {
                if (push_data.x > x_filter_max || push_data.x < x_filter_min) {
                    continue;
                }
            }

            if (push_data.x > x_max) {
                x_max = push_data.x;
            }
            if (push_data.x < x_min) {
                x_min = push_data.x;
            }
            if (push_data.y > y_max) {
                y_max = push_data.y;
            }
            if (push_data.y < y_min) {
                y_min = push_data.y;
            }
            chart_data[titles[k]].push(push_data);
        }

    }

    let c_ret = chart_root
        .append("rect")
        .attr("width", width)
        .attr("height", height)
        .style("fill", "transparent")
        .style("pointer-events", "all")
        .on("mousemove", function (event) {
            let tick = Math.floor(x.invert(d3.pointer(event, this)[0]));
            // console.log("tick", tick, d3.pointer(event));
            let title_str = `${d3.utcFormat("%Y/%m/%d")(tick_converter.get_time(tick))}`;
            for (let i = 0; i < titles.length; i++) {
                title_str += `${titles[i]}:${chart_data[titles[i]][tick].y}`
            }

            c_title.text(title_str);
        });
    let c_title = c_ret.append("title");
    let e = chart_root.append("g");
    let x = d3.scaleLinear().range([0, ruler_width]).domain([x_min, x_max]);
    let y = d3.scaleLinear().range([height, 0]).domain([y_min, y_max]);

    x_scale_ref = x;
    y_scale_ref = y;
    y_range_max = y_max;
    y_range_min = y_min;

    for (let i = 0; i < titles.length; i++) {
        e.append("g")
            .datum(chart_data[titles[i]])
            .append("path")
            .style("stroke-width", "1px")
            .style("stroke", color(i))
            .style("fill", "none")
            .style("pointer-events", "none")
            .attr("d", function (d) {
                return line(d);
            });
    }

    let xAxis = d3.axisBottom().scale(x).ticks(3).tickFormat(d => {
        let d_date = tick_converter.get_time(d);
        return d3.utcFormat("%Y/%m/%d")(d_date);
    });
    e.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(" + 0 + "," + height + ")")
        .style("fill", "#ffffff")
        .call(xAxis);

    let yAxis = d3.axisLeft().scale(y).ticks(5);
    chart_root
        .append("g")
        .attr("class", "y axis")
        .attr("transform", "translate(" + 0 + "," + 0 + ")")
        .style("fill", "#ffffff")
        .call(yAxis);

    let legend_width = 300;
    let legend_height = 150;
    let legend_margin = {
        left: 10,
        top: 10,
        right: 10,
        bottom: 10,
    };

    let legend_root = d3
        .select("#" + legend_id)
        .style("width", "100%")
        .attr("class", "legend_zone");
    for (let i = 0; i < titles.length; i++) {
        let title_zone = legend_root.append("div").attr("class", "legend_zone_item");
        title_zone
            .append("svg").attr("class", "legend_zone_item_content").attr("height", 10).attr("width", 10)
            .append("g").append("line").attr("x1", 0).attr("y1", 5).attr("x2", 10).attr("y2", 5).style("stroke", color(i)).style("stroke-width", 10);
        title_zone
            .append("label").attr("class", "legend_zone_item_content").text(titles[i]);
    }
    return e;

}
export default {
    props: {
        title: String,
        line_data: Object,
        line_data_change: Number,
        data_play_position: Number,
        tick_converter: Object,
    },
    data: function () {
        return {
            chart_loaded: false,
            chart_ref: new Object(),
            view_range_options: [{
                    range: 0,
                    display: "all"
                },
                {
                    range: 50,
                    display: "50"
                },
                {
                    range: 100,
                    display: "100"
                },
                {
                    range: 200,
                    display: "200"
                },
            ],
            view_range: 0,
        };
    },
    methods: {},
    computed: {
        chart_id: function () {
            return `chart_${this._uid}`;
        },
        legend_id: function () {
            return `legend_${this._uid}`;
        },
    },
    watch: {
        line_data_change: function (oldValue, newValue) {
            // console.log("line_data_change"); 
            this.chart_ref = render_chart(this.chart_id, this.legend_id, this.line_data, this.tick_converter);
            this.chart_loaded = true;
            this.chart_ref.selectAll(".pos_line").remove();
        },
        data_play_position: function (oldValue, newValue) {
            if (this.chart_loaded) {
                if (this.view_range != 0) {
                    this.chart_ref = render_chart(this.chart_id, this.legend_id, this.line_data, this.tick_converter, this.data_play_position, this.view_range);
                }
                let cur_pos = newValue;
                let cur_pos_data = [{
                        x: cur_pos,
                        y: y_range_min
                    },
                    {
                        x: cur_pos,
                        y: y_range_max
                    }
                ];
                this.chart_ref.selectAll(".pos_line").remove();
                this.chart_ref.append("g")
                    .attr("class", "pos_line")
                    .datum(cur_pos_data)
                    .append("path")
                    .style("stroke-width", "1px")
                    .style("stroke", "red")
                    .style("fill", "red")
                    .style("pointer-events", "none")
                    .attr("d", function (d) {
                        // console.log(line(d)); 
                        return line(d);
                    });
            }
        },
        view_range: function (oldValue, newValue) {
            if (oldValue != newValue) {
                this.chart_ref = render_chart(this.chart_id, this.legend_id, this.line_data, this.tick_converter, this.data_play_position, this.view_range);
                this.chart_loaded = true;
                this.chart_ref.selectAll(".pos_line").remove();
            }
        }
    },
};
</script>

<style>

</style>
