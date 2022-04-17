<script>
    import { slide } from "svelte/transition";
    import { createEventDispatcher } from "svelte";

    const dispatcher = createEventDispatcher();
    export let data = {
        id: "",
        label: "",
        location: "",
    };
    let readonly = data.id === "" && data.label === "" && data.location === "";
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

    //FORM
    async function useForm(node, parameters) {
        node.addEventListener("submit", async (event) => {
            event.preventDefault();
            const formData = new FormData(event.target);
            const formProps = Object.fromEntries(formData);
            try {
                console.log(formProps);
                if (readonly) {
                    const itemExists = await window.warehouse.itemExists(
                        formProps.id
                    );
                    if (itemExists) {
                        throw new Error();
                    }
                }

                dispatcher("saved", {
                    id: formProps.id.trim(),
                    label: formProps.label.trim(),
                    location: formProps.location.trim(),
                });
            } catch (err) {
                window.dialogs.error({
                    title: "Duplicate Item",
                    message: `ID Error, [${formProps.id}] already exist.`,
                });
            }
        });
    }
</script>

<form class="card m-0" in:slide out:slide action="/" method="POST" use:useForm>
    <div class="d-flex flex-column flex-md-row justify-content-between">
        <!-- Category ID -->
        <input type="hidden" name="id" value={data.id} />
        <div class="form-group w-full">
            <label for="" class={readonly ? "required" : ""}>Unique ID</label>
            <div class="input-group">
                <input
                    name="id"
                    disabled={!readonly}
                    required
                    minlength="3"
                    type="text"
                    id="id-"
                    class="form-control"
                    bind:value={data.id}
                />
                <div class="input-group-append">
                    <button
                        disabled={!readonly}
                        class="btn shadow-none"
                        on:click|preventDefault={generateID}
                    >
                        Generate ID
                    </button>
                </div>
            </div>
        </div>
        <div class="spacer p-5" />
        <!-- Category Label -->
        <div class="form-group w-full">
            <label for="label" class={readonly ? "required" : ""}>Label</label>
            <input
                required
                minlength="3"
                type="text"
                id="label"
                name="label"
                class="form-control"
                bind:value={data.label}
            />
        </div>
        <div class="spacer p-5" />
        <!-- location  -->
        <div class="form-group w-full">
            <label for="location" class={readonly ? "required" : ""}
                >Location</label
            >
            <input
                required
                minlength="5"
                type="text"
                id="location"
                name="location"
                class="form-control"
                bind:value={data.location}
            />
        </div>
    </div>
    <br />
    <div class="text-right">
        <div class="btn-group">
            <input type="submit" class="btn" value="Save" />
            <button class="btn" on:click|preventDefault={onCancel}>
                Cancel
            </button>
        </div>
    </div>
</form>
