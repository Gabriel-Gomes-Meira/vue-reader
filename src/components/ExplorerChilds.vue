<template>
    <div class="grid 
    grid-cols-3 gap-x-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 zxl-grid-cols-12">
        <div v-for="(data, index) in metadata" :key="index"
        class="card bg-cyan-400 hover:bg-cyan-500 text-primary-content"
        style="cursor: pointer;">
        <!-- <div class=""> -->            
                <div class="card-body" 
                @click="navigateToBook(data)"
                >                    
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                    </svg>
                    <h2 class="card-title">{{data.filename}}</h2>    
                                
                </div>            
        <!-- </div> -->
        </div>
    </div>
</template>

<script>
export default {
    name: "ExplorerChilds",
    data: () => {
        return {
            metadata: null,            
        }
    },

    created(){
        if (this.$route.params.index) {
            fetch("/metadata.json").then(response => response.json()).then(file => {
                this.metadata = file[this.$route.params.index].childs                
            })            
        }        
    },

    methods: {
        navigateToBook(data){
            this.$router.push({name: 'reader', params: {name:data.filename}, query: {url: data.url} })
        }
    }
}
</script>