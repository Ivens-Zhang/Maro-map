<template>
<div style="
      min-height:200px; 
      padding:10px; 
      display:inline_block; 
    ">
    <div class="chart_title">{{chart_title}}</div>
    <div :id="chart_id" style="display:inline_block"></div>
</div>
</template>

<script>
import * as d3 from "d3";
import * as c3 from "c3";
import * as d3Collection from 'd3-collection';

function gen_color(specifier) {
    var n = specifier.length / 6 | 0,
        colors = new Array(n),
        i = 0;
    while (i < n) colors[i] = "#" + specifier.slice(i * 6, ++i * 6);
    return colors;
}

let default_color = gen_color("97b7eeffc059");
let color = d3.scaleOrdinal(default_color);

function render_chart(chart_id, chartData) {
    // console.log(chart_id, chartData);

    let column = new Array();
    let y_min = 0;
    let y_max = Number.MIN_VALUE;
    let x_leng = 0;
    let t_column = chartData.sort((a, b) => b.y - a.y).slice(0, 10);
    t_column.forEach(element => {
        if (element.y > y_max) {
            y_max = element.y;
        }
        if (element.x.length > x_leng) {
            x_leng = element.x.length;
        }
    });
    column = t_column;

    let x = d3.scaleLinear()
        .domain([y_min, y_max])
        .rangeRound([0, 200]);

    let format = d3.format(".1%")
    let label_len = x_leng * 6

    // console.log(column)

    const margin = {
        top: 10,
        right: 20,
        bottom: 20,
        left: 40
    };

    let chartHeight = 200;
    let chartWidth = label_len + 200;

    let width = chartWidth + margin.left + margin.right;
    let height = chartHeight + margin.top + margin.bottom;

    let chartRoot = d3.select("#" + chart_id);
    chartRoot.selectAll('*').remove();
    let gRoot = chartRoot
        .append('svg')
        .attr('viewBox', '0,0,' + width + ',' + height)
        .append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    let bgs = gRoot
        .append('g')
        .selectAll("rect")
        .data(column)
        .join("rect")
        .attr('transform', (d, i) => {
            let t_x = label_len;
            let t_y = i * 20;
            return `translate(${t_x},${t_y})`
        })
        .attr('x', 0)
        .attr('y', 20)
        .attr('width', d => d.y == 0 ? 200 : (Math.sign(d.y - 0) * 200))
        .attr('height', 4)
        .attr('fill', (d, i) => color(i))
        .attr('opacity', 0.2)
        .append('title')
        .text(d => `${d.x}:${d.y}`);

    let bars = gRoot
        .append('g')
        .selectAll("rect")
        .data(column)
        .join("rect")
        .attr('transform', (d, i) => {
            let t_x = label_len;
            let t_y = i * 20;
            return `translate(${t_x},${t_y})`
        })
        .attr('x', d => x(Math.min(d.y, 0)))
        .attr('y', 20)
        .attr('width', d => Math.abs(x(d.y) - x(0)))
        .attr('height', 4)
        .attr('fill', (d, i) => color(i))
        .append('title')
        .text(d => `${d.x}:${d.y}`);

    let marks = gRoot
        .append("g")
        .selectAll("text")
        .data(column)
        .join("text")
        .attr('transform', (d, i) => {
            let t_x = label_len;
            let t_y = i * 20;
            return `translate(${t_x},${t_y})`
        })
        .attr("text-anchor", d => d.y < 0 ? "start" : "end")
        .attr("x", d => d.y == 0 ? 200 : (Math.sign(d.y - 0) * 200))
        .attr("y", 14)
        .attr("dy", "0.35em")
        .style('fill', '#e6f0fd')
        .style("font-size", 10)
        .text(d => format(x(d.y) / 200));

    let labels = gRoot
        .append("g")
        .selectAll("text")
        .data(column)
        .join("text")
        .attr('transform', (d, i) => {
            let t_x = label_len;
            let t_y = i * 20;
            return `translate(${t_x},${t_y})`
        })
        .attr("text-anchor", d => d.y >= 0 ? "end" : "start")
        .attr("x", d => d.y >= 0 ? -9 : 9)
        .attr("y", 20)
        .attr("dy", "0.35em")
        .style("font-size", 14)
        .text(d => d.x);

}
export default {
    props: {
        title: String,
        line_data: Object,
        line_data_change: Number,
    },
    data: function () {
        return {
            chart_title: '',
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
            // console.log("line_data_change")
            this.chart_title = `by ${Object.keys(this.line_data)[0]}`
            render_chart(this.chart_id, Object.values(this.line_data)[0]);
        },
    },
};
</script>

<style>

</style>
