<script>
    /**
     * TODO LIST
     * 1. Sanitize Data Before Save
     * 2. Impose Data Integrity on Fields
     */

    import { goto } from "@roxi/routify";
    import Card from "../../../../lib/ui/card.svelte";
    import Header from "../../../../lib/ui/tableheader.svelte";
    import Back from "../../../../lib/ui/BackButton.svelte";
    import Que from "../../../../lib/ui/animation/ques.svelte";
    import { fly } from "svelte/transition";
    let save = false;
    const immutable = {
        id: "",
        name: "",
        company: "",
        address: "",
        contact: "",
        email: "",
        type: "customer",
    };

    let mutable = { ...immutable };
    //sanitize id
    $: {
        mutable = {
            ...mutable,
            id: mutable.id.replace(/\s/, "-"),
        };
    }

    //on form cleared
    async function onClear() {
        const prompt = await window.dialogs.message({
            title: "Clear",
            message: "Clear Changes?",
            buttons: ["Cancel", "Ok"],
        });

        if (prompt.response === 1) {
            mutable = { ...immutable };
        } else {
            return;
        }
    }
    //on item saved
    function onSave() {
        //TODO: sanitize data
        window.clients
            .addOneCustomer({ rows: mutable })
            .then((response) => {
                save = true;
                setTimeout(() => {
                    $goto("/app/clients/customers");
                }, 1500);
            })
            .catch((err) => console.error(err));
    }
</script>

<div class="content" in:fly={{ x: 100 }} out:fly={{ x: 100 }}>
    <Card>
        <Header
            slot="header"
            title="Add New Customer"
            url="../customers"
            back={Back}
        >
            <div class="btn-group" slot="controls">
                <button class="btn" on:click={onSave}>Save</button>
                <button class="btn" on:click={onClear}>Clear</button>
            </div>
        </Header>
        <!-- saving que -->
        {#if save}
            <Que message={`Saving ${mutable.name}`} type="saving" />
        {/if}
        <!-- form-body -->
        <div class="p-card">
            <fieldset>
                <legend>
                    Customer ID <span class="text-primary">{mutable.id}</span>
                </legend>
            </fieldset>
            <hr />
            <div class="form-row row-eq-sm-spacing">
                <div class="col-sm">
                    <!-- client id -->
                    <label for="client-id">ID</label>
                    <div class="input-group">
                        <input
                            type="text"
                            id="client-id"
                            class="form-control"
                            bind:value={mutable.id}
                        />
                        <div class="input-group-append">
                            <button
                                class="btn shadow-none"
                                on:click={() => {
                                    mutable = {
                                        ...mutable,
                                        id: window.util.randomUUID(),
                                    };
                                }}
                            >
                                Generate ID
                            </button>
                        </div>
                    </div>
                    <!-- client name -->
                    <label for="client-name">Name</label>
                    <input
                        type="text"
                        id="client-name"
                        class="form-control"
                        bind:value={mutable.name}
                        placeholder="John Appleseed"
                    />
                    <!-- client company -->
                    <label for="client-company">Company</label>
                    <input
                        type="text"
                        id="client-company"
                        class="form-control"
                        bind:value={mutable.company}
                        placeholder="Applesseed.co ltd"
                    />
                    <!-- client address -->
                    <label for="client-address">Address</label>
                    <textarea
                        id="client-address"
                        class="form-control"
                        bind:value={mutable.address}
                    />
                </div>
                <div class="p-5" />
                <div class="col-sm">
                    <!-- client contact -->
                    <label for="client-contact">Contact</label>
                    <div class="input-group">
                        <div class="input-group-prepend">
                            <div class="input-group-text">+63</div>
                        </div>
                        <input
                            placeholder="000-000-000"
                            type="text"
                            id="client-contact"
                            class="form-control"
                            bind:value={mutable.contact}
                        />
                    </div>
                    <!-- client email -->
                    <label for="client-email">Email</label>
                    <input
                        type="email"
                        class="form-control"
                        id="client-email"
                        bind:value={mutable.email}
                        placeholder="john@appleseed.com"
                    />
                </div>
            </div>
        </div>
    </Card>
</div>
