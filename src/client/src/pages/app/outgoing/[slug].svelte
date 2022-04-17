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
    let maxQty = 1;
    let readonly = false;
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
            customers = response.customers || [];
            products = response.products || [];
            data = response.item;
            mutable = {
                ...data[0],
                arrived: data[0].arrived === 1 ? true : false,
                shipment: toClientDate(data[0].shipment),
            };
            readonly = mutable.arrived;
        });
    });

    //FORM
    async function useForm(node, parameters) {
        node.addEventListener("submit", async (event) => {
            event.preventDefault();
            const formData = new FormData(event.target);
            const formProps = Object.fromEntries(formData);

            const immutable = {
                id: formProps.id,
                product: formProps.product,
                quantity: +formProps.quantity,
                shipment: formProps.shipment,
                arrived: formProps.arrived === "on",
                client: formProps.client,
            };

            try {
                if (immutable.quantity < 1) {
                    throw new Error(
                        "Field: [Quantity]\nOrder Quantity Must Not Be None Or Zero"
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
                    console.log(immutable);
                    ques.saving = true;
                    setTimeout(() => {
                        disabled = true;
                        window.outgoing.updateOne({ row: immutable });
                        $goto("../outgoing");
                    }, 1000);
                }
            } catch (error) {
                window.dialogs.error({
                    title: "Error",
                    message: error.message,
                });
            }
        });
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

    //Arrived Checked
    async function onCheckedArrived(event) {
        const prompt = await window.dialogs.message({
            type: "warning",
            title: "Arrived?",
            message: "✔️ Is Shipped or Not?",
            detail: "Once an item is marked as shipped and arrived it can no longer be modified",
            buttons: ["Cancel", "Ok"],
        });

        if (prompt.response === 1) {
            return;
        } else {
            const temp = event.target.checked;
            event.target.checked = !temp;
        }
    }

    $: {
        if (!disabled) {
            //initialize max quantity
            const filtered = products.filter((item) => {
                return item[0] === mutable.product;
            });
            maxQty =
                filtered.length !== 0 ? filtered[0][filtered[0].length - 2] : 1;
        }
    }
</script>

<form class="content" in:fade action="/" method="POST" use:useForm>
    <Card>
        <!-- header -->
        <Header
            title="Outgoing : Edit"
            back={Back}
            slot="header"
            url="../outgoing"
        >
            <div class="btn-group" slot="controls">
                <input type="submit" class="btn" {disabled} value="Save" />
                <button class="btn" {disabled} on:click|preventDefault={onUndo}
                    >Undo</button
                >
                {#if readonly}
                    <button
                        class="btn btn-danger alt-dm"
                        on:click|preventDefault={onDelete}
                    >
                        Delete
                    </button>
                {:else}
                    <button
                        class="btn btn-danger alt-dm"
                        {disabled}
                        on:click|preventDefault={onDelete}
                    >
                        Delete
                    </button>
                {/if}
            </div>
        </Header>
        {#if !readonly}
            <!-- enable form -->
            <EnableForm on:on-toggle={() => (disabled = !disabled)} />
        {:else}
            <div class="alert alert-primary border-0 rounded-0">
                <span class="badge badge-primary text-uppercase badge-pill"
                    >arrived</span
                >
            </div>
        {/if}
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
                    name="arrived"
                    id="has-arrived"
                    {disabled}
                    bind:checked={mutable.arrived}
                    on:change={onCheckedArrived}
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
                    <!-- product id info -->
                    <input type="hidden" name="id" value={mutable.id} />
                    <!-- product information -->
                    <label for="product">Product</label>
                    <select
                        required
                        name="product"
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
                    <label for="quantity">
                        Quantity
                        <span class="font-italic text-primary">
                            Max [{maxQty}]
                        </span>
                    </label>
                    <input
                        required
                        name="quantity"
                        {disabled}
                        bind:value={mutable.quantity}
                        type="number"
                        id="quantity"
                        class="form-control"
                        min="1"
                        max={maxQty}
                    />
                </div>
                <div class="p-5" />
                <div class="col-sm">
                    <!-- product supplier -->
                    <label for="supplier">Client</label>
                    <select
                        required
                        id="supplier"
                        class="form-control text-capitalize"
                        name="client"
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
                        required
                        name="shipment"
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
</form>
