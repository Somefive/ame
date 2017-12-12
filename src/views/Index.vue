<template>
  <div class="index">
    <div class="banner">
      <div class="banner-text">
        <span class="title">AMe</span> - CNKI Knowledge Search
      </div>
      <div class="search-box">
        <q-search v-model="search" color="white" dark="true"/>
      </div>
    </div>
    <div class="data-view">
      
    </div>
  </div>
</template>

<script>
import { QSearch } from 'quasar'
export default {
  name: 'index',
  components: {
    QSearch
  },
  data () {
    return {
      search: 'You know, for Search'
    }
  }
}
</script>

<style>
.index {
  height: 100%;
  width: 100%;
}
.banner {
  position: relative;
  background: linear-gradient(to top, #85abf7, #526996);
  height: 40%;
  color: white;
  font-size: 44px;
}
.banner-text {
  position: absolute;
  left: 50%;
  top: 70%;
  transform: translate(-50%, -50%);
  float: left;
}
.search-box {
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translate(-50%, -50%) scale(1.5, 1.5);
  min-width: 25%;
  float: left;
}
.title {
  font-weight: 600;
  font-size: 84px;
  margin-right: 10px;
}
.data-view {
  height: 60%;
  background: linear-gradient(to bottom, #85abf7, #aac0ed);
}
</style>

