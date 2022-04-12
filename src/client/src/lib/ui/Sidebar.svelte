<script>
    import Link from "../ui/Link.svelte";
    import { fly } from "svelte/transition";
    import { sidebar } from "../stores/ui.store";
</script>

<aside class="sidebar" in:fly={{ x: -100 }}>
    <div class="sidebar-menu">
        <div class="sidebar-content">
            TODO: Add User Info / Company Info Here
        </div>
        <div class="sidebar-title">Group</div>
        <div class="sidebar-divider" />
        <!-- Categories -->
        <Link
            className="sidebar-link sidebar-link-with-icon"
            path="/app/categories"
            params={{}}
            options={{}}
        >
            <span class="sidebar-icon ri ri-function-line" />
            Categories
        </Link>
        <!-- Warehouses -->
        <Link
            className="sidebar-link sidebar-link-with-icon"
            path="/app/warehouses"
            params={{}}
            options={{}}
        >
            <span class="sidebar-icon ri ri-building-line" />
            Warehouses
        </Link>
        <!-- Suppliers -->
        <Link
            className="sidebar-link sidebar-link-with-icon"
            path="/app/clients/suppliers"
            params={{}}
            options={{}}
        >
            <span class="sidebar-icon ri ri-user-3-line" />
            Suppliers
        </Link>
        <!-- Customers -->
        <Link
            className="sidebar-link sidebar-link-with-icon"
            path="/app/clients/customers"
            params={{}}
            options={{}}
        >
            <span class="sidebar-icon ri ri-user-3-line" />
            Customers
        </Link>
    </div>
</aside>
<aside class="sidebar-overlay" on:click={() => ($sidebar = !$sidebar)} />
