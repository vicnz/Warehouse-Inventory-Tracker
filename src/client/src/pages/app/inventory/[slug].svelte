<script>
    /**
     * TODO LIST:
     * 1. Sanitize Data Before Save
     */
    import { params, goto, beforeUrlChange } from "@roxi/routify";
    import { onMount } from "svelte";
    import { fade } from "svelte/transition";
    //componnts
    import Card from "../../../lib/ui/card.svelte";
    import Header from "../../../lib/ui/tableheader.svelte";
    import EnableForm from "../../../lib/ui/enableform.svelte";
    import Ques from "../../../lib/ui/animation/ques.svelte";
    import Back from "../../../lib/ui/BackButton.svelte";
    //
    $: slug = $params.slug; //route param
    let disabled = true; //form disabled?
    $: categories = []; //preloaded category list
    $: warehouses = []; //preloaded warehouse list
    $: item = [];
    let mutable = {};
    //used for animation
    let ques = {
        saving: false,
        deleting: false,
    };

    //await preload
    onMount(() => {
        async function preloadData() {
            //product information
            const inventoryItem = await window.inventory.getOne({
                id: slug,
            });
            //category list
            const categoryList = await window.shared.categoryList();
            //warehouse list
            const warehouseList = await window.shared.warehouseList();

            return {
                columns: inventoryItem.columns,
                item: inventoryItem.data,
                categories: categoryList.values,
                warehouses: warehouseList.values,
            };
        }
        //load
        preloadData()
            .then((res) => {
                categories = res.categories;
                warehouses = res.warehouses;
                item = res.item[0];
                mutable = { ...item };
            })
            .catch((error) => console.error(error));
    });

    //before URL change
    $beforeUrlChange(async (event, route) => {
        if (!disabled) {
            const prompt = await window.dialogs.message({
                type: "warning",
                title: "Leaving Page...",
                message: "Are you sure you want to discard changes?",
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

    //on save
    async function onSave() {
        window.inventory
            .updateOne({
                row: mutable,
            })
            .then((res) => {
                ques.saving = true;
                disabled = true;
                setTimeout(() => {
                    ques.saving = false;
                    $goto("/app/inventory");
                }, 1500);
            })
            .catch((err) => console.error(err));
    }
    //reset data
    async function onUndo() {
        const prompt = await window.dialogs.message({
            title: "Clear Items",
            message: "Clear Modified Changes?",
            buttons: ["Cancel", "Ok"],
        });
        if (prompt.response === 1) {
            mutable = { ...item };
        } else {
            return;
        }
    }

    //delete item
    async function onDelete() {
        const prompt = await window.dialogs.message({
            type: "warning",
            title: "Delete Item",
            message: `Are you sure you want to delete [${mutable.product}]?`,
            detail: "This will delete this item permanently",
            buttons: ["Cancel", "Ok"],
        });
        if (prompt.response === 1) {
            //Delete item
            window.inventory
                .deleteOne({ id: mutable.id })
                .then((res) => {
                    ques.deleting = true;
                    disabled = true;
                    setTimeout(() => {
                        $goto("/app/inventory");
                    }, 1500);
                })
                .catch((error) => console.error(error));
        } else {
            return;
        }
    }
</script>

<div class="content" in:fade>
    <Card>
        <Header
            slot="header"
            title="Edit Inventory Item"
            url="../inventory"
            back={Back}
        >
            <div class="btn-group" slot="controls">
                <!-- save item -->
                <button class="btn" {disabled} on:click={onSave}> Save </button>
                <!-- undo changes -->
                <button class="btn" {disabled} on:click={onUndo}> Undo </button>
                <!-- delete item -->
                <button
                    class="btn alt-dm btn-danger"
                    {disabled}
                    on:click={onDelete}
                >
                    Delete
                </button>
            </div>
        </Header>
        <!-- enable form -->
        <EnableForm on:on-toggle={() => (disabled = !disabled)} />

        <!-- ques -->
        {#if ques.saving}
            <Ques message={`Saving ${mutable.product}...`} type="saving" />
        {:else if ques.deleting}
            <Ques message={`Deleting ${mutable.product}...`} type="deleting" />
        {/if}

        <!-- form body -->
        <fieldset class="p-card">
            <legend class="text-primary font-italic form-text">
                Edit:
                {mutable.id}
            </legend>
            <div class="form-row row-eq-sm-spacing">
                <div class="col-sm">
                    <!-- product name -->
                    <label for="product-name">Product</label>
                    <input
                        type="text"
                        class="form-control"
                        bind:value={mutable.product}
                        {disabled}
                    />
                    <!-- product description -->
                    <label for="product-desc">Description</label>
                    <textarea
                        id="product-desc"
                        style="height:210px;resize: none"
                        class="form-control"
                        bind:value={mutable.description}
                        {disabled}
                    />
                </div>
                <div class="p-5" />
                <div class="col-sm">
                    <!-- product-category -->
                    <label for="product-category">Category</label>
                    <select
                        id="product-category"
                        class="form-control"
                        bind:value={mutable.category}
                        {disabled}
                    >
                        {#each categories as category}
                            <option value={category[0]}>
                                {category[1]}
                            </option>
                        {/each}
                    </select>

                    <!-- product unit price -->
                    <label for="unit-price">Unit Price</label>
                    <div class="input-group">
                        <div class="input-group-prepend">
                            <div class="input-group-text">&#8369</div>
                        </div>
                        <input
                            type="number"
                            min="0"
                            class="form-control"
                            name="unit-price"
                            id="unit-price"
                            bind:value={mutable.unit_price}
                            {disabled}
                        />
                    </div>
                    <!-- product max quantity -->
                    <label for="max-qty">Max Quantity</label>
                    <input
                        type="number"
                        min="0"
                        class="form-control"
                        name="max-qty"
                        id="max-qty"
                        bind:value={mutable.max}
                        {disabled}
                    />
                    <!-- product quantity -->
                    <label for="qty">Quantity</label>
                    <input
                        type="number"
                        min="0"
                        class="form-control"
                        name="qty"
                        id="qty"
                        {disabled}
                        bind:value={mutable.quantity}
                    />
                    <!-- product warehouse location -->
                    <label for="warehouse-dest">Destination</label>
                    <select
                        name="warehouse-dest"
                        id="warehouse-dest"
                        class="form-control"
                        bind:value={mutable.warehouse}
                        {disabled}
                    >
                        {#each warehouses as warehouse}
                            <option value={warehouse[0]}>
                                {warehouse[1] + " " + warehouse[3]}
                            </option>
                        {/each}
                    </select>
                </div>
            </div>
        </fieldset>
    </Card>
</div>
