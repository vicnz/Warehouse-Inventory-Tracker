<script context="module">
    const columns = [
        { label: "id", type: "string" },
        { label: "product", type: "string" },
        { label: "description", type: "string" },
        { label: "price", type: "currency" },
        { label: "export quantity", type: "number" },
        { label: "cost (in Peso)", type: "currency" },
        { label: "shipment", type: "date" },
        { label: "arrived", type: "boolean" },
        { label: "client", type: "string" },
        { label: "company", type: "string" },
        { label: "contact", type: "string" },
        { label: "email", type: "string" },
    ];
</script>

<script>
    import { slide } from "svelte/transition";
    import { beforeUrlChange, goto } from "@roxi/routify";
    import Datatable from "../../../lib/ui/datatable/index.svelte";
    import Header from "../../../lib/ui/tableheader.svelte";
    import Footer from "../../../lib/ui/tablestatusbar.svelte";
    import Card from "../../../lib/ui/card.svelte";
    $: refresh = false; //refresh
    $: checked = []; //checked items

    //on items selected
    let onItemSelected = (event) => {
        $goto(`/app/outgoing/:slug`, {
            slug: event.detail.data[0],
        });
    };

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
                await window.outgoing.deleteMany({ ids });
                refresh = true;
                checked = [];
            } else {
                return;
            }
        }
    }
</script>

<div class="content" in:slide>
    <Card>
        <Header title="Outgoing">
            <div class="btn-group" slot="controls">
                <button class="btn" on:click={() => $goto("/app/outgoing/add")}>
                    Add
                </button>
                <button class="btn" on:click={onDelete}> Delete </button>
            </div>
        </Header>
        {#key refresh}
            {#await window.outgoing.getAll() then result}
                <Datatable
                    {columns}
                    rows={result.values}
                    width={7}
                    on:item={onItemSelected}
                    on:checked={(event) => (checked = event.detail.checked)}
                />
                <Footer
                    on:refresh={() => (refresh = !refresh)}
                    {checked}
                    {columns}
                    data={result}
                />
            {/await}
        {/key}
    </Card>
</div>
