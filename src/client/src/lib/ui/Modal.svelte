<script>
    import { createEventDispatcher } from "svelte";
    import Header from "../../lib/ui/tableheader.svelte";
    import { modalAction } from "../../lib/stores/modal";
    export let withaction = null;
    export let className = "";
    export let id = "";
    export let title = "Default Title";
    export let body =
        "Lorem ipsum dolor sit amet consectetur, adipisicing elit. A dolorum praesentium distinctio magnam ratione mollitia, nisi accusantium fugit possimus esse rem harum aspernatur voluptatibus aliquam repudiandae quam omnis magni. Rerum?";
    let actionSelected = null;
    const dispatcher = createEventDispatcher();

    $: {
        dispatcher("on-changed", {
            action: actionSelected,
        });
    }

    function closeModal(int = 1) {
        $modalAction = {
            action: int,
            isopen: false,
        };
    }
</script>

<div
    class={`modal ${className}`}
    {id}
    tabindex="-1"
    role="dialog"
    data-overlay-dismissal-disabled="true"
    data-esc-dismissal-disabled="true"
>
    <div class="modal-dialog" role="document">
        <div class="modal-content  p-0 shadow-lg">
            <Header {title}>
                <div class="" slot="controls">
                    <button
                        class="btn btn-square btn-danger"
                        data-dismiss="modal"
                        on:click={() => {
                            $modalAction = {
                                isopen: false,
                            };
                        }}
                    >
                        <span class="ri ri-close-line" />
                    </button>
                </div>
            </Header>
            <div class="p-card">
                {body}
            </div>
            {#if withaction}
                <div class="alert p-card rounded-0 border-0 text-right">
                    <button class="btn" on:click={() => (actionSelected = 0)}>
                        OK
                    </button>
                    <button class="btn" on:click={() => (actionSelected = 1)}>
                        Cancel
                    </button>
                </div>
            {:else}
                <div class="alert p-card rounded-0 border-0 text-right">
                    <button
                        class="btn"
                        data-dismiss="modal"
                        on:click={() =>
                            ($modalAction = {
                                ...$modalAction,
                                isopen: false,
                            })}>OK</button
                    >
                </div>
            {/if}
        </div>
    </div>
</div>

<style>
    .modal {
        background-color: rgba(0, 0, 0, 0.2);
    }
    .modal-dialog {
        backdrop-filter: blur(2px);
    }
</style>
