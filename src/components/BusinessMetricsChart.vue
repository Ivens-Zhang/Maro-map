<template>
  <div :id="id" class="main"></div>
</template>

<script>
import * as echarts from "echarts";

export default {  
  // FIXME 以后有时间可以给几个表格组件补充下思路注释，并做合并
  props: {
    chartData: Array,
    legend: Array,
    id: String,
    resDate: String
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

      this.option.title.subtext = `${this.resDate} \n${this.$t('port.todayFulfillment')}: ${oldValue[oldValue.length - 1].fulfillmentTickCount}       ${this.$t('port.todayShortage')}: ${oldValue[oldValue.length - 1].shortageTickCount}`
      this.bussinessMetricsChart.setOption(this.option);
    },
    legend: function (oldValue, newValue) {
      this.option.legend.data = newValue
      this.bussinessMetricsChart.setOption(this.option);
    }
  },
  data() {
    return {
      count: 1,
      bussinessMetricsChart: null,
      option: {
        title: {
          subtext: `2014/12/24 \n${this.$t('port.todayFulfillment')}:        ${this.$t('port.todayShortage')}: `,
          left: '13%',
          bottom: '7%',
          subtextStyle: {
            color: 'white',
            fontSize: '15',
            verticalAlign: 'top',
            lineHeight: 25,
          }
        },
        tooltip: {
          trigger: "axis",
          axisPointer: {
            type: "cross",
            label: {
              backgroundColor: "#6a7985",
              formatter: (params) => {
                return Math.round(params.value);
              },
            },
          },
        },
        legend: {
          data: this.legend,
          right: "10%",
          top: "auto", // 'center' | 'bottom' | {number
          textStyle: {
            color: "white",
          },
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
            data: []
          },
          {
            name: this.legend[1],
            type: "line",
            stack: "总量",
            areaStyle: {},
            emphasis: {
              focus: "series",
            },
            data: []
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
    this.$nextTick(function () {
      this.renderChart(this.id);
    });
  },
};
</script>

<style scoped>
.main {
  min-height: 250px;
  width: 100%;
}
</style>