<script>
    /**
     * TODO LIST
     * 1. Sanitize Data Before Save
     */
    import { scale, fade } from "svelte/transition";
    import { params, goto, beforeUrlChange } from "@roxi/routify";
    import { onMount } from "svelte";
    //components
    import Card from "../../../lib/ui/card.svelte";
    import Header from "../../../lib/ui/tableheader.svelte";
    import EnableForm from "../../../lib/ui/enableform.svelte";
    import Ques from "../../../lib/ui/animation/ques.svelte";
    import Back from "../../../lib/ui/BackButton.svelte";
    import { toClientDate } from "../../../lib/ui/utils";
    let disabled = true;
    $: ques = {
        saving: false,
        deleting: false,
    };
    $: slug = $params.slug;
    $: suppliers = [];
    $: products = [];
    $: data = {};
    $: mutable = {};

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
            const suppliers = await window.shared.supplierList();
            const productList = await window.shared.productList();

            const ingoing = await window.ingoing.getOne({ id: slug });
            return {
                item: ingoing.data,
                products: productList.values,
                suppliers: suppliers.values,
            };
        }

        loadData().then((response) => {
            suppliers = response.suppliers;
            products = response.products;
            data = response.item;
            mutable = {
                ...data[0],
                arrived: data[0].arrived === 1 ? true : false,
                shipment: toClientDate(data[0].shipment),
                arrival: toClientDate(data[0].arrival),
            };
        });
    });

    function onSave() {
        //TODO: sanitize data
        ques.saving = true;
        setTimeout(() => {
            disabled = true;
            window.ingoing.updateOne({ row: mutable });
            $goto("../ingoing");
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
                arrival: toClientDate(data[0].arrival),
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
                $goto("../ingoing");
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
            title="Edit Ingoing Item"
            back={Back}
            slot="header"
            url="../ingoing"
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
                    <!-- product supplier -->
                    <label for="supplier">Supplier</label>
                    <select
                        id="supplier"
                        class="form-control text-capitalize"
                        {disabled}
                        bind:value={mutable.supplier}
                    >
                        {#each suppliers as supplier}
                            <option value={supplier[0]} class="text-capitalize">
                                {supplier[1] + " " + supplier[2]}
                            </option>
                        {/each}
                    </select>
                </div>
                <div class="p-5" />
                <div class="col-sm">
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
                    <!--product arrival-->
                    <label for="arrival">Arrival (Expected)</label>
                    <input
                        type="date"
                        id="arrival"
                        class="form-control"
                        {disabled}
                        bind:value={mutable.arrival}
                    />
                </div>
            </div>
        </fieldset>
    </Card>
</div>
