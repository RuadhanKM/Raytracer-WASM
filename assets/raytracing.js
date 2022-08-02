import wasm from '../wasm.js';

var c = document.getElementById("c")
var ctx = c.getContext("2d")

let y = 0

var sx
var sy

var imageData
var data

var campos = new vec3(0, 10, 0)
var camrot = new vec3(0.4, 0, 0)

let lightDir = new vec3(1, 0.5, -1).norm()

let main = () => {
    if (document.getElementById("rust").checked) {
        data = wasm.render_line(data, scene, campos, camrot, sx, sy, y)
    } else {
        for (let x=0;x<sx;x++) {
            let orig = new vec3(campos.x, campos.y, campos.z)
            let lookVector = new vec3((x-sx/2)/sx, (y-sy/2)/sx, 1).rotate(camrot)
            let val = new vec3(0,0,0)

            let fintri
            let closestPoint = Infinity

            for (const tri of scene) {
                let res = tri.intersect(orig, lookVector)

                if (!res) {continue}
                let relpointmag = res.sub(orig).mag()
                if (relpointmag >= closestPoint) {continue}
                
                closestPoint = relpointmag
                fintri = tri
            }

            if (fintri) {
                val = fintri.color

                let normal = fintri.getNormal()

                let diffuse = normal.dot(lightDir);
                val = val.muls(diffuse)
            }

            data[(4 * x) + (4 * (sy-y) * sx)]     = val.x
            data[(4 * x) + (4 * (sy-y) * sx) + 1] = val.y
            data[(4 * x) + (4 * (sy-y) * sx) + 2] = val.z
            data[(4 * x) + (4 * (sy-y) * sx) + 3] = 255
        }
    }

    ctx.putImageData(imageData, 0, 0)

    if (y === sy) {
        document.getElementById("render").disabled = false
        document.getElementById("inputfile").disabled = false
    } else {
        y++

        if (y % 10 === 0) {
            requestAnimationFrame(main)
        } else {
            main()
        }
    }
}

document.getElementById("render").onclick = () => {
    c.width = 800
    c.height = 800

    sx = c.width
    sy = c.height

    y = 0
    imageData = new ImageData(sx, sy)
    data = imageData.data

    document.getElementById("render").disabled = true
    document.getElementById("inputfile").disabled = true

    requestAnimationFrame(main)
}