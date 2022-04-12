<div class="page-wrapper with-navbar">
    <nav class="navbar">
        <div class="navbar-text">{window.GLOBALS.APP_NAME}</div>
        <div class="flex-fill" />
        <div class="navbar-content">
            <button
                class="btn btn-square rounded-circle"
                onclick="halfmoon.toggleDarkMode()"
            >
                <span class="ri ri-moon-line" />
            </button>
        </div>
        <!-- window toggle  -->
        <div class="navbar-content">
            <div class="btn-group">
                <button
                    class="btn btn-square shadow-none"
                    on:click={() => window.clientWindow.minimize()}
                >
                    <span class="ri ri-subtract-line" />
                </button>
                <button
                    class="btn btn-square shadow-none"
                    on:click={() => window.clientWindow.maximize()}
                >
                    <span class="ri ri-add-line" />
                </button>
                <button
                    class="btn btn-square shadow-none"
                    on:click={() => window.clientWindow.close()}
                >
                    <span class="ri ri-close-line" />
                </button>
            </div>
        </div>
    </nav>
    <div class="content-wrapper p-10">
        <slot />
    </div>
</div>

<style>
    .content-wrapper {
        display: grid;
        place-items: center;
    }
    .navbar {
        display: relative;
    }
    .navbar::after {
        content: "";
        height: 10px;
        width: inherit;
        top: 0;
        left: 0;
        right: 0;
        position: absolute;
        z-index: 10;
        -webkit-app-region: drag;
    }
</style>
