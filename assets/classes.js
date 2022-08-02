const EPSILON = 0.001

class vec3 {
    constructor(x,y,z) {
        this.x = x
        this.y = y
        this.z = z
    }

    mag() {
        return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z)
    }
    norm() {
        let m = this.mag()
        return new vec3(this.x/m, this.y/m, this.z/m)
    }

    dot(o) {
        return this.x*o.x + this.y*o.y + this.z*o.z
    }
    cross(o) {
        return new vec3(
            this.y * o.z - this.z * o.y,
            this.z * o.x - this.x * o.z,
            this.x * o.y - this.y * o.x
        )
    }

    sub(o) {
        return new vec3(this.x - o.x, this.y - o.y, this.z - o.z)
    }
    add(o) {
        return new vec3(this.x + o.x, this.y + o.y, this.z + o.z)
    }
    mul(o) {
        return new vec3(this.x * o.x, this.y * o.y, this.z * o.z)
    }
    muls(s) {
        return new vec3(this.x * s, this.y * s, this.z * s)
    }

    rotate(euler) {
        let preRotate = new vec3(this.x, this.y, this.z)
        let buffer = new vec3(preRotate.x, preRotate.y, preRotate.z)
        
        // Rotation about x axis
        buffer.x = preRotate.x
        buffer.y = preRotate.y*Math.cos(euler.x) - preRotate.z*Math.sin(euler.x)
        buffer.z = preRotate.y*Math.sin(euler.x) + preRotate.z*Math.cos(euler.x)

        preRotate = new vec3(buffer.x, buffer.y, buffer.z)

        // Rotation about y axis
        buffer.x = preRotate.x*Math.cos(euler.y) + preRotate.z*Math.sin(euler.y)
        buffer.y = preRotate.y
        buffer.z = -preRotate.x*Math.sin(euler.y) + preRotate.z*Math.cos(euler.y)

        preRotate = new vec3(buffer.x, buffer.y, buffer.z)

        // Rotation about z axis
        buffer.x = preRotate.x*Math.cos(euler.z) - preRotate.y*Math.sin(euler.z)
        buffer.y = preRotate.x*Math.sin(euler.z) + preRotate.y*Math.cos(euler.z)
        buffer.z = preRotate.z

        return buffer
    }
}

class tri {
    constructor(a,b,c,color,normalOveride=false) {
        this.a = a
        this.b = b
        this.c = c
        this.color = color
        this.normalOveride = normalOveride
    }

    getNormal() {
        let edge1
        let edge2

        if (this.normalOveride) {
            edge1 = this.b.sub(this.a);
            edge2 = this.c.sub(this.a);
        } else {
            edge1 = this.c.sub(this.a);
            edge2 = this.b.sub(this.a);
        }
        
        return edge1.cross(edge2).norm();
    }

    intersect(orig, nc) {
        let fc = nc.muls(5000).add(orig)
        nc = nc.add(orig)
    
        let e0 = this.b.sub(this.a)
        let e1 = this.c.sub(this.a)
    
        let dir = fc.sub(nc)
        let dir_norm = dir.norm()
    
        let h = dir_norm.cross(e1)
        const a = e0.dot(h)
        if (a > -EPSILON && a < EPSILON) {return false}
        let s = nc.sub(this.a)
        const f = 1 / a
        const u = f * s.dot(h)
        if (u < 0 || u > 1) {return false}
        let q = s.cross(e0)
        let v = f * dir_norm.dot(q)
        if (v < 0 || u + v > 1) {return false}
        const tb = f * e1.dot(q)
    
        if (!(tb > EPSILON && tb < Math.sqrt(dir.dot(dir)))) {return false}
    
        return nc.add(dir_norm).muls(tb)
    }    
}