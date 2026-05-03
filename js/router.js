async function sha256(str) {
    const encoder = new TextEncoder();
    const data = encoder.encode(str);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

async function showPasswordGuard() {
    const storedHash = "7d5a81efaff0a444b729e06ab3768a40ec82be5769c667b99810dfaeca84930a";

    if (sessionStorage.getItem("unlocked") === "true") {
        return true;
    }

    const content = document.getElementById("content");
    content.innerHTML = `
    <div id="pwWrapper" style="
        height: 100vh;
        display: flex;
        justify-content: center;
        align-items: center;
    ">
        <div style="width: 400px; text-align: center;">
            <input id="pwInput" type="text" placeholder="what is my phone number"
                style="width: 100%; margin-bottom: 10px;">
            <p id="pwError" style="color: red; display: none;">Incorrect password</p>
        </div>
    </div>
    `;

    return new Promise(resolve => {
        document.getElementById("pwInput").addEventListener("keydown", async (e) => {
            if (e.key === "Enter") {
                const input = e.target.value;
                const hash = await sha256(input);

                if (hash === storedHash) {
                    sessionStorage.setItem("unlocked", "true");
                    resolve(true);
                } else {
                    document.getElementById("pwError").style.display = "block";
                }
            }
        });
    });
}

async function routeFromURL() {
    // const unlocked = await showPasswordGuard();
    // if (!unlocked) return;

    const params = new URLSearchParams(window.location.search);
    const className = params.get("class");
    const noteset = params.get("noteset");

    if (!className) {
        loadClasses();
        return;
    }

    if (!noteset) {
        loadNotesets(className);
        return;
    }

    loadNoteset(className, noteset);
}

window.onpopstate = routeFromURL;