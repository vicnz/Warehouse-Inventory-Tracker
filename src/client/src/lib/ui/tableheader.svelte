<script>
    export let back = false;
    export let title = "";
    export let url = "";
</script>

<div class="alert alert-primary p-card border-0 rounded-0">
    <div
        class="d-flex justify-content-between align-items-center flex-column flex-md-row "
    >
        <!-- go back button -->
        {#if back}
            <svelte:component this={back} path={url} />
        {/if}
        <!-- section title -->
        <h4 class="text-capitalize">{title}</h4>
        <slot name="controls" />
    </div>
</div>
