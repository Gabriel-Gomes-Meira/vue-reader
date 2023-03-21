<template>
    <div class="drawer drawer-end" style="height: 92.7vh;" @contextmenu.prevent="show
    ">
        <input id="bookmark-drawer" type="checkbox" class="drawer-toggle" />

        <div class="drawer-content">
            <button class="btn btn-circle btn-outline absolute xs:bottom-3 sm:inset-y-1/2 lg:left-20 xs:left-5 z-50"
                @click="rendition.prev()">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                    stroke="currentColor" class="w-6 h-6">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
            </button>
            <button class="btn btn-circle btn-outline absolute xs:bottom-3 sm:inset-y-1/2 lg:right-20 xs:right-5 z-50"
                @click="rendition.next()">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                    stroke="currentColor" class="w-6 h-6">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
            </button>

            <div class="container mx-auto ">
                <div id="area">
                </div>
            </div>

            <div class="origin-top-right absolute right-0 mt-2 w-56 rounded-lg shadow-lg"            
                v-show="menu.isExpanded" :style="{ top: menu.top + 'px', left: menu.left + 'px' }">
                <ul class="menu bg-transparent w-56 p-2" >
                    <div class="collapse bg-base-100 pa-0">
                        <input type="checkbox" class="peer"
                        :disabled="selectedText?false:true"                        
                        id="checkbox_translate_option"                        
                        /> 
                        <li class="collapse-title bg-base-100 rounded-xl
                        peer-checked:bg-primary peer-checked:text-primary-content
                        peer-checked:w-96" 
                        style="padding: 0;"
                        :class="!selectedText?'disabled':''">                        
                            <a >Traduzir</a>
                        </li>                                                                 
                        <div class="collapse-content"> 
                            <translate-card-vue                            
                            v-model="selectedText"                             
                            />
                        </div>
                    </div>                       
                </ul>
            </div>
        </div>

        <div class="drawer-side">
            <label for="bookmark-drawer" class="drawer-overlay"></label>
            <ul class="menu p-4 w-80 bg-base-100 text-base-content" v-if="displaying">
                <div class="flex items-stretch">
                    <button class="btn btn-outline btn-success w-1/2
                        rounded-r-none border-r-0" @click="addBookMark()" v-text="'Add BookMark'" />

                    <button class="btn btn-outline btn-warning w-1/2
                        rounded-l-none border-l-0" @click="clearBookMarks()" v-text="'Clear BookMarks'" />
                </div>
                <!-- Sidebar content here -->
                <div v-for="(bookMark, index) in getBookMarks" :key="index" class="flex justify-center items-stretch mt-2">
                    <div class="btn btn-outline w-56
                        rounded-r-none border-r-0" @click="displayPointAt(bookMark)">
                        {{ labelTocByLocations[bookMark.start.href] }}

                    </div>
                    <div class="max-w-8">
                        <button class="btn btn-outline btn-error border-l-0 rounded-l-none" @click="removeBookMark(index)">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                                stroke="currentColor" class="w-6 h-6">
                                <path stroke-linecap="round" stroke-linejoin="round"
                                    d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
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

import axios from "axios";
import TranslateCardVue from '../components/TranslateCard.vue';

import { mapGetters } from 'vuex'

export default {
    name: 'Reader',

    props: {
    },

    data: () => {
        return {
            rendition: {},
            displaying: false,
            comands: {},
            keyboardFunctions: null,
            contextCaller: null,
            menu: {
                isExpanded: false,
                top: 0,
                left: 0,
            },
            selectedText: '',
            checked: false
        }
    },

    computed: {
        ...mapGetters([
            'getBookMarks',
            'getLocalVocabulary'
        ]),

        labelTocByLocations() {
            if (this.displaying) {
                var labelTocByLocations = {}
                let toc_index = -1
                for (let location_index = 0; location_index < this.rendition.book.spine.items.length; location_index++) {
                    let key = this.rendition.book.spine.items[location_index].href;
                    if (this.rendition.book.spine.items[location_index].href == this.rendition.book.navigation.toc[toc_index + 1].href) {
                        toc_index++;
                    }
                    labelTocByLocations[key] = this.rendition.book.navigation.toc[toc_index].label;
                }
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

        clearBookMarks() {
            this.$store.dispatch('clearBookMarks');
        },

        displayPointAt(bookMark) {
            this.rendition.display(bookMark.start.cfi)
        },

        removeBookMark(index) {
            this.$store.commit('removeBookMark', index);
            this.$store.dispatch('storeBookMark');
        },

        showMenu(event) {
            // console.log(event)
            // console.log(event.view.getSelection())

            event.preventDefault();
            this.menu.isExpanded = true;            
            this.menu.top = event.pageY + 70;
            this.menu.left = event.pageX + 190;
            // console.log(this.rendition.book)
            
            // pegar palavara selecionada
            this.selectedText = this.rendition.getContents()[0].window.getSelection().toString()       
            // this.checked = false     
            document.querySelector("#checkbox_translate_option").checked = false
        },

        // checkTranlateBox(e) {
        //     console.log(e)
        // }
    },

    components: {
        TranslateCardVue
    },

    created() {
        
        
        this.$store.dispatch('initBookMarks')
        this.rendition.book = Epub(this.$route.query.url)
        
        
        
        this.rendition = this.rendition.book.renderTo("area", {
            flow: "paginated",
            method: "continuous",
            width: "inherit", height: "90vh",
            // stylesheet: "/output.css",
            // script: "/dynamic_theme.js",            
        });
        this.rendition.display();
        
        this.rendition.on("displayed", () => {
            this.displaying = true;
            this.comands = {
                "ArrowRight": () => {
                    this.rendition.next()
                },
                "ArrowLeft": () => {
                    this.rendition.prev()
                }
            }
        })
        
        
        
        this.rendition.themes.default({
            html: {
                'background-color': 'rgb(15, 23, 42)',
                color: "#b4c6ef",
                'line-height': 1.5,
                /* 1 */
                '-webkit-text-size-adjust': '100%',
                /* 2 */
                '-moz-tab-size': '4',
                /* 3 */
                '-o-tab-size': '4',
                'tab-size': '4',
                /* 3 */
                'font-family': 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"',
                /* 4 */
                'font-feature-settings': 'normal',
            },
            a: {
                color: "#b4c6ef"
            }
        }, "/output.css");
        
        
        // this.rendition.on("locationChanged", () => {
            //     const content = this.rendition.getContents()[0]            
            //     content.documentElement.addEventListener("")           
            // })       
            
        this.keyboardFunctions = (e) => {
            if (this.comands[e.key]) {
                this.comands[e.key]()
            }
        }
                                        
        window.document.addEventListener("keydown", this.keyboardFunctions)
                                            
        this.rendition.on("rendered", (e,i) => {;
            // i.document.documentElement.addEventListener('contextmenu', (cfiRange, contents) => {
            //     console.log('hey');
            // })
            i.document.documentElement.addEventListener('contextmenu', this.showMenu)
            i.document.documentElement.addEventListener('click', () => this.menu.isExpanded = false)
        });
        // axios.get('')
        // .then(function (response) {
            
            // })
        // .catch(function (error) {
        //     // exibir uma mensagem de erro caso ocorra algum problema na solicitação
        //     console.error(error);            
        // });

    },

    beforeDestroy() {
        window.document.removeEventListener("keydown", this.keyboardFunctions)                
    },
}
</script>

<style scoped lang="scss"></style>
