<script>
    /**
     * TODO LIST
     * 1. Handle Authentication Data (Create A Shared Auth State)
     * 2. Unset Auth State on LOGOUT
     */
    import Navbar from "../../lib/ui/Navbar.svelte";
    import Sidebar from "../../lib/ui/Sidebar.svelte";
    import { sidebar } from "../../lib/stores/ui.store";
</script>

<div
    class={`page-wrapper with-navbar ${$sidebar ? "with-sidebar" : ""}`}
    data-sidebar-type="overlayed-sm-and-down"
>
    <div class="sticky-alerts" />
    <Navbar />
    {#if $sidebar}
        <Sidebar />
    {/if}
    <div class="content-wrapper">
        <slot />
    </div>
</div>
