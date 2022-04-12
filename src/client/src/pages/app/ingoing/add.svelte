<script context="module">
    /**
     * TODO LIST
     * 1. Sanitize Data Before Save
     * 2. Handle Before Leave (Unsaved Edits)
     */
    const immutableData = {
        id: "",
        product: "",
        quantity: "",
        shipment: Date.now(),
        arrival: Date.now(),
        arrived: 0,
        supplier: "",
    };
</script>

<script>
    import { toDatabaseDate } from "../../../lib/ui/utils";
    import { onMount } from "svelte";
    import { fly } from "svelte/transition";
    import { beforeUrlChange, goto } from "@roxi/routify";
    //components
    import Card from "../../../lib/ui/card.svelte";
    import Header from "../../../lib/ui/tableheader.svelte";
    import Ques from "../../../lib/ui/animation/ques.svelte";
    import Back from "../../../lib/ui/BackButton.svelte";
    let products = [];
    let suppliers = [];
    let saving = false;

    let data = { ...immutableData };

    //TODO: check if data is mutated
    $beforeUrlChange((event, route) => {
        return true;
    });

    //mount
    onMount(() => {
        async function preloadData() {
            const productList = await window.shared.productList();
            const suppliers = await window.shared.supplierList();

            return {
                products: productList.values,
                suppliers: suppliers.values,
            };
        }
        //load data
        preloadData()
            .then((response) => {
                products = response.products;
                suppliers = response.suppliers;
            })
            .catch((error) => console.error(error));
    });

    //on item saved
    function onSave() {
        //TODO: sanitize data
        const parsed = {
            ...data,
            shipment: toDatabaseDate(data.shipment),
            arrival: toDatabaseDate(data.arrival),
        };
        window.ingoing
            .addOne({ row: parsed })
            .then((response) => {
                saving = true;
                setTimeout(() => {
                    $goto("/app/ingoing");
                }, 1500);
            })
            .catch((err) => console.error(err));
    }
    //on form cleared
    async function onClear() {
        const prompt = await window.dialogs.message({
            title: "Clear",
            message: "Clear Changes?",
            buttons: ["Cancel", "Ok"],
        });

        if (prompt.response === 1) {
            data = { ...immutableData };
        } else {
            return;
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
            title="Import Add New"
            slot="header"
            back={Back}
            url="../ingoing"
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
            <legend class="form-text w-full text-primary">
                Order ID : [{data.id}]
            </legend>
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
                    <select
                        class="form-control text-capitalize"
                        id="product-name"
                        bind:value={data.product}
                    >
                        {#each products as product}
                            <option value={product[0]} class="text-capitalize">
                                {product[1] + " " + product[2]}
                            </option>
                        {/each}
                    </select>
                    <!-- product description -->
                    <label for="product-qty">Quantity</label>
                    <input
                        type="number"
                        min="1"
                        class="form-control"
                        id="product-qty"
                        bind:value={data.quantity}
                    />
                    <!-- product supplier -->
                    <label for="product-sup">Supplier</label>
                    <select
                        class="form-control text-capitalize"
                        id="product-sup"
                        bind:value={data.supplier}
                    >
                        {#each suppliers as supplier}
                            <option value={supplier[0]} class="text-capitalize">
                                {supplier[1] + ", " + supplier[2]}
                            </option>
                        {/each}
                    </select>
                </div>
                <div class="p-5" />
                <div class="col-sm">
                    <!-- product shipment -->
                    <label for="shipment">Shipment</label>
                    <input type="date" id="shipment" class="form-control" />
                    <!-- product arrival -->
                    <label for="arrival">Arrival (Expected)</label>
                    <input type="date" id="arrival" class="form-control" />
                </div>
            </div>
        </fieldset>
    </Card>
</div>
