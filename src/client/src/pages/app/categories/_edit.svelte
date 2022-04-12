<script>
    import { slide } from "svelte/transition";
    import { createEventDispatcher } from "svelte";

    const dispatcher = createEventDispatcher();
    export let data = {
        id: "",
        label: "",
    };
    //change spaces to "-"
    $: {
        data = {
            ...data,
            id: data.id.replace(/\s/, "-"),
        };
    }
    //generate ID
    function generateID() {
        const gen = window.util.randomUUID();
        data = {
            ...data,
            id: gen,
        };
    }

    function onCancel() {
        dispatcher("canceled", {});
    }
    function onSave() {
        dispatcher("saved", {
            ...data,
        });
    }
</script>

<div class="card m-0" in:slide out:slide>
    <div class="d-flex flex-column flex-md-row justify-content-between">
        <!-- Category ID -->
        <div class="form-group w-full">
            <label for="">Unique ID</label>
            <div class="input-group">
                <input
                    type="text"
                    name=""
                    id=""
                    class="form-control"
                    bind:value={data.id}
                />
                <div class="input-group-append">
                    <button class="btn shadow-none" on:click={generateID}>
                        Generate ID
                    </button>
                </div>
            </div>
        </div>
        <div class="spacer p-5" />
        <!-- Category Label -->
        <div class="form-group w-full">
            <label for="">Label</label>
            <input
                type="text"
                name=""
                id=""
                class="form-control"
                bind:value={data.label}
            />
        </div>
    </div>
    <br />
    <div class="text-right">
        <div class="btn-group">
            <button class="btn" on:click={onSave}>Save</button>
            <button class="btn" on:click={onCancel}> Cancel </button>
        </div>
    </div>
</div>
