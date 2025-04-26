<template>
  <div>
    <!-- Navbar -->
    <div class="navbar bg-base-100 mb-2">
      <div class="flex-none">

          <label for="drawer-left" class="btn btn-square btn-ghost" >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                 class="inline-block w-5 h-5 stroke-current">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M4 6h16M4 12h16M4 18h16">
              </path>
            </svg>
          </label>
      </div>
      <div class="flex-1">
        <NuxtLink to="/" class="btn btn-ghost normal-case text-xl">Vue Reader</NuxtLink>
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
      </div>
    </div>

    <!-- Conteúdo das páginas -->
    <div class="drawer ">
      <input id="drawer-left" type="checkbox" class="drawer-toggle" />

      <div class="drawer-content">
        <div class="flex-1">
          <slot />
        </div>
      </div>

      <div class="drawer-side" >
        <label for="drawer-left" class="drawer-overlay"></label>
        <ul class="menu p-4 w-80 bg-base-100 text-base-content min-h-screen" >
          <li>
            <NuxtLink to="/cadastro-series" class="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 20.25h12m-7.5-3v3m3-3v3m-10.125-3h17.25c.621 0 1.125-.504 1.125-1.125V4.875c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125Z" />
              </svg>
              Cadastro de Séries
            </NuxtLink>
          </li>
          <li>
            <NuxtLink to="/cadastro-livros" class="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
              </svg>
              Cadastro de Livros
            </NuxtLink>
          </li>
        </ul>

      </div>

    </div>

  </div>
</template>