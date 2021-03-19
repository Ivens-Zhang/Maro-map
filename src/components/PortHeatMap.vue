<template>
  <div :id="this.id" style="height: 500px; width: 450px"></div>
</template>

<script>
import * as echarts from "echarts";

export default {
  props: {
    chartData: Array,
    // legend: Array,
    // allVesselName: Array,
    id: String,
    // title: String,
    // portsName: Array
  },
  watch: {
    // count: function (oldValue, newValue) {
    //   this.vesselChart.resize();
    //   console.log("222");
    // },
    // vesselName: function (newValue, oldValue) {
    //   console.log(newValue, "dd");
    //   this.$emit("changeVesselName", newValue);
    // },
    chartData: function (newValue, oldValue) {
      // let full = [];
      // let empty = [];
      // let remaining_space = [];
      // newValue.forEach((item) => {
      //   full.push(item.full);
      //   empty.push(item.empty);
      //   remaining_space.push(item.remaining_space);
      // });
      if (newValue.length > 0) {
        this.option.series[0].data = newValue
        this.vesselChart.setOption(this.option);
      }
    },
    // portsName: function (newValue, oldValue) {
    //   this.option.yAxis.data = newValue
    //   this.vesselChart.setOption(this.option);
    // }
    // legend: function (oldValue, newValue) {
    //   this.option.legend.data = newValue;
    //   this.vesselChart.setOption(this.option);
    // },
  },
  data() {
    return {
      portName: ["Bremerhaven","Durban","Itagual","LeHavre","Los Angeles","Manzanillo","Melbourne","Montreal","New York","Oakland","Prince Rupert","Pusan","Qingdao","San Antonio","Santos","Seattle","Shanghai","Singapore","Sydney","Vancouver","Yantian","Yokohama"],
      vesselChart: null,
      vesselName: "",
      count: 1,
      option: {
        tooltip: {
          position: "inside",
          formatter: (params, ticket, callback) => {
            let fromIndex = params.value[1]
            let from = this.portName[fromIndex]
            let to = params.name
            let quantity = params.value[2]
            return `from: ${from}<br/>to: ${to} <br/> quantity: ${quantity}`
          }
        },
        grid: {
          height: "70%",
          top: "2%",
          left: "5%"
        },
        xAxis: {
          type: "category",
          data: ["Bremerhaven","Durban","Itagual","LeHavre","Los Angeles","Manzanillo","Melbourne","Montreal","New York","Oakland","Prince Rupert","Pusan","Qingdao","San Antonio","Santos","Seattle","Shanghai","Singapore","Sydney","Vancouver","Yantian","Yokohama"],
          axisLabel: {
            formatter: function () {
              return "";
            },
          },
          splitLine: {
            show: true,
          },
          splitArea: {
            show: true,
          },
        },
        yAxis: {
          type: "category",
          data: ["Bremerhaven","Durban","Itagual","LeHavre","Los Angeles","Manzanillo","Melbourne","Montreal","New York","Oakland","Prince Rupert","Pusan","Qingdao","San Antonio","Santos","Seattle","Shanghai","Singapore","Sydney","Vancouver","Yantian","Yokohama"],
          axisLabel: {
            formatter: function () {
              return "";
            },
          },
          inverse: true,
          splitLine: {
            show: true,
          },
          splitArea: {
            show: true,
          },
        },
        visualMap: {
          show: false,
          min: 0,
          max: 10,
          calculable: true,
          orient: "horizontal",
          left: "center",
          bottom: "1%",
        },
        series: [
          {
            name: "Punch Card",
            type: "heatmap",
            data: this.chartData,
            label: {
              show: false,
            },
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowColor: "rgba(0, 0, 0, 0.5)",
              },
            },
          },
        ],
      },
    };
  },
  methods: {
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
