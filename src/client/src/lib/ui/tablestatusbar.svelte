<script>
    export let checked = [];
    export let columns = [];
    export let data = [];
    import { createEventDispatcher } from "svelte";
    const dispatcher = createEventDispatcher();
</script>

<div class="alert alert-primary p-card border-0 rounded-0">
    <div
        class="d-flex justify-content-between align-items-center flex-column flex-sm-row"
    >
        <!-- status bar -->
        <div class="button-group">
            <button class="btn" readonly>
                Selected : {checked.length}
            </button>
            <button class="btn" readonly>
                Columns : {columns.length}
            </button>
            <button class="btn" readonly>
                Items : {data?.values?.length}
            </button>
        </div>

        <!-- refresh button -->
        <button
            class="btn btn-primary"
            on:click={() => dispatcher("refresh", {})}
        >
            Refresh
        </button>
    </div>
</div>
