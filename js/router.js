async function lLiinnnLI(str) {
    const nmLLLmnIL = new TextEncoder();
    const lLlmmmmLL = nmLLLmnIL.encode(str);
    const lLiIlmmmi = await crypto.subtle.digest("SHA-256", lLlmmmmLL);
    const ILminlnii = Array.from(new Uint8Array(lLiIlmmmi));
    return ILminlnii.map(ILnIImiln => ILnIImiln.toString(16).padStart(2, "0")).join("");
}

async function LinimniLm() {
    const nmiLmLmil = "7d5a81efaff0a444b729e06ab3768a40ec82be5769c667b99810dfaeca84930a";

    if (sessionStorage.getItem("unlocked") === "true") {
        return true;
    }

    const nmmnnIiLn = document.getElementById("content");
    nmmnnIiLn.innerHTML = `
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

    return new Promise(mnnILmImn => {
        document.getElementById("pwInput").addEventListener("keydown", async (LIlImimll) => {
            if (LIlImimll.key === "Enter") {
                const mnnllLimi = LIlImimll.target.value;
                const nmlIlmnm = await lLiinnnLI(mnnllLimi);

                if (nmlIlmnm === nmiLmLmil) {
                    sessionStorage.setItem("unlocked", "true");
                    mnnILmImn(true);
                } else {
                    document.getElementById("pwError").style.display = "block";
                }
            }
        });
    });
}

async function LiimnliII() {
    const LInniInL = await LinimniLm();
    if (!LInniInL) return;

    const nmLIliliI = new URLSearchParams(window.location.search);
    const mmllLmiLL = nmLIliliI.get("class");
    const lLmnLnLln = nmLIliliI.get("noteset");

    if (!mmllLmiLL) {
        loadClasses();
        return;
    }

    if (!lLmnLnLln) {
        loadNotesets(mmllLmiLL);
        return;
    }

    loadNoteset(mmllLmiLL, lLmnLnLln);
}

window.onpopstate = LiimnliII;
