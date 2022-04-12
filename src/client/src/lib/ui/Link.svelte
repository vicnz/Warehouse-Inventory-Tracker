<script>
    import { isActive, url } from "@roxi/routify";
    export let path = "";
    export let params = {};
    export let options = {};
    export let className = "";
    export let isIndex = false;

    let active = false;
    $: {
        if (isIndex) {
            active = true;
        } else {
            active = $isActive(path, params, options);
        }
    }
</script>

<a
    href={$url(path, params, options)}
    class={`${className} ${active ? "active" : ""}`}
>
    <slot />
</a>
