<script>
    /**
     * TODO LIST
     * 1. Sanitize Data Before Save
     */
    import { fade } from "svelte/transition";
    import { params, goto, beforeUrlChange } from "@roxi/routify";
    import { onMount } from "svelte";
    //components
    import Card from "../../../lib/ui/card.svelte";
    import Header from "../../../lib/ui/tableheader.svelte";
    import EnableForm from "../../../lib/ui/enableform.svelte";
    import Ques from "../../../lib/ui/animation/ques.svelte";
    import Back from "../../../lib/ui/BackButton.svelte";
    import { toClientDate } from "../../../lib/ui/utils";
    let disabled = true; // enable form
    //ques
    $: ques = {
        saving: false,
        deleting: false,
    };
    $: slug = $params.slug; //url params [slug].svelte
    $: customers = []; //customer list
    $: products = []; //product list
    $: data = {}; //immutable data list
    $: mutable = {}; //mutable data list

    //before leaving page
    $beforeUrlChange(async (event, route) => {
        if (!disabled) {
            const prompt = await window.dialogs.message({
                type: "warning",
                title: "Leaving Page...",
                message: "Are you sure you want to discard any changes?",
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
    //load data
    onMount(() => {
        async function loadData() {
            const customer = await window.shared.customerList();
            const productList = await window.shared.productList();

            const outgoing = await window.outgoing.getOne({ id: slug });
            return {
                item: outgoing.data,
                products: productList.values,
                customers: customer.values,
            };
        }

        loadData().then((response) => {
            customers = response.customers;
            products = response.products;
            data = response.item;
            mutable = {
                ...data[0],
                arrived: data[0].arrived === 1 ? true : false,
                shipment: toClientDate(data[0].shipment),
            };
        });
    });

    function onSave() {
        console.log(mutable);
        //TODO: sanitize data
        ques.saving = true;
        setTimeout(() => {
            disabled = true;
            window.ingoing.updateOne({ row: mutable });
            $goto("../outgoing");
        }, 1000);
    }

    //on undo changes
    async function onUndo() {
        const prompt = await window.dialogs.message({
            title: "Undo",
            message: "Undo unsaved changes?",
            buttons: ["Cancel", "Ok"],
        });
        if (prompt.response === 1) {
            mutable = {
                ...data[0],
                arrived: data[0].arrived === 1 ? true : false,
                shipment: toClientDate(data[0].shipment),
            };
        } else {
            return;
        }
    }

    //delete item
    async function onDelete() {
        const prompt = await window.dialogs.message({
            type: "warning",
            title: "Delete Item",
            message: `Are you sure you want to delete this item?`,
            detail: `This will delete this permanently`,
            buttons: ["Cancel", "Ok"],
        });
        if (prompt.response === 1) {
            ques.deleting = true;
            setTimeout(() => {
                disabled = true;
                window.ingoing.deleteOne({ id: mutable.id });
                $goto("../outgoing");
            }, 1000);
        } else {
            return;
        }
    }
</script>

<div class="content" in:fade>
    <Card>
        <!-- header -->
        <Header
            title="Edit Outgoing Item"
            back={Back}
            slot="header"
            url="../outgoing"
        >
            <div class="btn-group" slot="controls">
                <button class="btn" {disabled} on:click={onSave}>Save</button>
                <button class="btn" {disabled} on:click={onUndo}>Undo</button>
                <button
                    class="btn btn-danger alt-dm"
                    {disabled}
                    on:click={onDelete}
                >
                    Delete
                </button>
            </div>
        </Header>
        <!-- enable form -->
        <EnableForm on:on-toggle={() => (disabled = !disabled)} />
        <!-- queses -->
        {#if ques.saving}
            <Ques message={`Saving...`} type="saving" />
        {/if}
        {#if ques.deleting}
            <Ques message={`Deleting...`} type="deleting" />
        {/if}
        <!-- form body -->
        <fieldset class="p-card">
            <legend class="form-text text-primary">Edit: {mutable.id}</legend>
            <!-- is product arrived -->
            <div class="custom-checkbox">
                <input
                    type="checkbox"
                    id="has-arrived"
                    {disabled}
                    bind:checked={mutable.arrived}
                />
                <label for="has-arrived">
                    Check this if product is already shipped and arrived to
                    destination
                </label>
            </div>
            <br />
            <!-- form body -->
            <div class="form-row row-eq-em-spacing">
                <div class="col-sm">
                    <!-- product information -->
                    <label for="product">Product</label>
                    <select
                        id="product"
                        class="form-control"
                        {disabled}
                        bind:value={mutable.product}
                    >
                        {#each products as product}
                            <option value={product[0]} class="text-truncate">
                                {product[1] + " " + product[2]}
                            </option>
                        {/each}
                    </select>
                    <!-- product quantity -->
                    <label for="quantity">Quantity</label>
                    <input
                        {disabled}
                        bind:value={mutable.quantity}
                        type="number"
                        id="quantity"
                        class="form-control"
                        min="0"
                    />
                </div>
                <div class="p-5" />
                <div class="col-sm">
                    <!-- product supplier -->
                    <label for="supplier">Client</label>
                    <select
                        id="supplier"
                        class="form-control text-capitalize"
                        {disabled}
                        bind:value={mutable.client}
                    >
                        {#each customers as client}
                            <option value={client[0]} class="text-capitalize">
                                {client[1] + " " + client[2]}
                            </option>
                        {/each}
                    </select>
                    <!-- product shipment  -->
                    <label for="shipment">Shipment</label>
                    <input
                        autocomplete="true"
                        type="date"
                        id="shipment"
                        class="form-control"
                        {disabled}
                        bind:value={mutable.shipment}
                    />
                </div>
            </div>
        </fieldset>
    </Card>
</div>
