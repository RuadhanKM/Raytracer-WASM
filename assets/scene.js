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

document.getElementById('inputfile').addEventListener('change', function() {
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

    var fr=new FileReader();
    fr.onload=function(){
        let obj = fr.result.split("\n")
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
        
    fr.readAsText(this.files[0]);
})