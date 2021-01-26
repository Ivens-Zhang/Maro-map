<template>
<div style="
      min-height:150px; 
      padding:10px; 
      display:inline_block; 
    ">
    <div :id="chart_id" style="display:inline_block"></div>
</div>
</template>

<script>
import * as d3 from "d3";
import * as c3 from "c3";
import * as d3Collection from 'd3-collection';

function render_chart(chart_id, chartData) {
    // console.log(chart_id, chartData);

    let titles = Object.keys(chartData);
    const xArray = d3Collection
        .nest()
        .key((d) => {
            return d.x;
        })
        .entries(chartData[titles[0]])
        .map((d) => {
            return d.key;
        })
        .sort();
    const yArray = d3Collection
        .nest()
        .key((d) => {
            return d.y;
        })
        .entries(chartData[titles[0]])
        .map((d) => {
            return d.key;
        })
        .sort();

    let zMin = 0;
    let zMax = 0;
    for (let i = 0; i < chartData[titles[0]].length; i++) {
        if (chartData[titles[0]][i].z > zMax) {
            zMax = chartData[titles[0]][i].z;
        }
        if (chartData[titles[0]][i].z < zMin) {
            zMin = chartData[titles[0]][i].z;
        }
    }
    // console.log(xArray, yArray)

    const z = d3
        .scaleLinear()
        .range([1000, 0])
        .domain([zMin, zMax]);

    let drawSeries = [];
    for (let i = 0; i < chartData[titles[0]].length; i++) {
        drawSeries.push({
            x: xArray.indexOf(chartData[titles[0]][i].x),
            y: yArray.indexOf(chartData[titles[0]][i].y),
            z: chartData[titles[0]][i].z,
        });
    }

    let rectSpaceWidth = 1;
    let rectWidth = 1;
    if (xArray.length <= 100) {
        rectSpaceWidth = rectSpaceWidth * 2;
        rectWidth = 7;
    }
    if (xArray >= 1000) {
        rectSpaceWidth = 0.1;
        rectWidth = 1;
    }
    let rectHeight = rectWidth;
    let rectSpaceHeight = rectSpaceWidth;
    let chartWidth = (rectWidth + rectSpaceWidth) * xArray.length;
    let chartHeight = (rectHeight + rectSpaceHeight) * yArray.length;

    if (rectWidth <= 0) {
        rectWidth = 1;
    }
    if (rectHeight <= 0) {
        rectHeight = 1;
    }

    const margin = {
        top: 10,
        right: 20,
        bottom: 20,
        left: 20
    };

    let width = chartWidth + margin.left + margin.right;
    let height = chartHeight + margin.top + margin.bottom;

    const chartRoot = d3.select("#" + chart_id);
    chartRoot.selectAll('*').remove();
    const gRoot = chartRoot
        .append('svg')
        .attr('viewBox', '0,0,' + width + ',' + height)
        .append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    // #ee4d58 #5d7beb #76edf1
    // 238, 77, 88   93, 123, 235   118, 237, 241
    let color1 = {
        r: 238,
        g: 77,
        b: 88,
    };
    let color2 = {
        r: 93,
        g: 123,
        b: 235
    };
    let color3 = {
        r: 118,
        g: 237,
        b: 241
    };

    gRoot
        .append('g')
        .selectAll('g')
        .data(drawSeries)
        .join('g')
        .attr('class', 'heatRect')
        .attr('transform', d => {
            return 'translate(' + (rectWidth + rectSpaceWidth) * d.x + ',' + (rectHeight + rectSpaceHeight) * d.y + ')';
        })
        .on("mouseenter", (event, d) => {
            let x_id = `gf-from-${d.x}-label-${chart_id}-x`;
            let y_id = `gf-from-${d.y}-label-${chart_id}-y`;
            // console.log("heat", event, x_id, y_id);
            d3.select(`#${x_id}`).style('fill', '#ffffff88');
            d3.select(`#${y_id}`).style('fill', '#ffffff88');

        })
        .on("mouseleave", (event, d) => {
            let x_id = `gf-from-${d.x}-label-${chart_id}-x`;
            let y_id = `gf-from-${d.y}-label-${chart_id}-y`;
            // console.log("heat", event, x_id, y_id);
            d3.select(`#${x_id}`).style('fill', 'transparent');
            d3.select(`#${y_id}`).style('fill', 'transparent');

        })
        .append('rect')
        .attr('width', rectWidth)
        .attr('height', rectHeight)
        .style('fill', d => {
            if (d.z == 0) {
                return `rgba(${color3.r}, ${color3.g}, ${color3.b}, 0.2)`;
            }
            let rate = z(d.z) / 1000;
            let to = color3;
            let from = color1;
            if (rate <= 0.5) {
                to = color2;
            } else {
                from = color2;
                rate -= 0.5;
            }
            rate *= 2;

            return d3.rgb(from.r + (to.r - from.r) * rate, from.g + (to.g - from.g) * rate, from.b + (to.b - from.b) * rate);
        })

        .append('title')
        .text(d => {
            return 'from :' + xArray[d.x] + '\n' + 'to :' + yArray[d.y] + '\n' + titles[0] + ' :' + d.z;
        });
    gRoot
        .selectAll('.heatX')
        .data(xArray)
        .enter()
        .append('g')
        .attr('class', 'heatX')
        .attr('transform', (d, i) => {
            return 'translate(' + (rectWidth + rectSpaceWidth) * (i + 0.5) + ',' + (chartHeight + 5) + ')';
        })
        .append('text')
        .attr('id', (d, i) => {
            return `gf-from-${i}-label-${chart_id}-x`
        })

        .attr('transform', () => {
            return 'rotate(-90 ' + 0 + ',' + 0 + ')';
        })
        .style('fill', 'transparent')
        .attr('text-anchor', 'start')
        .text(d => {
            return d;
        });
    gRoot
        .selectAll('.heatY')
        .data(yArray)
        .enter()
        .append('g')
        .attr('class', 'heatY')

        .attr('transform', (d, i) => {
            return 'translate(' + (-10) + ',' + (rectHeight + rectSpaceHeight) * (i + 1) + ')';
        })
        .append('text')
        .style('fill', 'transparent')
        .attr('id', (d, i) => {
            return `gf-from-${i}-label-${chart_id}-y`
        })
        .attr('text-anchor', 'start')
        .text(d => {
            return d;
        });

}
export default {
    props: {
        title: String,
        line_data: Object,
        line_data_change: Number,
    },
    data: function () {
        return {};
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
            render_chart(this.chart_id, this.line_data);
        },
    },
};
</script>

<style>

</style>
