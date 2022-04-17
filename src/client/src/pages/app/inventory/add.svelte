<script context="module">
    /**
     * TODO LIST:
     * 1. Sanitize Data Before Save ✔️
     * 2. Handle Before Leave (Prevent Leaving Unsaved Changes) ✔️
     */
    const immutableData = {
        id: "",
        product: "",
        description: "",
        unit_price: 0,
        max: 1,
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
    let categories = [];
    let warehouses = [];
    let saving = false;
    let maxQty = 1;

    let data = { ...immutableData };

    //detect unsaved changes
    $beforeUrlChange(async (event, route) => {
        let keys = Object.keys(immutableData);
        const isMutated = keys.every(
            (item) => data[item] === immutableData[item]
        );
        if (saving) {
            //if saving is active then proceed exit
            return true;
        } else if (!isMutated) {
            //if data is mutated and unsaved
            const prompt = await window.dialogs.message({
                title: "Leave Page",
                message: "Discard Unsaved changes?",
                buttons: ["Cancel", "Ok"],
            });
            if (prompt.response === 1) {
                return true;
            } else {
                return false;
            }
            //if form is untouched
        } else {
            return true;
        }
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
                categories = response.categories || [];
                warehouses = response.warehouses || [];
            })
            .catch((error) => console.error(error));
    });

    //FORM
    function useForm(node) {
        node.addEventListener("submit", async (event) => {
            event.preventDefault();
            const formData = new FormData(event.target);
            const formProps = Object.fromEntries(formData);

            const immutable = {
                id: formProps.id.trim(),
                product: formProps.product.trim(),
                description: formProps.description.trim(),
                unit_price: +formProps.unit_price,
                max: +formProps.max,
                quantity: +formProps.quantity,
                category: formProps.category,
                warehouse: formProps.warehouse,
            };

            try {
                const idExist = await window.inventory.itemExists(immutable.id);
                if (idExist) {
                    throw new Error(`ID [${immutable.id}] already Exists`);
                } else {
                    window.inventory
                        .addOne({ row: immutable })
                        .then((response) => {
                            saving = true;
                            setTimeout(() => {
                                $goto("/app/inventory");
                            }, 1500);
                        });
                }
            } catch (error) {
                window.dialogs.error({
                    title: "Error",
                    message: error.message,
                });
            }
        });
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
        maxQty = data.max;
    }
</script>

<form class="content" in:fly={{ x: 100 }} action="/" method="POST" use:useForm>
    <Card>
        <Header
            title="Add New Item"
            slot="header"
            back={Back}
            url="../inventory"
        >
            <div class="btn-group" slot="controls">
                <input type="submit" class="btn" value="Save" />
                <button class="btn" on:click|preventDefault={onClear}>
                    Clear
                </button>
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
                    <label for="id" class="required">Product ID</label>
                    <div class="input-group">
                        <input
                            required
                            minlength="3"
                            type="text"
                            class="form-control"
                            id="id"
                            name="id"
                            bind:value={data.id}
                        />
                        <div class="input-group-append">
                            <button
                                class="btn shadow-none"
                                on:click|preventDefault={() =>
                                    (data.id = window.util.randomUUID())}
                            >
                                Generate ID
                            </button>
                        </div>
                    </div>
                    <!-- product name -->
                    <label for="product-name" class="required">Product</label>
                    <input
                        required
                        minlength="3"
                        type="text"
                        name="product"
                        id="product-name"
                        class="form-control"
                        bind:value={data.product}
                        placeholder="Apple Bottom Jeans"
                    />
                    <!-- product description -->
                    <label for="product-desc">Description</label>
                    <textarea
                        maxlength="255"
                        style="resize: none;height: 150px"
                        name="description"
                        id="product-desc"
                        class="form-control"
                        bind:value={data.description}
                        placeholder="Large / 2xxl / Special Edition"
                    />
                </div>
                <div class="p-5" />
                <div class="col-sm">
                    <!-- product categories -->
                    <label for="product-category" class="required"
                        >Category</label
                    >
                    <select
                        required
                        name="category"
                        id="product-category"
                        class="form-control"
                        bind:value={data.category}
                    >
                        {#each categories as category}
                            <option value={category[0]}>{category[1]}</option>
                        {/each}
                    </select>
                    <!-- product unit price -->
                    <label for="unit-price" class="required">Unit Price</label>
                    <div class="input-group">
                        <div class="input-group-prepend">
                            <div class="input-group-text">&#8369</div>
                        </div>
                        <input
                            required
                            min="0"
                            type="number"
                            pattern="[0-9]+([\.,][0-9])?"
                            step="0.01"
                            class="form-control"
                            name="unit_price"
                            id="unit-price"
                            bind:value={data.unit_price}
                            placeholder="0.0"
                        />
                    </div>
                    <!-- product max quantity -->
                    <label for="max-qty" class="required">Max Quantity</label>
                    <input
                        required
                        type="number"
                        min="1"
                        class="form-control"
                        name="max"
                        id="max-qty"
                        bind:value={data.max}
                    />
                    <!-- product quantity -->
                    <label for="qty" class="required">Quantity</label>
                    <input
                        requried
                        type="number"
                        min="0"
                        max={maxQty}
                        class="form-control"
                        name="quantity"
                        id="qty"
                        bind:value={data.quantity}
                    />
                    <!-- product warehouse location -->
                    <label for="warehouse-dest" class="required"
                        >Destination</label
                    >
                    <select
                        required
                        name="warehouse"
                        id="warehouse-dest"
                        class="form-control"
                        bind:value={data.warehouse}
                    >
                        {#each warehouses as warehouse}
                            <option value={warehouse[0]}>
                                {warehouse[1] + " " + warehouse[2]}
                            </option>
                        {/each}
                    </select>
                </div>
            </div>
        </fieldset>
    </Card>
</form>
