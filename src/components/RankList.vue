<template>
  <div :id="this.id" style="height: 250px; width: 100%"></div>
</template>

<script>
import * as echarts from "echarts";

export default {
  props: {
    chartData: Array,
    legend: Array,
    allVesselName: Array,
    id: String,
    title: String,
    portsName: Array,
  },
  watch: {
    chartData: function (newValue, oldValue) {
      if (newValue.length > 0) {
        this.option.series[0].data = newValue;
        this.vesselChart.setOption(this.option);
      }
    },
    portsName: function (newValue, oldValue) {
      this.option.yAxis.data = newValue;
      this.vesselChart.setOption(this.option);
    },
  },
  data() {
    return {
      vesselChart: null,
      vesselName: "",
      count: 1,
      option: {
        title: {
          text: this.title,
          left: "55%",
          textAlign: "center",
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
          max: "dataMax",
          axisLabel: {
            formatter: function (val) {
              return Math.round(val * 10000) / 100 + "%";
            },
          },
        },
        yAxis: {
          type: "category",
          data: this.portsName,
          inverse: true,
          animationDuration: 700,
          animationDurationUpdate: 300,
          max: 4, // only the largest 3 bars will be displayed
          axisLabel: {
            color: 'white',
            fontSize: 15,
            fontWeight: 'bold'
          },
        },
        series: [
          {
            realtimeSort: true,
            name: "X",
            type: "bar",
            data: this.chartData,
            // barWidth: 15,
            label: {
              show: true,
              position: "insideRight",
              valueAnimation: true,
              formatter: (params) => {
                let value = params.value;
                let res = Math.round(value * 10000) / 100 + "%";
                return res;
              },
            },
          },
        ],
        animationDuration: 0,
        // animationDurationUpdate: 3000,
        animationEasing: "linear",
        animationEasingUpdate: "linear",
      },
    };
  },
  methods: {
    // changePortName(data) {
    //   this.$emit("changePortName", data);
    // },
    renderChart(id) {
      this.vesselChart = echarts.init(document.getElementById(id));
      this.vesselChart.setOption(this.option);
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
</style>
