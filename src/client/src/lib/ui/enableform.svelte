<script>
    import { createEventDispatcher } from "svelte";
    export let color = "primary";
    const dispatcher = createEventDispatcher();
    function toggleSwitch() {
        dispatcher("on-toggle", {});
    }
</script>

<div class={"alert p-card rounded-0 border-0 " + `alert-${color}`}>
    <div class="custom-switch">
        <input type="checkbox" id="toggle-form" on:change={toggleSwitch} />
        <label for="toggle-form"
            >Enable Form. Leaving the page while this is turned off will discard
            any unsaved changes...</label
        >
    </div>
</div>
