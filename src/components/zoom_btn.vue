<template>
<div>
    <el-button :disabled="can_not_small" v-on:click="make_small"><i class="el-icon-remove-outline" /></el-button>
    <el-button :disabled="can_not_big" v-on:click="make_big"><i class="el-icon-circle-plus-outline" /></el-button>
</div>
</template>

<script>
import * as d3 from "d3";

export default {
    props: {
        width_options: Array,
        current_option: Number,
    },
    data: function () {
        return {
            can_not_small: true,
            can_not_big: true,
        };
    },
    methods: {
        make_small() {
            let cur_index = this.width_options.indexOf(this.current_option);
            if (cur_index > 0) {
                this.$emit("width_change", this.width_options[cur_index - 1]);
                this.can_not_big = false;
                if (cur_index == 1) {
                    this.can_not_small = true;
                }
            }
        },
        make_big() {
            let cur_index = this.width_options.indexOf(this.current_option);
            if (cur_index < this.width_options.length - 1) {
                this.$emit("width_change", this.width_options[cur_index + 1]);
                this.can_not_small = false;
                if (cur_index == this.width_options.length - 2) {
                    this.can_not_big = true;
                }
            }
        }
    },
    mounted: function () {
        let cur_index = this.width_options.indexOf(this.current_option);
        if (cur_index > 0) {
            this.can_not_small = false;
        }
        if (cur_index < this.width_options.length - 1) {
            this.can_not_big = false;
        }
    }
}
</script>

<style>

</style>
