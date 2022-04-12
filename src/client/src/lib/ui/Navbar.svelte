<script>
    let title = window.GLOBALS.APP_NAME;
    import { url, isActive } from "@roxi/routify";
    import Link from "../ui/Link.svelte";
    import { sidebar } from "../stores/ui.store";
    let navitems = [
        { path: "/app/index", label: "Dashboard", params: {}, options: {} },
        { path: "/app/inventory", label: "Inventory", params: {}, options: {} },
        { path: "/app/ingoing", label: "Ingoing", params: {}, options: {} },
        { path: "/app/outgoing", label: "Outgoing", params: {}, options: {} },
    ];
</script>

<nav class="navbar">
    <!-- @sidebar-toggle -->
    <div class="navbar-content">
        <button
            class="btn btn-square shadow-none border-0"
            on:click={() => ($sidebar = !$sidebar)}
        >
            <span class="ri ri-menu-2-line" />
        </button>
    </div>
    <!-- @navbar-title -->
    <div class="navbar-text">
        {title}
    </div>

    <!-- @navbar-nav -->
    <ul class="navbar-nav flex-fill justify-content-center hidden-sm-and-down">
        {#each navitems as navitem}
            <li
                class={`nav-item ${
                    $isActive(navitem.path, navitem.params, navitem.options)
                        ? "active"
                        : ""
                }`}
            >
                <a
                    href={$url(navitem.path, navitem.params, navitem.options)}
                    class="nav-link"
                >
                    {navitem.label}
                </a>
            </li>
        {/each}
    </ul>
    <div class="navbar-content hidden-md-and-up flex-fill">
        <div class="dropdown">
            <button class="btn shadow-none" data-toggle="dropdown">
                Menu
            </button>
            <div class="dropdown-menu">
                {#each navitems as navitem}
                    <Link
                        path={navitem.path}
                        params={navitem.params}
                        options={navitem.options}
                        className="dropdown-item"
                    >
                        {navitem.label}
                    </Link>
                {/each}
            </div>
        </div>
    </div>

    <!-- toggle dark mode -->
    <div class="navbar-content">
        <button
            class="btn btn-square rounded-circle shadow-none"
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
                title="Minimize"
            >
                <span class="ri ri-subtract-line" />
            </button>
            <button
                class="btn btn-square shadow-none"
                on:click={() => window.clientWindow.maximize()}
                title="Scale/Down"
            >
                <span class="ri ri-add-line" />
            </button>
            <button
                class="btn btn-square shadow-none"
                on:click={() => window.clientWindow.close()}
                title="Close"
            >
                <span class="ri ri-close-line" />
            </button>
        </div>
    </div>
</nav>

<style>
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
