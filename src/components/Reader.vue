<template>
  <div id="area"
  @click="rendition.next()">
  </div>  
</template>

<script>
import Epub from "epubjs"
export default {
  name: 'Reader',
  
  props: {    
  },

  data: () => {
    return {
      book:{},
      rendition:{}
    }
  },
  
  created(){
    this.book = Epub(this.$route.query.url)
    this.rendition = this.book.renderTo("area", {flow: "paginated", method: "continuous", width: 800, height: 600 });
    this.rendition.display();    
  }
}
</script>

<style scoped lang="scss">
</style>
