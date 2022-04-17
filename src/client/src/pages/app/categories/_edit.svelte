<script>
    import { slide } from "svelte/transition";
    import { createEventDispatcher } from "svelte";

    const dispatcher = createEventDispatcher();
    export let data = {
        id: "",
        label: "",
    };
    let add = data.id === "" && data.label === "";
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
                if (add) {
                    const itemExists = await window.category.itemExists(
                        formProps.id
                    );
                    if (itemExists) {
                        throw new Error();
                    }
                }

                dispatcher("saved", {
                    id: formProps.id.trim(),
                    label: formProps.label.trim(),
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
            <label for="id" class={add ? "required" : ""}>Unique ID</label>
            <div class="input-group">
                <input
                    required
                    minlength="5"
                    readonly={!add}
                    type="text"
                    name="id"
                    id="id"
                    class="form-control"
                    bind:value={data.id}
                />
                <div class="input-group-append">
                    <button
                        disabled={!add}
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
            <label for="label" class={add ? "required" : ""}>Label</label>
            <input
                required
                minlength="3"
                type="text"
                name="label"
                id="label"
                class="form-control"
                bind:value={data.label}
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
