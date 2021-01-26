<template>
    <div class="NavBarBody" >
        <p>{{slotTochild}}</p>
        <div class="navbar-content-item" v-show="slotTochild.activeIndex == 0">detail</div>
        <div class="navbar-content-item" v-show="slotTochild.activeIndex == 1">accumulated</div>
    </div>
</template>
<script>
    export default{
        name:'NavContent',
        props:['activeIndex','slotTochild'],
        data(){
            return{
            }
        }
}
</script>
<style>
    
.NavBarBody{
margin-top: 60px;
}
.navbar-content-item{
width: 500px;
height: 100px;
border: 1px solid red;
}
</style>