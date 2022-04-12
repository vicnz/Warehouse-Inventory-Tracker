<script>
    /**
     * TODO ITEMS:
     * 1. Sanitize Data Before Save
     * 2. Handle Unsaved Data Before Leaving Page (beforeUrlChange)
     * 3. Handle Null Values (From Database)
     */

    import { params, beforeUrlChange, goto } from "@roxi/routify";
    $: slug = $params.slug; //slug params
    $beforeUrlChange((event, route) => {
        if (disabled) {
            return true;
        } else {
            return false;
        }
    });

    import { fade } from "svelte/transition";
    import { onMount } from "svelte";
    import Header from "../../../../lib/ui/tableheader.svelte";
    import Card from "../../../../lib/ui/card.svelte";
    import Back from "../../../../lib/ui/BackButton.svelte";
    import EnableForm from "../../../../lib/ui/enableform.svelte";
    import Que from "../../../../lib/ui/animation/ques.svelte";
    let ques = {
        save: false,
        delete: false,
    };
    $: original = {};
    $: mutable = {};
    $: disabled = true;

    onMount(() => {
        async function preload() {
            const data = await window.clients.getOneCustomer(slug);
            return data;
        }
        preload().then((response) => {
            original = { ...response?.data[0] };
            mutable = { ...response?.data[0] };
        });
    });

    //on undo changes
    async function onUndo() {
        const prompt = await window.dialogs.message({
            title: "Undo",
            message: "Undo unsaved changes?",
            buttons: ["Cancel", "Ok"],
        });
        if (prompt.response === 1) {
            mutable = original;
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
            detail: `This will delete this item permanently`,
            buttons: ["Cancel", "Ok"],
        });
        if (prompt.response === 1) {
            ques.delete = true;
            setTimeout(() => {
                disabled = true;
                window.clients.deleteOneCustomer({ id: mutable.id });
                $goto("../customers");
            }, 1000);
        } else {
            return;
        }
    }

    //on item saved
    function onSave() {
        //TODO: sanitize data
        ques.save = true;
        setTimeout(() => {
            disabled = true;
            window.clients.updateOneCustomer({ rows: mutable });
            $goto("../customers");
        }, 1000);
    }
</script>

<div class="content" in:fade>
    <Card>
        <Header
            slot="header"
            title="Edit Customer Info"
            back={Back}
            url="/app/clients/customers"
        >
            <!-- Data Handlers -->
            <div class="btn-group" slot="controls">
                <button class="btn" on:click={onSave} {disabled}> Save </button>
                <button class="btn" on:click={onUndo} {disabled}> Undo </button>
                <button class="btn" on:click={onDelete} {disabled}>
                    Delete
                </button>
            </div>
        </Header>
        <!-- enable form -->
        <EnableForm on:on-toggle={() => (disabled = !disabled)} />
        {#if ques.save}
            <Que message="Saving Item" type="saving" />
        {/if}
        {#if ques.delete}
            <Que message="Deleting Item" type="deleting" />
        {/if}
        <!-- form body -->
        <div class="p-card">
            <fieldset>
                <legend>
                    Client ID: <span class="text-primary">{mutable.id}</span>
                </legend>
            </fieldset>
            <hr />
            <div class="form-row row-eq-sm-spacing">
                <div class="col-sm">
                    <!-- Client Name -->
                    <label for="client-name">Name</label>
                    <input
                        type="text"
                        id="client-name"
                        class="form-control"
                        bind:value={mutable.name}
                        {disabled}
                    />
                    <!-- Client Company Info -->
                    <label for="client-comp">Company</label>
                    <input
                        type="text"
                        id="client-comp"
                        class="form-control"
                        bind:value={mutable.company}
                        {disabled}
                    />
                    <!-- Company Address -->
                    <label for="client-add">Address</label>
                    <textarea
                        id="client-add"
                        class="form-control"
                        bind:value={mutable.address}
                        {disabled}
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
                            type="text"
                            id="client-contact"
                            class="form-control"
                            bind:value={mutable.contact}
                            {disabled}
                        />
                    </div>
                    <!-- client email -->
                    <label for="client-email">Email</label>
                    <input
                        type="email"
                        id="client-email"
                        class="form-control"
                        bind:value={mutable.email}
                        {disabled}
                    />
                </div>
            </div>
        </div>
    </Card>
</div>
