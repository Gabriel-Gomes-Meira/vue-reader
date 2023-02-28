<template>
    <div class="drawer drawer-end" style="height: 92.7vh;">
        <input id="bookmark-drawer" type="checkbox" class="drawer-toggle" />

        <div class="drawer-content">
            <div class="container mx-auto ">
                <div id="area" @click="rendition.next()">
                </div>
            </div>
        </div>

        <div class="drawer-side">
            <label for="bookmark-drawer" class="drawer-overlay"></label>
            <ul class="menu p-4 w-80 bg-base-100 text-base-content" v-if="displaying">
                <div class="flex items-stretch">
                    <button class="btn btn-outline btn-success w-1/2
                    rounded-r-none border-r-0" @click="addBookMark()"
                    v-text="'Add BookMark'" />

                    <button class="btn btn-outline btn-warning w-1/2
                    rounded-l-none border-l-0" @click="clearBookMarks()"
                    v-text="'Clear BookMarks'" />
                </div>
                <!-- Sidebar content here -->
                <div v-for="(bookMark, index) in getBookMarks" :key="index"
                class="flex justify-center items-stretch mt-2">
                    <div class="btn btn-outline w-56
                    rounded-r-none border-r-0"
                    @click="displayPointAt(bookMark)"
                    >                                                
                        {{ labelTocByLocations[bookMark.start.href] }}                        
                        
                    </div>
                    <div class="max-w-8">
                        <button class="btn btn-outline btn-error border-l-0 rounded-l-none"
                        @click="removeBookMark(index)">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                            </svg>
                        </button>                        
                    </div>
                </div>
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
            rendition: {},
            displaying: false
        }
    },

    computed: {
        ...mapGetters([
            'getBookMarks'
        ]),

        labelTocByLocations() {
            if (this.displaying) {
                var labelTocByLocations = {}
                let toc_index = -1
                // while(index < this.rendition.book.navigation.toc.length)
                for (let location_index = 0; location_index < this.rendition.book.spine.items.length; location_index++) {
                    let key = this.rendition.book.spine.items[location_index].href;
                    if (this.rendition.book.spine.items[location_index].href == this.rendition.book.navigation.toc[toc_index + 1].href) {
                        toc_index++;
                    }
                    labelTocByLocations[key] = this.rendition.book.navigation.toc[toc_index].label;
                }
                // }
                return labelTocByLocations;
            }

            return {};
        },

        currentLocation() {
            return this.rendition.currentLocation().start ? this.rendition.currentLocation().start.cfi : null
        }

    },

    methods: {
        addBookMark() {
            this.$store.commit('addBookMark', this.rendition.currentLocation());
            this.$store.dispatch('storeBookMark');
        },

        clearBookMarks(){
            this.$store.dispatch('clearBookMarks');
        },

        displayPointAt(bookMark) {
            this.rendition.display(bookMark.start.cfi)
        },

        removeBookMark(index){
            this.$store.commit('removeBookMark', index);
            this.$store.dispatch('storeBookMark');
        }
    },

    created() {

        this.$store.dispatch('initBookMarks')
        this.rendition.book = Epub(this.$route.query.url)


        this.rendition = this.rendition.book.renderTo("area", { flow: "paginated", method: "continuous", width: 800, height: 600 });
        this.rendition.display();

        this.rendition.on("displayed", () => {
            this.displaying = true;
        })

    }
}
</script>

<style scoped lang="scss"></style>
