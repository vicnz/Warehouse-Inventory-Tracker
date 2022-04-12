<script>
    /**
     * TODO LIST
     * 1. Handle Login Form
     * 2. Handle Keep Logged In Setting (File Setting)
     */

    /**
     * BREAKING CHANGES (Proposed)
     * 1. Remove Authenticated Logins
     * 2. Change File to a Splashscreen
     */
    import { redirect } from "@roxi/routify";
    import { onMount } from "svelte";
    let showPassword = false; //show password
    let username = ""; //username
    let password = ""; //password
    let keepLogin = true; //keep logged in (refered to a file setting settings.json)

    function login() {
        $redirect("/app");
    }

    /**
     * DEMO: Immediately Redirect to Main Dashboard
     */
    onMount(() => {
        $redirect("/app/");
    });
</script>

<div class="card p-0 w-full w-sm-three-quarter w-lg-half">
    <!-- header -->
    <div class="alert alert-primary p-card border-0 rounded-0">
        <div class="d-flex align-items-center justify-content-between">
            <!-- app name -->
            <h3>{window.GLOBALS.APP_NAME}</h3>
            <!-- app logo -->
            <img src="/favicon.png" alt="page-logo" class="img page-logo" />
            <!-- app version -->
            <div class="d-flex align-items-center">
                <span class="ri ri-code-line" />
                &nbsp;
                <span>{window.GLOBALS.APP_VERSION}</span>
            </div>
        </div>

        <!-- app description -->
        <p>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Dolores
            reprehenderit incidunt ut iure blanditiis repellat error explicabo
            nostrum ducimus excepturi odio delectus laboriosam ea odit id
            recusandae veniam, laudantium praesentium.
        </p>
    </div>
    <!-- form -->
    <form class="p-card">
        <div class="form-group">
            <!-- username -->
            <label for="username">Username</label>
            <input
                type="text"
                id="username"
                class="form-control"
                on:change={(event) => (username = event.target.value)}
            />
            <br />
            <!-- password -->
            <label for="password">Password</label>
            <div class="input-group">
                <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    class="form-control"
                    on:change={(event) => (password = event.target.value)}
                />
                <div class="input-group-append">
                    <!-- toggle password visibility -->
                    <button
                        class="btn btn-square shadow-none"
                        on:click|preventDefault={() =>
                            (showPassword = !showPassword)}
                    >
                        {#if showPassword}
                            <span class="ri ri-eye-off-line" />
                        {:else}
                            <span class="ri ri-eye-line" />
                        {/if}
                    </button>
                </div>
            </div>
            <br />
            <!-- keep me logged in checkbox -->
            <div class="form-row row-eq-spacing">
                <div class="col">
                    <div class="custom-checkbox">
                        <input
                            type="checkbox"
                            name=""
                            id="keeplogin"
                            bind:checked={keepLogin}
                        />
                        <label for="keeplogin">Keep Me Logged In</label>
                    </div>
                </div>
                <div class="col">
                    <button
                        class="btn btn-primary btn-block"
                        on:click|preventDefault={login}>Login</button
                    >
                </div>
            </div>
        </div>
    </form>
</div>

<style>
    .page-logo {
        filter: drop-shadow(16px 16px 10px, black);
    }
</style>
