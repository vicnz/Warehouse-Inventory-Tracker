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
        arrived: 0,
        client: "",
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
    let clients = [];
    let saving = false;
    let maxQty = 1;

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
            const clientList = await window.shared.customerList();

            return {
                products: productList.values,
                clients: clientList.values,
            };
        }
        //load data
        preloadData()
            .then((response) => {
                products = response.products;
                clients = response.clients;
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
                arrived: 0,
                client: formProps.client,
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
                } else {
                    window.outgoing
                        .addOne({ row: immutable })
                        .then((response) => {
                            saving = true;
                            setTimeout(() => {
                                $goto("/app/outgoing");
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
            message: "Clear Changes?",
            buttons: ["Cancel", "Ok"],
        });

        if (prompt.response === 1) {
            data = { ...immutableData };
        } else {
            return;
        }
    }

    //ONCHANGED
    $: {
        data = {
            ...data,
            id: data.id.replace(/[\s]+/, "-"),
        };

        const filtered = products.filter((item) => {
            return item[0] === data.product;
        });
        maxQty =
            filtered.length !== 0 ? filtered[0][filtered[0].length - 2] : 1;
    }
</script>

<form class="content" in:fly={{ x: 100 }} action="/" method="POST" use:useForm>
    <Card>
        <Header
            title="Export Add New"
            slot="header"
            back={Back}
            url="../outgoing"
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
                Order ID: [{data.id}]
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
                    <label for="product-qty" class="required">
                        Quantity
                        <span class="font-italic">Max [{maxQty}]</span>
                    </label>
                    <input
                        required
                        name="quantity"
                        type="number"
                        min="1"
                        max={maxQty}
                        class="form-control"
                        id="product-qty"
                        bind:value={data.quantity}
                    />
                </div>
                <div class="p-5" />
                <div class="col-sm">
                    <!-- product supplier -->
                    <label for="product-sup" class="required">Client</label>
                    <select
                        required
                        name="client"
                        class="form-control text-capitalize"
                        id="product-sup"
                        bind:value={data.client}
                    >
                        {#each clients as client}
                            <option value={client[0]} class="text-capitalize">
                                {client[1] + ", " + client[2]}
                            </option>
                        {/each}
                    </select>
                    <!-- product shipment -->
                    <label for="shipment" class="required">Shipment</label>
                    <input
                        required
                        name="shipment"
                        type="date"
                        id="shipment"
                        class="form-control"
                        bind:value={data.shipment}
                    />
                </div>
            </div>
        </fieldset>
    </Card>
</form>
