<script context="module">
    /**
     * TODO LIST:
     * 1. Sanitize Data Before Save
     * 2. Handle Before Leave (Prevent Leaving Unsaved Changes)
     */
    const immutableData = {
        id: "",
        product: "",
        description: "",
        unit_price: 0,
        max: 0,
        quantity: 0,
        category: "",
        warehouse: "",
    };
</script>

<script>
    import { fly } from "svelte/transition";
    import { onMount } from "svelte";
    import { beforeUrlChange, goto } from "@roxi/routify";
    //components
    import Card from "../../../lib/ui/card.svelte";
    import Header from "../../../lib/ui/tableheader.svelte";
    import Ques from "../../../lib/ui/animation/ques.svelte";
    import Back from "../../../lib/ui/BackButton.svelte";
    import { sanitize } from "../../../lib/ui/utils";
    let categories = [];
    let warehouses = [];
    let saving = false;

    let data = { ...immutableData };

    //TODO : detect unsaved changes
    $beforeUrlChange((event, route) => {
        return true;
    });

    //mount
    onMount(() => {
        //preload data
        async function preloadData() {
            const categoryList = await window.shared.categoryList();
            const warehouseList = await window.shared.warehouseList();

            return {
                categories: categoryList.values,
                warehouses: warehouseList.values,
            };
        }
        //load data
        preloadData()
            .then((response) => {
                categories = response.categories;
                warehouses = response.warehouses;
            })
            .catch((error) => console.error(error));
    });

    //on item saved
    function onSave() {
        //TODO: sanitize data
        // let isApproved = sanitize(data, ["description"]);
        // console.log(isApproved);
        if (true) {
            if (data.quantity > data.max) {
                window.dialogs.error({
                    title: "Data Error",
                    message: "[Quantity] must not exceed [Max Quantity] Value",
                });
            } else {
                window.inventory
                    .addOne({ row: data })
                    .then((response) => {
                        saving = true;
                        setTimeout(() => {
                            $goto("/app/inventory");
                        }, 1500);
                    })
                    .catch((err) => console.error(err));
            }
        }
    }
    //on form cleared
    async function onClear() {
        const prompt = await window.dialogs.message({
            title: "Clear",
            message: "Clear Unsaved changes?",
            buttons: ["Cancel", "Ok"],
        });

        if (prompt.response === 1) {
            data = { ...immutableData };
        }
    }

    $: {
        data = {
            ...data,
            id: data.id.replace(/[\s]+/, "-"),
        };
    }
</script>

<div class="content" in:fly={{ x: 100 }}>
    <Card>
        <Header
            title="Add New Item"
            slot="header"
            back={Back}
            url="../inventory"
        >
            <div class="btn-group" slot="controls">
                <button class="btn" on:click={onSave}> Save </button>
                <button class="btn" on:click={onClear}> Clear </button>
            </div>
        </Header>

        {#if saving}
            <Ques message={`Saving ${data.product}...`} type="saving" />
        {/if}

        <!-- product details -->
        <fieldset class="p-card">
            <legend class="form-text w-full text-primary"
                >Product Information: [{data.id}]</legend
            >
            <div class="form-row row-eq-sm-spacing">
                <div class="col">
                    <!-- id generator -->
                    <label for="id">Product ID</label>
                    <div class="input-group">
                        <input
                            type="text"
                            class="form-control"
                            id="id"
                            name="product-id"
                            bind:value={data.id}
                        />
                        <div class="input-group-append">
                            <button
                                class="btn shadow-none"
                                on:click={() =>
                                    (data.id = window.util.randomUUID())}
                            >
                                Generate ID
                            </button>
                        </div>
                    </div>
                    <!-- product name -->
                    <label for="product-name">Product</label>
                    <input
                        type="text"
                        name="product-name"
                        id="product-name"
                        class="form-control"
                        bind:value={data.product}
                        placeholder="Apple Jeans"
                    />
                    <!-- product description -->
                    <label for="product-desc">Description</label>
                    <textarea
                        style="resize: none;height: 150px"
                        name="product-desc"
                        id="product-desc"
                        class="form-control"
                        bind:value={data.description}
                        placeholder="Large / 2xxl / Special Edition"
                    />
                </div>
                <div class="p-5" />
                <div class="col-sm">
                    <!-- product categories -->
                    <label for="product-category">Category</label>
                    <select
                        name="product-category"
                        id="product-category"
                        class="form-control"
                        bind:value={data.category}
                    >
                        {#each categories as category}
                            <option value={category[0]}>{category[1]}</option>
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
                            bind:value={data.unit_price}
                            placeholder="0.0"
                        />
                    </div>
                    <!-- product max quantity -->
                    <label for="max-qty">Max Quantity</label>
                    <input
                        type="number"
                        min="1"
                        class="form-control"
                        name="max-qty"
                        id="max-qty"
                        bind:value={data.max}
                    />
                    <!-- product quantity -->
                    <label for="qty">Quantity</label>
                    <input
                        type="number"
                        min="0"
                        class="form-control"
                        name="qty"
                        id="qty"
                        bind:value={data.quantity}
                    />
                    <!-- product warehouse location -->
                    <label for="warehouse-dest">Destination</label>
                    <select
                        name="warehouse-dest"
                        id="warehouse-dest"
                        class="form-control"
                        bind:value={data.warehouse}
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
