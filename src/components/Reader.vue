<template>
    <div id="area" @click="rendition.next()">
    </div>

    <div class="mt-4">
        <button class="btn btn-outline btn-warning"
        @click="addBookMark()">
            Add BookMark</button>

        <div class="flex flex-col" v-for="(bookMark, index) in getBookMarks" :key="index">
            <button class="btn btn-outline btn-primary"
            @click="displayPointAt(bookMark)"
            >Ponto {{ index }}</button>
        </div>
    </div>
</template>

<script>
import Epub from "epubjs"
import { mapGetters } from 'vuex'

export default {
    name: 'Reader',

    props: {
    },

    data: () => {
        return {
            book: {},
            rendition: {}
        }
    },

    computed: {
        ...mapGetters([
            'getBookMarks'
        ])
    },

    methods: {
        addBookMark(){
            this.$store.commit('addBookMark', this.rendition.currentLocation());
            this.$store.dispatch('storeBookMark');            
        },

        displayPointAt(bookMark){
            console.log(bookMark)
            this.rendition.display(bookMark.start.cfi)
        }
    },

    created() {        
        console.log(this.getBookMarks)
        this.$store.dispatch('initBookMarks')
        this.book = Epub(this.$route.query.url)
        this.rendition = this.book.renderTo("area", { flow: "paginated", method: "continuous", width: 800, height: 600 });
        this.rendition.display();        
    }
}
</script>

<style scoped lang="scss"></style>
