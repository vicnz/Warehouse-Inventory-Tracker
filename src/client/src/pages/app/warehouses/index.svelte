<script context="module">
    /**
     * TODO LIST
     * 1. Sanitize Data Before Save
     */
    const columns = [
        { label: "id", type: "string" },
        { label: "warehouse name", type: "string" },
        { label: "location", type: "string" },
        { label: "Products (currently in stock)", type: "number" },
    ];
</script>

<script>
    import DataTable from "../../../lib/ui/datatable/index.svelte";
    import Header from "../../../lib/ui/tableheader.svelte";
    import Card from "../../../lib/ui/card.svelte";

    import Edit from "./_edit.svelte";
    import { fly } from "svelte/transition";
    $: refresh = false; //refresh window
    $: edit = ""; //edit
    //data
    $: data = {
        id: "",
        label: "",
        location: "",
    };
    let checked = []; //checked items

    function onDoubleClicked(event) {
        edit = "edit";
        data = {
            id: event.detail.data[0],
            label: event.detail.data[1],
            location: event.detail.data[2],
        };
    }

    //on item checked
    function onChecked(event) {
        checked = event.detail.checked;
    }

    //on item add new
    async function onAddNew(row) {
        if (
            (row.id === "" && row.id.length < 3) ||
            (row.label === "" && row.label.length < 3)
        ) {
            return;
        } else {
            await window.warehouse.addOne({ rows: row });
            refresh = !refresh;
            edit = "";
        }
    }
    //on item update one
    async function onUpdateOne(row) {
        if (
            (row.id === "" && row.id.length < 3) ||
            (row.label === "" && row.label.length < 3)
        ) {
            return;
        } else {
            await window.warehouse.updateOne({ rows: row });
            refresh = !refresh;
            edit = "";
        }
    }

    async function onDeleteItems() {
        if (checked.length > 0) {
            const prompt = await window.dialogs.message({
                type: "warning",
                title: "Delete Items",
                message: `Delete [${checked.length}] items?`,
                detail: "WARNING: deleting a warehouse item\n will also delete associated product/ingoing/outgoing items",
                buttons: ["Cancel", "Ok"],
            });
            //if ok then proceed
            if (prompt.response == 1) {
                const ids = checked.map((item) => {
                    return item[0].toString();
                });
                await window.warehouse.deleteMany(ids);
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
        <Header slot="header" title="Warehouses">
            <div class="btn-group" slot="controls">
                <button
                    class="btn"
                    on:click={() => {
                        edit = "add";
                        data = { id: "", label: "", location: "" };
                    }}
                >
                    Add
                </button>
                <button class="btn" on:click={onDeleteItems}> Delete </button>
            </div>
        </Header>
        <!-- ADD NEW ITEM -->
        {#if edit === "add"}
            <Edit
                {data}
                on:canceled={() => {
                    edit = "";
                    data = { id: "", label: "", location: "" };
                }}
                on:saved={(event) => {
                    data = { ...event.detail };
                    onAddNew({ ...event.detail });
                }}
            />
            <!-- EDIT ITEM -->
        {:else if edit === "edit"}
            <Edit
                {data}
                on:saved={(event) => {
                    data = { ...event.detail };
                    onUpdateOne(data);
                }}
                on:canceled={() => {
                    edit = "";
                    data = { id: "", label: "" };
                }}
            />
        {/if}
        <!-- table section -->
        <div class="card m-0 p-0">
            {#key refresh}
                {#await window.warehouse.getAll() then data}
                    <DataTable
                        {columns}
                        rows={data.values}
                        on:checked={onChecked}
                        on:item={onDoubleClicked}
                    />
                {/await}
            {/key}
        </div>
    </Card>
</div>
