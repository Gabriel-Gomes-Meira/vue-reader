<template>
  <div class="card w-96 bg-base-100 shadow-xl">    
    <div class="card-body">
      <div class="card-title">
        <div class="form-control">
          <div class="input-group">
            <input type="text" placeholder="Search…" class="input input-bordered"
            :value="modelValue"
            @input="$emit('update:modelValue', $event.target.value)" 
            />
            <button class="btn btn-square">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </button>
          </div>
        </div>
      </div>

      
      <!-- <div class="card-actions justify-end">
        <button class="btn btn-primary">Buy Now</button>
      </div> -->
    </div>
  </div>
</template>

<script>
export default {
    props: ['modelValue'],   
    
    emits: ['update:modelValue']   
}
</script>

<style>
</style>