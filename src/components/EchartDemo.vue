<template>
  <div>
    <div id="main"></div>
  </div>
</template>

<script>
import * as echarts from "echarts";

export default {
  props: {
    chartData: Array,
    legend: Array,
  },
  watch: {
    chartData: function (oldValue, newValue) {
      let fulfillmentArr = [];
      let shortageArr = [];
      newValue.forEach((item) => {
        fulfillmentArr.push(item.fulfillmentTickCount);
        shortageArr.push(item.shortageTickCount);
      });
      this.option.series[0].data = fulfillmentArr;
      this.option.series[1].data = shortageArr;

      // console.log(fulfillmentArr, shortageArr, 'fffffffff');
      this.bussinessMetricsChart.setOption(this.option);
    },
    legend: function (oldValue, newValue) {
      this.option.legend.data = newValue
      this.bussinessMetricsChart.setOption(this.option);
    }
  },
  data() {
    return {
      bussinessMetricsChart: null,
      option: {
        // title: {
        //   text: "堆叠区域图",
        // },
        tooltip: {
          trigger: "axis",
          axisPointer: {
            type: "cross",
            label: {
              backgroundColor: "#6a7985",
            },
          },
        },
        legend: {
          data: this.legend,
          x: "center", // 'center' | 'left' | {number},
          y: "bottom", // 'center' | 'bottom' | {number
          textStyle: {
            color: 'white'
          }
        },
        grid: {
          left: "3%",
          top: "13%",
          containLabel: true,
        },
        xAxis: {
          type: "category"
        },
        yAxis: [
          {
            type: "value",
          },
        ],
        series: [
          {
            name: this.legend[0], // 注意，这里把两个 series 对应的 name 写死了，分别是 legend 的第 0、1 项
            type: "line",
            stack: "总量",
            areaStyle: {},
            emphasis: {
              focus: "series",
            },
            data: [120, 132, 101, 134, 90, 230, 210],
          },
          {
            name: this.legend[1],
            type: "line",
            stack: "总量",
            areaStyle: {},
            emphasis: {
              focus: "series",
            },
            data: [220, 182, 191, 234, 290, 330, 310],
          },
        ],
      },
    };
  },
  methods: {
    renderChart(id) {
      this.bussinessMetricsChart = echarts.init(document.getElementById(id));
      this.bussinessMetricsChart.setOption(this.option);
    },
  },
  mounted() {
    // var chartDom = document.getElementById("main");
    // var myChart = echarts.init(chartDom);
    // option && myChart.setOption(option);
    this.$nextTick(function () {
      this.renderChart("main");
    });
  },
};
</script>

<style scoped>
#main {
  min-height: 200px;
  width: 100%;
}
</style>