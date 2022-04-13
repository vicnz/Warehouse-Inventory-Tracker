<script>
    export let path = "../.";
    import { goto } from "@roxi/routify";
</script>

<button
    class="btn btn-square shadow-none border-0"
    on:click|preventDefault={() => $goto(path)}
>
    <span class="ri ri-arrow-go-back-line" />
</button>
