<template>
  <div id="container">
    <div style="height: 40px" class="in_chart_select">
        <el-select
          v-model="portName"
          :placeholder="this.$t('port.placeholder')"
          style="margin: 10px"
          size="mini"
          @change="changePortName"
        >
          <el-option
            v-for="item in allPortsNames"
            :key="item"
            :label="item"
            :value="item"
          >
          </el-option>
        </el-select>
      </div>
    <div id="main"></div>
  </div>
</template>

<script>
import * as echarts from "echarts";

export default {
  props: {
    chartData: Array,
    legend: Array,
    allPortsNames: Array
    // id: String,
  },
  watch: {
    count: function (oldValue, newValue) {
      this.portChart.resize()
    },
    chartData: function (oldValue, newValue) {
      let fulfillmentArr = [];
      let shortageArr = [];
      newValue.forEach((item) => {
        fulfillmentArr.push(item.singlePortFulfillmentTickCount);
        shortageArr.push(item.singlePortShortageTickCount);
      });
      this.option.series[0].data = fulfillmentArr;
      this.option.series[1].data = shortageArr;

      this.option.title.subtext = `${this.$t('port.fulfillment')}: ${oldValue[oldValue.length - 1].singlePortFulfillmentTickCount} \n${this.$t('port.shortage')}: ${oldValue[oldValue.length - 1].singlePortShortageTickCount}`
      // console.log(fulfillmentArr, shortageArr, 'fffffffff');
      this.portChart.setOption(this.option);
    },
    legend: function (oldValue, newValue) {
      this.option.legend.data = newValue;
      this.portChart.setOption(this.option);
    },
  },
  data() {
    return {
      portChart: null,
      portName: '',
      count: 1,
      option: {
        title: {
          subtext: `${this.$t('port.fulfillment')}:  \n${this.$t('port.shortage')}: `,
          right: '12%',
          bottom: '8%',
          subtextStyle: {
            color: 'white',
            fontSize: '15',
            verticalAlign: 'top',
            lineHeight: 20,
          }
        },
        tooltip: {
          trigger: "axis",
          axisPointer: {
            type: "cross",
            label: {
              backgroundColor: "#6a7985",
              formatter: params => {
                return Math.round(params.value)
              }
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
        ],
      },
    };
  },
  methods: {
    changePortName (data) {
      this.$emit('changePortName', data)
    },
    renderChart(id) {
      this.portChart = echarts.init(document.getElementById(id));
      this.portChart.setOption(this.option);
    },
  },
  mounted() {
    this.$nextTick(function () {
      this.renderChart('main');
    });
  },
};
</script>

<style scoped>
#main {
  min-height: 250px;
  width: 100%;
}
</style>