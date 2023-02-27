<template>
    <div class="drawer drawer-end">
        <input id="bookmark-drawer" type="checkbox" class="drawer-toggle" />

        <div class="drawer-content">
            <!-- Page content here -->
            <div class="navbar bg-base-100 mb-2">
                <div class="flex-none">
                    <button class="btn btn-square btn-ghost">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                            class="inline-block w-5 h-5 stroke-current">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M4 6h16M4 12h16M4 18h16">
                            </path>
                        </svg>
                    </button>
                </div>
                <div class="flex-1">
                    <a class="btn btn-ghost normal-case text-xl">Vue Reader</a>
                </div>
                <div class="flex-none w-32">
                    <label for="bookmark-drawer" class="btn btn-square btn-ghost w-full gap-1">
                        BookMarks
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                            stroke="currentColor" class="w-6 h-6">
                            <path stroke-linecap="round" stroke-linejoin="round"
                                d="M16.5 3.75V16.5L12 14.25 7.5 16.5V3.75m9 0H18A2.25 2.25 0 0120.25 6v12A2.25 2.25 0 0118 20.25H6A2.25 2.25 0 013.75 18V6A2.25 2.25 0 016 3.75h1.5m9 0h-9" />
                        </svg>
                    </label>
                    <!-- <button class="btn btn-square btn-ghost w-full gap-1"></button> -->
                </div>
            </div>

            <div class="container mx-auto ">
                <router-view />
            </div>
        </div>

        <div class="drawer-side">
            <label for="bookmark-drawer" class="drawer-overlay"></label>
            <ul class="menu p-4 w-80 bg-base-100 text-base-content">
                <!-- Sidebar content here -->
                <li><a>Sidebar Item 1</a></li>
                <li><a>Sidebar Item 2</a></li>
            </ul>
        </div>
    </div>
</template>

<script>
export default {
    name: 'App',

}
</script>
