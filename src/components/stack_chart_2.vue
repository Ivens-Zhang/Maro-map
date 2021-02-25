<template>
<div style="
      font-size:8px; 
      font-family:Digital Sans EF; 
      min-height:200px; 
      padding:10px; 
      display:inline_block; 
    ">
    <div style="height:40px; " class="in_chart_select">
        <el-select v-model="cur_option" placeholder="select series" style="margin:10px; " size="mini">
            <el-option v-for="item in data_options" :key="item" :label="item" :value="item">
            </el-option>
        </el-select>
    </div>
    <div class="in_chart_select">
        <el-select v-model="view_range" placeholder="select view range" style="margin:10px; display:none; ">
            <el-option v-for="item in view_range_options" :key="item.range" :label="item.display" :value="item.range">
            </el-option>
        </el-select>
    </div>
    <div :id="chart_id" style="display:inline_block; "></div>
    <div :id="legend_id" style="display:inline_block; "></div>
</div>
</template>

<script>
import * as d3 from "d3";
import i18n from '@/plugins/i18n'

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

function render_chart(chart_id, legend_id, chartData, tick_converter, cur_pos = 0, range_option = 0) {
    // console.log(chart_id, legend_id, chartData); 

    let chart_width = 400;
    let chart_height = 200;
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
        .style("width", "100%")
        .append("svg")
        .attr("viewBox", "0,0," + chart_width + "," + chart_height)
        .append("g")
        .attr("transform", "translate(" + chart_margin.left + "," + chart_margin.top + ")");

    let x_min = Number.MAX_SAFE_INTEGER;
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

    let data_for_stack = new Object;
    let titles = Object.keys(chartData);
    for (let k = 0; k < titles.length; k++) {
        for (let j = 0; j < chartData[titles[k]].length; j++) {
            let push_data = {
                x: Number(chartData[titles[k]][j].x),
                y: Number(chartData[titles[k]][j].y),
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

            if (!data_for_stack.hasOwnProperty(push_data.x)) {
                data_for_stack[push_data.x] = new Object();
                data_for_stack[push_data.x].name = push_data.x;
            }
            data_for_stack[push_data.x][titles[k]] = push_data.y
        }
    }

    let data_list_for_stack = new Array();
    let x_ticks = Object.keys(data_for_stack);

    x_ticks.forEach(x_key => {
        data_list_for_stack.push(data_for_stack[x_key]);
        let t_y_max = 0;
        Object.keys(data_for_stack[x_key]).forEach(y_key => {
            t_y_max += data_for_stack[x_key][y_key];
        });
        if (t_y_max > y_max) {
            y_max = t_y_max;
        }
    });

    let x_tick_num = 4;
    let x_tick_shown = new Array();
    for (let i = 0; i < x_ticks.length; i += Math.floor(x_ticks.length / x_tick_num)) {
        x_tick_shown.push(x_ticks[i]);
    }

    let series = d3.stack()
        .keys(Object.keys(chartData))
        (data_list_for_stack)
        .map(d => (d.forEach(v => v.key = d.key), d));

    let e = chart_root.append("g");
    let x = d3.scaleBand()
        .domain(Object.keys(data_for_stack))
        .range([0, width])
        .paddingInner(0)
        .paddingOuter(0)
        .align(0);
    let y = d3.scaleLinear().range([height, 0]).domain([y_min, y_max]);

    x_scale_ref = x;
    y_scale_ref = y;
    y_range_max = y_max;
    y_range_min = y_min;

    e.append("g")
        .selectAll("g")
        .data(series)
        .join("g")
        .attr("fill", d => color(titles.indexOf(d.key)))
        .attr("stroke", "transparent")
        .attr("stroke-width", 0)
        .selectAll("rect")
        .data(d => d)
        .join("rect")
        .attr("x", (d, i) => x(d.data.name))
        .attr("y", d => y(d[1]))
        .attr("height", d => y(d[0]) - y(d[1]))
        .attr("width", x.bandwidth())
        .append("title")
        .text(d => `${d3.utcFormat("%Y/%m/%d")(tick_converter.get_time(d.data.name))}
${d.key} ${d.data[d.key]}`);

    let xAxis = d3.axisBottom().scale(x).tickValues(x_tick_shown).tickFormat(d => {
        let d_date = tick_converter.get_time(d);
        return d3.utcFormat("%Y/%m/%d")(d_date);
    });
    e.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(" + 0 + "," + height + ")")
        .style("fill", "#ffffff")
        .call(xAxis);

    let yAxis = d3.axisLeft().scale(y).ticks(5).tickFormat(d3.format(".2s"));
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
        .attr("class", "legend_zone");

    // 港口船舶表格图例
    for (let i = 0; i < titles.length; i++) {
        let title_zone = legend_root.append("div").attr("class", "legend_zone_item");
        title_zone
            .append("svg").attr("class", "legend_zone_item_content").attr("height", 10).attr("width", 10)
            .append("g").append("line").attr("x1", 0).attr("y1", 5).attr("x2", 10).attr("y2", 5).style("stroke", color(i)).style("stroke-width", 10);
        title_zone
            .append("label").attr("class", "legend_zone_item_content").text(i18n.t('stack_chart_2.' + titles[i]));
    }
    return e;

}

function render_position(cur_pos, chart_ref) {

    let cur_pos_data = [{
            x: cur_pos,
            y: y_range_min
        },
        {
            x: cur_pos,
            y: y_range_max
        }
    ];
    chart_ref.selectAll(".pos_line").remove();
    chart_ref.append("g")
        .attr("class", "pos_line")
        .datum(cur_pos_data)
        .append("path")
        .style("stroke-width", "1px")
        .style("stroke", "red")
        .style("fill", "red")
        .style("pointer-events", "none")
        .attr("d", function (d) {
            return line(d);
        });

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
            data_options: new Array(),
            cur_option: '',
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
            view_range: 100,
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
            // console.log("stack_data_2_change");
            this.data_options = Object.keys(this.line_data);

            if (this.data_options.length > 0) {
                if (this.data_options.includes(this.cur_option)) {
                    this.chart_ref = render_chart(this.chart_id, this.legend_id, this.line_data[this.cur_option], this.tick_converter, this.data_play_position, this.view_range);
                    this.chart_loaded = true;
                    if (this.data_play_position) {
                        render_position(this.data_play_position, this.chart_ref);
                    }
                } else {
                    this.cur_option = this.data_options[0];
                }
            }
        },
        cur_option: function (oldValue, newValue) {
            this.view_range = 100;
            this.chart_ref = render_chart(this.chart_id, this.legend_id, this.line_data[this.cur_option], this.tick_converter, this.data_play_position, this.view_range);
            this.chart_loaded = true;
            render_position(this.data_play_position, this.chart_ref);

        },
        data_play_position: function (oldValue, newValue) {
            if (this.chart_loaded) {
                render_position(newValue, this.chart_ref);
            }
        },
        view_range: function (oldValue, newValue) {
            if (oldValue != newValue) {
                this.chart_ref = render_chart(this.chart_id, this.legend_id, this.line_data[this.cur_option], this.tick_converter, this.data_play_position, this.view_range);
                this.chart_loaded = true;
            }
        }
    },
};
</script>

<style>

</style>
