<script context="module">
    /**
     * TODO LIST
     * 1. Sanitize Data Before Save ✔️
     * 2. Handle Before Leave (Unsaved Edits) ✔️
     */
    const immutableData = {
        id: "",
        product: "",
        quantity: 1,
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
    let maxQty = 0;

    let data = { ...immutableData };

    //TODO: check if data is mutated
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

    //FORM
    async function useForm(node, parameters) {
        node.addEventListener("submit", async (event) => {
            event.preventDefault();
            const formData = new FormData(event.target);
            const formProps = Object.fromEntries(formData);

            const immutable = {
                id: formProps.id.trim(),
                product: formProps.product,
                quantity: +formProps.quantity,
                shipment: formProps.shipment,
                arrival: formProps.arrival,
                arrived: 0,
                supplier: formProps.supplier,
            };

            try {
                const idExist = await window.ingoing.itemExists(immutable.id);
                if (idExist) {
                    throw new Error(`ID [${immutable.id}] already Exists`);
                } else if (immutable.quantity < 1) {
                    throw new Error(
                        "Field: [Quantity]\nOrder Quantity Must Not Be None Or Zero"
                    );
                } else if (
                    new Date(immutable.shipment) < new Date(Date.now())
                ) {
                    //TODO: Handle Shipment Date Computation
                    throw new Error(
                        `Field: [Shipment]\nShipment Date Must Not Be The Same or Older Than Today\nCurrent Date: ${new Date(
                            Date.now()
                        ).toLocaleDateString()}`
                    );
                } else if (
                    new Date(immutable.arrival) < new Date(immutable.shipment)
                ) {
                    throw new Error(
                        `Field: [Arrival]\nArrival Date Must Not Be Older Than Shipment Date\nShipment Date ${new Date(
                            immutable.shipment
                        ).toLocaleString()}`
                    );
                } else {
                    window.ingoing
                        .addOne({ row: immutable })
                        .then((response) => {
                            saving = true;
                            setTimeout(() => {
                                $goto("/app/ingoing");
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

        const filtered = products.filter((item) => {
            return item[0] === data.product;
        });
        maxQty =
            filtered.length !== 0 ? filtered[0][filtered[0].length - 1] : 1;
    }
</script>

<form class="content" in:fly={{ x: 100 }} action="/" method="POST" use:useForm>
    <Card>
        <Header
            title="Import Add New"
            slot="header"
            back={Back}
            url="../ingoing"
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
            <legend class="form-text w-full text-primary">
                Order ID : [{data.id}]
            </legend>
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
                    <select
                        required
                        name="product"
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
                    <label for="product-qty" class="required"
                        >Quantity <span class="font-italic">
                            {`Available: [${maxQty}]`}
                        </span>
                    </label>
                    <input
                        requried
                        type="number"
                        min="1"
                        max={maxQty}
                        class="form-control"
                        id="product-qty"
                        name="quantity"
                        bind:value={data.quantity}
                    />
                    <!-- product supplier -->
                    <label for="product-sup" class="required">Supplier</label>
                    <select
                        required
                        name="supplier"
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
                    <label for="shipment" class="required">Shipment</label>
                    <input
                        type="date"
                        id="shipment"
                        class="form-control"
                        bind:value={data.shipment}
                        required
                        name="shipment"
                    />
                    <!-- product arrival -->
                    <label for="arrival" class="required"
                        >Arrival (Expected)</label
                    >
                    <input
                        type="date"
                        id="arrival"
                        class="form-control"
                        bind:value={data.arrival}
                        required
                        name="arrival"
                    />
                </div>
            </div>
        </fieldset>
    </Card>
</form>
