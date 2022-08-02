use serde::{Serialize, Deserialize};
use std::ops::*;

#[derive(Serialize, Deserialize, Copy, Clone)]
pub struct Vec3 {
    pub x: f64,
    pub y: f64,
    pub z: f64
}

impl Vec3 {
    pub fn new(x: f64, y: f64, z: f64) -> Vec3 {
        Vec3 {x: x, y: y, z: z}
    }

    pub fn to_str(&self) -> String {
        format!("{}, {}, {}", self.x, self.y, self.z)
    }

    pub fn scale(&self, s: f64) -> Vec3 {
        Vec3::new(self.x * s, self.y * s, self.z * s)
    }

    pub fn mag(&self) -> f64 {
        (self.x*self.x + self.y*self.y + self.z*self.z).sqrt()
    }
    pub fn norm(&self) -> Vec3 {
        let m = 1.0/self.mag();
        self.scale(m)
    }

    pub fn dot(&self, o: Vec3) -> f64 {
        self.x*o.x + self.y*o.y + self.z*o.z
    }
    pub fn cross(&self, o: Vec3) -> Vec3 {
        Vec3::new(
            self.y * o.z - self.z * o.y,
            self.z * o.x - self.x * o.z,
            self.x * o.y - self.y * o.x
        )
    }

    pub fn rotate(&self, euler: Vec3) -> Vec3 {
        let mut pre_rotate = Vec3::new(self.x, self.y, self.z);
        let mut buffer = Vec3::new(pre_rotate.x, pre_rotate.y, pre_rotate.z);
        
        // Rotation about x axis
        buffer.x = pre_rotate.x;
        buffer.y = pre_rotate.y*euler.x.cos() - pre_rotate.z*euler.x.sin();
        buffer.z = pre_rotate.y*euler.x.sin() + pre_rotate.z*euler.x.cos();

        pre_rotate = Vec3::new(buffer.x, buffer.y, buffer.z);

        // Rotation about y axis
        buffer.x = pre_rotate.x*euler.y.cos() + pre_rotate.z*euler.y.sin();
        buffer.y = pre_rotate.y;
        buffer.z = -pre_rotate.x*euler.y.sin() + pre_rotate.z*euler.y.cos();

        pre_rotate = Vec3::new(buffer.x, buffer.y, buffer.z);

        // Rotation about z axis
        buffer.x = pre_rotate.x*euler.z.cos() - pre_rotate.y*euler.z.sin();
        buffer.y = pre_rotate.x*euler.z.sin() + pre_rotate.y*euler.z.cos();
        buffer.z = pre_rotate.z;

        buffer
    }

    pub fn reflect(&self, n: Vec3) -> Vec3 {
        *self - n.scale(2.0*(self.dot(n)))
    }
}
impl Add for Vec3 {type Output = Self;fn add(self, other: Self) -> Self {
        Self::new(self.x + other.x, self.y + other.y, self.z + other.z)
}}
impl Sub for Vec3 {type Output = Self;fn sub(self, other: Self) -> Self {
    Self::new(self.x - other.x, self.y - other.y, self.z - other.z)
}}
impl Mul for Vec3 {type Output = Self;fn mul(self, other: Self) -> Self {
    Self::new(self.x * other.x, self.y * other.y, self.z * other.z)
}}
impl Div for Vec3 {type Output = Self;fn div(self, other: Self) -> Self {
    Self::new(self.x / other.x, self.y / other.y, self.z / other.z)
}}

#[derive(Serialize, Deserialize, Copy, Clone)]
pub struct Tri {
    pub a: Vec3,
    pub b: Vec3,
    pub c: Vec3,
    pub color: Vec3,
    pub normalOveride: bool
}

impl Tri {
    pub fn intersect(&self, orig: Vec3, mut nc: Vec3) -> Option<Vec3> {
        let epsilon = 0.00001;

        let fc = nc.scale(5000.0) + orig;
        nc = nc + orig;
    
        let e0 = self.b - self.a;
        let e1 = self.c - self.a;
    
        let dir = fc - nc;
        let dir_norm = dir.norm();
    
        let h = dir_norm.cross(e1);
        let a = e0.dot(h);
        if a > -epsilon && a < epsilon {return None;}
        let s = nc - self.a;
        let f = 1.0 / a;
        let u = f * s.dot(h);
        if u < 0.0 || u > 1.0 {return None;}
        let q = s.cross(e0);
        let v = f * dir_norm.dot(q);
        if v < 0.0 || u + v > 1.0 {return None;}
        let tb = f * e1.dot(q);
    
        if !(tb > epsilon && tb < dir.dot(dir).sqrt()) {return None;}
    
        Some(nc + dir_norm.scale(tb))
    }

    pub fn normal(&self) -> Vec3 {
        let edge1;
        let edge2;

        if self.normalOveride {
            edge1 = self.b - self.a;
            edge2 = self.c - self.a;
        } else {
            edge1 = self.c - self.a;
            edge2 = self.b - self.a;
        }
        
        edge1.cross(edge2).norm()
    }
}