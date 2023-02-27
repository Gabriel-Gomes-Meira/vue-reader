<template>
    <div class="drawer drawer-end"
    style="height: 92.7vh;"
    >
        <input id="bookmark-drawer" type="checkbox" class="drawer-toggle" />

        <div class="drawer-content">
            <div class="container mx-auto ">
                <div id="area" @click="rendition.next()">
                </div>
            </div>
        </div>

        <div class="drawer-side">            
            <label for="bookmark-drawer" class="drawer-overlay"></label>
            <ul class="menu p-4 w-80 bg-base-100 text-base-content">
                <button class="btn btn-outline btn-warning" @click="addBookMark()">
                        Add BookMark</button>                    
                <!-- Sidebar content here -->
                <li v-for="(bookMark, index) in getBookMarks" :key="index"
                >
                    <a @click="displayPointAt(bookMark)">Ponto {{ index }}</a>
                </li>                
            </ul>
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
        addBookMark() {
            this.$store.commit('addBookMark', this.rendition.currentLocation());
            this.$store.dispatch('storeBookMark');
        },

        displayPointAt(bookMark) {
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
