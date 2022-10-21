var scene = [
    new tri(
        new vec3(300,-1,300),
        new vec3(-300,-1,300),
        new vec3(300,-1,-300),
        new vec3(255,255,255),
    ),
    new tri(
        new vec3(-300,-1,-300),
        new vec3(-300,-1,300),
        new vec3(300,-1,-300),
        new vec3(255,255,255),
    )
]

function loadScene(data) {
    scene = [
        new tri(
            new vec3(300,-1,300),
            new vec3(-300,-1,300),
            new vec3(300,-1,-300),
            new vec3(255,255,255),
        ),
        new tri(
            new vec3(-300,-1,-300),
            new vec3(-300,-1,300),
            new vec3(300,-1,-300),
            new vec3(255,255,255),
        )
    ]
    
    let obj = data.split("\n")
    let verts = []

    for (const line of obj) {
        if (line[0] === "v") {
            let vert = line.slice(1, -1).trim().split(" ")
            verts.push(new vec3(Number(vert[0]), Number(vert[1]), Number(vert[2]) + 20))
        }
        if (line[0] === "f") {
            let face = line.slice(1, -1).trim().split(" ")
            let newTri = new tri(verts[Number(face[0])-1], verts[Number(face[1])-1], verts[Number(face[2])-1], new vec3(0,0,0), true)

            newTri.color = new vec3(0, 255, 0)

            scene.push(newTri)
        }
    }
}

document.getElementById('inputfile').addEventListener('change', e => {
    var fr = new FileReader();
    fr.onload = () => {
        loadScene(fr.result)
    }

    fr.readAsText(e.files[0])
})

document.getElementById('filedropdown').addEventListener('change', e => {
    if (e.target.value) {
        loadScene(dropdownFiles[e.target.value])
    }
})

var dropdownFiles = {}

fetch("assets/objects.JSON").then(e => { return e.json() }).then(data => {
    for (const fileName of Object.keys(data)) {
        fetch(data[fileName]).then(e => {
            e.text().then(raw => {
                dropdownFiles[fileName] = raw
                let option = document.createElement("option")
                option.value = fileName
                option.innerHTML = fileName

                document.getElementById('filedropdown').appendChild(option)
            })
        })
    }
})