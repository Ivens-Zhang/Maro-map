<template>
  <div id="container1">
    <div style="height: 40px" class="in_chart_select">
      <el-select
        v-model="vesselName"
        placeholder="select series"
        style="margin: 10px"
        size="mini"
      >
        <el-option
          v-for="item in allVesselName"
          :key="item"
          :label="item"
          :value="item"
        >
        </el-option>
      </el-select>
    </div>
    <div id="aaamain123"></div>
  </div>
</template>

<script>
import * as echarts from "echarts";

export default {
  props: {
    chartData: Array,
    legend: Array,
    allVesselName: Array,
    // id: String,
  },
  watch: {
    count: function (oldValue, newValue) {
      this.vesselChart.resize();
      console.log("222");
    },
    vesselName: function (newValue, oldValue) {
      console.log(newValue,'dd');
      this.$emit("changeVesselName", newValue);
    },
    chartData: function (oldValue, newValue) {
      let full = [];
      let empty = [];
      let remaining_space = []
      newValue.forEach((item) => {
        full.push(item.full);
        empty.push(item.empty);
        remaining_space.push(item.remaining_space);
      });
      this.option.series[0].data = full;
      this.option.series[1].data = empty;
      this.option.series[2].data = remaining_space;

      // console.log(fulfillmentArr, shortageArr, 'fffffffff');
      this.vesselChart.setOption(this.option);
    },
    legend: function (oldValue, newValue) {
      this.option.legend.data = newValue;
      this.vesselChart.setOption(this.option);
    },
  },
  data() {
    return {
      vesselChart: null,
      vesselName: "",
      count: 1,
      option: {
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
            data: [1120, 2132, 1201, 1344, 910, 2330, 2110],
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
          {
            name: this.legend[2],
            type: "line",
            stack: "总量",
            areaStyle: {},
            emphasis: {
              focus: "series",
            },
            data: [20, 12, 11, 24, 29, 33, 31],
          }
        ],
      },
    };
  },
  methods: {
    // changePortName(data) {
    //   this.$emit("changePortName", data);
    // },
    renderChart(id) {
      console.log('333');
      this.vesselChart = echarts.init(document.getElementById(id));
      this.vesselChart.setOption(this.option);
    },
  },
  mounted() {
    this.$nextTick(function () {
      this.renderChart('aaamain123');
    });
  },
};
</script>

<style scoped>
#aaamain123 {
  min-height: 250px;
  width: 100%;
}
</style>