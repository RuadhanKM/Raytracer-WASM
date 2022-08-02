mod classes;
use wasm_bindgen::prelude::*;
use classes::*;

#[wasm_bindgen]
pub fn render_line(data: js_sys::Uint8ClampedArray, js_scene: &JsValue, js_campos: &JsValue, js_camrot: &JsValue, sx: i32, sy: i32, y: i32) -> js_sys::Uint8ClampedArray {
    let scene: Vec<Tri> = js_scene.into_serde().unwrap();
    let campos: Vec3 = js_campos.into_serde().unwrap();
    let camrot: Vec3 = js_camrot.into_serde().unwrap();
    //let data = js_sys::Uint8ClampedArray::new_with_length(data_length.try_into().unwrap());
    
    let light_dir = Vec3::new(1.0,0.5,-1.0).norm();

    for x in 0..sx {
        let data_index = (4 * x) + (4 * (sy-y) * sx);
        
        let orig = Vec3::new(campos.x, campos.y, campos.z);
        let look_vector = Vec3::new(((x-sx/2) as f64/sx as f64).into(), ((y-sy/2) as f64/sx as f64).into(), 1.0).rotate(camrot);
        let mut val = Vec3::new(0.0, 0.0, 0.0);

        let mut closest_point = f64::MAX;
        let mut main_tri_op: Option<Tri> = None;
        let mut main_res_op: Option<Vec3> = None;

        for tri in scene.iter() {
            let main_res = tri.intersect(orig, look_vector);

            if main_res.is_none() {continue;}
            let res = main_res.unwrap();
            let rel_distance = (res - orig).mag();
            if rel_distance >= closest_point {continue;}

            closest_point = rel_distance;
            main_tri_op = Some(*tri);
            main_res_op = Some(res);
        }

        if !main_tri_op.is_none() {
            let main_tri = main_tri_op.unwrap();
            let main_res = main_res_op.unwrap();

            val = main_tri.color;

            let normal = main_tri.normal();

            let diffuse = normal.dot(light_dir);
            val = val.scale(diffuse);

            /*
            let mut bounce_point = main_res;
            let mut bounce_look = look_vector.reflect(normal);

            for bounce in 1..2 {
                closest_point = f64::MAX;
                let mut bounce_tri_op: Option<Tri> = None;
                let mut bounce_res_op: Option<Vec3> = None;

                for tri in scene.iter() {
                    let bounce_res = tri.intersect(bounce_point, bounce_look);

                    if bounce_res.is_none() {continue;}
                    let res = bounce_res.unwrap();
                    let rel_distance = (res - bounce_point).mag();
                    if (rel_distance >= closest_point) {continue;}

                    closest_point = rel_distance;
                    bounce_tri_op = Some(*tri);
                    bounce_res_op = Some(res);
                }

                if !bounce_tri_op.is_none() {
                    let bounce_tri = bounce_tri_op.unwrap();
                    let bounce_res = bounce_res_op.unwrap();

                    val = bounce_tri.color;

                    bounce_point = bounce_res;
                    bounce_look = bounce_look.reflect(bounce_tri.normal())
                }
            }
            */

            for tri in scene.iter() {
                let shadow_res_op = tri.intersect(main_res, light_dir);

                if !shadow_res_op.is_none() {val = val.scale(0.3); break;}
            }
        }

        data.set_index((data_index+0).try_into().unwrap(), val.x as u8);
        data.set_index((data_index+1).try_into().unwrap(), val.y as u8);
        data.set_index((data_index+2).try_into().unwrap(), val.z as u8);
        data.set_index((data_index+3).try_into().unwrap(), 255);
    }

    data
}