<template>
<div class="MBslidebar">
  <div class="TopNavbarTitle">
    <div class="NavbarTitle" v-for="(item,index) in Navtabs" :class="{'NavbarTitleActive':activeIndex == index }" @click="tabClick(index,$event)">{{item}}</div>
    <div class="navbar__slider"  v-bind:style="{'transform':'translate3d('+sliderOffset+'px,0,0)'}"></div>
  </div>
    <div class="NavBarBody">
        <slot name="first"></slot>
        <slot name="second" :activeIndex="activeIndex"></slot>
    </div>
</div>
</template>
<script>
    export default{
        name:'NavBar',
        props:['Navtabs'],
        data(){
            return{
             activeIndex: 0,
             sliderOffset: 0,
            }
        },
        methods:{
            tabClick(index,e){
                this.sliderOffset = e.currentTarget.offsetLeft;
                this.activeIndex = index;
        }
    }
}
</script>
<style>
    .MBslidebar {
width: 500px;
height: 200px;
border: 1px solid;
position: relative;
}
.TopNavbarTitle {
width: 100%;
height: 50px;
position: absolute;
z-index: 500;
top: 0;
}
.TopNavbarTitle:hover{
cursor: pointer;
}
.NavbarTitle{
width: 25%;
height: 50px;
float: left;
line-height: 50px;
text-align: center;
}
.NavbarTitleActive{
color: #f08300;
}
.navbar__slider {
position: absolute;
content: " ";
left: 0px;
bottom: 0;
width: 25%;
height: 3px;
background-color: #f08300;
-webkit-transition: -webkit-transform 0.3s;
transition: -webkit-transform 0.3s;
transition: transform 0.3s;
transition: transform 0.3s, -webkit-transform 0.3s;
}
.NavBarBody{
margin-top: 60px;
}
.navbar-content-item{
width: 500px;
height: 100px;
border: 1px solid red;
}
</style>