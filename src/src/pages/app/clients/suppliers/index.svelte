<script context="module">
    const columns = [
        { label: "id", type: "string" },
        { label: "name", type: "string" },
        { label: "company", type: "string" },
        { label: "address", type: "string" },
        { label: "contact", type: "string" },
        { label: "email", type: "string" },
    ];
</script>

<script>
    import Card from "../../../../lib/ui/card.svelte";
    import Header from "../../../../lib/ui/tableheader.svelte";
    import DataTable from "../../../../lib/ui/datatable/index.svelte";
    import { goto, beforeUrlChange } from "@roxi/routify";
    import { fly } from "svelte/transition";
    $: refresh = false;
    $: checked = [];

    //on item selected
    function onItemSelected(event) {
        $goto("/app/clients/suppliers/:slug", {
            slug: event.detail?.data[0],
        });
    }

    //before page navigation
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

    //on items delete
    async function onDelete() {
        if (checked.length > 0) {
            const prompt = await window.dialogs.message({
                type: "warning",
                title: "Delete Items",
                message: `Delete [${checked.length}] items?`,
                detail: "This is an irreversible operation",
                buttons: ["Cancel", "Ok"],
            });
            //if ok then proceed
            if (prompt.response == 1) {
                const ids = checked.map((item) => {
                    return item[0].toString();
                });
                await window.clients.deleteManySupplier({ ids });
                refresh = true;
                checked = [];
            } else {
                return;
            }
        }
    }
</script>

<div class="content" in:fly={{ x: -100 }}>
    <Card>
        <Header slot="header" title="Suppliers">
            <div class="btn-group" slot="controls">
                <button
                    class="btn"
                    on:click={() => {
                        $goto("/app/clients/suppliers/add");
                    }}
                >
                    Add
                </button>
                <button class="btn" on:click={onDelete}>Delete</button>
            </div>
        </Header>
        {#key refresh}
            {#await window.clients.getSuppliers() then data}
                <DataTable
                    {columns}
                    rows={data.values}
                    on:checked={(event) => (checked = event.detail.checked)}
                    on:item={onItemSelected}
                />
            {/await}
        {/key}
    </Card>
</div>
