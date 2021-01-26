export default {
  data: {
    type: Array,
    required: true
  },
  min: {
    type: Number
  },
  max: {
    type: Number
  },
  clip: {
    type: Boolean,
    default: true
  },
  block: {
    type: Boolean,
    default: false
  },
  grid: {
    type: Boolean,
    default: true
  },
  gridNum: {
    type: Number,
    default: 4
  },
  step: {
    type: Number,
    default: 1
  },
  hideMinMax: {
    type: Boolean,
    default: true
  },
  hideFromTo: {
    type: Boolean,
    default: false
  },
  toFixed: {
    type: Boolean,
    default: false
  },
  fromFixed: {
    type: Boolean,
    default: false
  },
  forceEdges: {
    type: Boolean,
    default: false
  },
  dragInterval: {
    type: Boolean,
    default: false
  },
  keyboard: {
    type: Boolean,
    default: true
  },
  type: {
    type: String,
    default: 'double',
    validator: function(value) {
      return ['double', 'single'].indexOf(value) !== -1
    }
  },
  width: {
    type: Number,
    default: 650
  },
  barHeight: {
    type: Number,
    default: 100
  },
  barWidth: {
    type: Number,
    default: 6
  },
  barGap: {
    type: Number,
    default: 5
  },
  barRadius: {
    type: Number,
    default: 4
  },
  prettify: Function,
  labelColor: {
    type: String,
    default: '#f99841'
  },
  primaryColor: {
    type: String,
    default: 'linear-gradient(to right, #f6934b, #f2660c)'
  },
  holderColor: {
    type: String,
    default: '#748fb5'
  },
  handleColor: {
    type: String,
    default: 'transparent'
  },
  gridTextColor: {
    type: String,
    default: '#748fb5'
  },
  lineHeight: {
    type: Number,
    default: 2
  },
  transitionDuration: {
    type: Number,
    default: 80
  },
  fontFamily: {
    type: String,
    default: "Digital Sans EF"
  },
  fontSize: {
    type: Number,
    default: 12
  },
  // histSliderGap: {
  //   type: Number,
  //   default: 6
  // },
  colors: {
    type: Array
  },
  updateColorOnChange: {
    type: Boolean,
    default: true
  },
  handleSize: {
    type: Number,
    default: 26
  }
}
