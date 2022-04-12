<script>
    import { slide } from "svelte/transition";
    export let type = "saving";
    export let message = "Default Message";
</script>

{#if type === "saving"}
    <div class="alert alert-success border-0 rounded-0" in:slide>
        {message}
    </div>
{:else if type === "deleting"}
    <div class="alert alert-danger border-0 rounded-0" in:slide>
        {message}
    </div>
{/if}
