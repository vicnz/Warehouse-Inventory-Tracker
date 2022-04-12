<script context="module">
    /**
     * TODO LIST
     * 1. Export / Import Functionality
     * 2. Optimize Data Fetching For Large Number of Dataset
     */
    //column definitions
    const columns = [
        { label: "id", type: "string" },
        { label: "category", type: "string" },
        { label: "product", type: "string" },
        { label: "description", type: "string" },
        { label: "quantity", type: "string" },
        { label: "max quantity", type: "string" },
        { label: "unit price (in peso)", type: "currency" },
        { label: "total price (in peso)", type: "currency" },
        { label: "warehouse number", type: "string" },
        { label: "warehouse location", type: "string" },
    ];
</script>

<script>
    import { slide } from "svelte/transition";
    import { goto, beforeUrlChange } from "@roxi/routify";
    //COMPONENTS
    import StatusBar from "../../../lib/ui/tablestatusbar.svelte";
    import TableHeader from "../../../lib/ui/tableheader.svelte";
    import Datatable from "../../../lib/ui/datatable/index.svelte";
    let checked = []; //checked items
    let refresh = false; //refresh page data

    //check for unsaved changes
    $beforeUrlChange(async (event, route) => {
        if (checked.length > 0) {
            const prompt = await window.dialogs.message({
                title: "Unsaved Changes",
                message: "Some items are still active, proceed?",
                buttons: ["Cancel", "Ok"],
            });
            if (prompt.response === 1) {
                return true;
            } else {
                return false;
            }
        } else {
            return true;
        }
    });

    //on selected items delete
    async function onDelete() {
        if (checked.length > 0) {
            const prompt = await window.dialogs.message({
                type: "warning",
                title: "Delete Items",
                message: `Delete [${checked.length}] items?`,
                detail: "This is an irreversible operation",
                buttons: ["Cancel", "Ok"],
            });
            if (prompt.response == 1) {
                const ids = checked.map((item) => {
                    return item[0].toString();
                });
                //DELETE ITEMS
                await window.inventory.deleteMany({ ids });
                refresh = true;
                checked = [];
            } else {
                return;
            }
        }
    }

    //TODO:
</script>

<div class="content" in:slide>
    <div class="card m-0 p-0">
        <!-- table header -->
        <TableHeader title="Inventory">
            <div class="btn-group" slot="controls">
                <!-- add inventory item button -->
                <button
                    class="btn"
                    on:click={() => $goto("/app/inventory/add")}
                >
                    Add
                </button>
                <!-- delete inventory item(s) button -->
                <button class="btn" on:click={onDelete}>Delete</button>
            </div>
        </TableHeader>
        {#key refresh}
            {#await window.inventory.getAll() then data}
                <Datatable
                    {columns}
                    rows={data.values}
                    width={7}
                    on:item={(event) => {
                        $goto(`/app/inventory/:slug`, {
                            slug: event.detail?.data[0],
                        });
                    }}
                    on:checked={(event) => (checked = event.detail.checked)}
                />
                <StatusBar
                    {checked}
                    {columns}
                    {data}
                    on:refresh={() => {
                        refresh = !refresh;
                        checked = [];
                    }}
                />
            {/await}
        {/key}
    </div>
</div>
