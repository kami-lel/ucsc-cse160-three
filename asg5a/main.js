import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { MTLLoader } from 'three/addons/loaders/MTLLoader.js';






function main() {

    /* Canvas & Renderer */
    const canvas = document.querySelector( '#c' );
    const renderer = new THREE.WebGLRenderer( { antialias: true, canvas } );
    const scene = new THREE.Scene();






    /* Camera */
    const fov = 45;
    const aspect = 2; // the canvas default
    const near = 0.1;
    const far = 100;
    const camera = new THREE.PerspectiveCamera( fov, aspect, near, far );
    camera.position.set( 0, 20, 10 );






    /* Orbit Controls */
    const controls = new OrbitControls( camera, canvas );
    controls.target.set( 0, 5, 0 );
    controls.update();





    /* Light */
    // direction light
    //const d_color = 0xE0FFFF;
    const d_color = 0xFFFFFF;
    const d_intensity = 1;
    const direction_light = new THREE.DirectionalLight( d_color, d_intensity );
    direction_light.position.set(-5, 5, 0);
    scene.add(direction_light);

    // ambinent color
    const a_color = 0x001010;
    const a_intensity = 0.2;
    const ambient_light = new THREE.AmbientLight(a_color, a_intensity);
    scene.add(ambient_light);





    /* plane */
    const loader = new THREE.TextureLoader();
    {
        const planeSize = 40;

        const texture = loader.load('resources/images/grass.jpg');
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.magFilter = THREE.NearestFilter;
        const repeats = planeSize / 2;
        texture.repeat.set( repeats, repeats );

        const planeGeo = new THREE.PlaneGeometry( planeSize, planeSize );
        const planeMat = new THREE.MeshPhongMaterial( {
            map: texture,
            side: THREE.DoubleSide,
        } );
        const mesh = new THREE.Mesh( planeGeo, planeMat );
        mesh.rotation.x = Math.PI * - .5;
        scene.add( mesh );

    }




    /* sky box */
    const sky_texture = loader.load('resources/images/sky.png' ,
        () => {

            sky_texture.mapping = THREE.EquirectangularReflectionMapping;
            sky_texture.colorSpace = THREE.SRGBColorSpace;
            scene.background = sky_texture;

    } );






    /* make static instances */
    function make_instance(geometry, color, x, y, z) {
        const material = new THREE.MeshPhongMaterial( { color } );
        const cube = new THREE.Mesh(geometry, material)
        scene.add(cube);
        cube.position.x = x;
        cube.position.y = y;
        cube.position.z = z;
        return cube;
    }





    /* make the animated & textured cube */
    const rotate_cube_geometry = new THREE.BoxGeometry(2, 2, 2);
    // get its textures
    function loadColorTexture( path ) {
      const texture = loader.load( path );
      texture.colorSpace = THREE.SRGBColorSpace;
      return texture;
    }

    const rotate_cube_materials = [
        new THREE.MeshBasicMaterial({map: loadColorTexture('resources/images/flower-1.jpg')}),
        new THREE.MeshBasicMaterial({map: loadColorTexture('resources/images/flower-2.jpg')}),
        new THREE.MeshBasicMaterial({map: loadColorTexture('resources/images/flower-3.jpg')}),
        new THREE.MeshBasicMaterial({map: loadColorTexture('resources/images/flower-4.jpg')}),
        new THREE.MeshBasicMaterial({map: loadColorTexture('resources/images/flower-5.jpg')}),
        new THREE.MeshBasicMaterial({map: loadColorTexture('resources/images/flower-6.jpg')}),
    ];

    const rotate_cube = new THREE.Mesh(rotate_cube_geometry, rotate_cube_materials);
    scene.add(rotate_cube);
    rotate_cube.position.y = 5;





    /* sun & sun light */
    const sun_geometry = new THREE.SphereGeometry(3, 8, 8);
    const SUN_DIST = 35;
    const SUNLIGHT_DIST = 25;
    const DAY = 15;

    const sun = make_instance(sun_geometry, 0xFDB813, 0, -5, 0);
    scene.add(sun);

    // sun light
    const sun_color = 0xFDB813;
    const sun_intensity = 2000;
    const sun_light = new THREE.PointLight(sun_color, sun_intensity);
    scene.add(sun_light);




    /* Flower */
    function make_flower(x, z) {
        const bot_geo = new THREE.CylinderGeometry(0.3, 0.3, 4, 10);
        make_instance(bot_geo, 0x013220, x, 2, z);

        const leaf_geo = new THREE.BoxGeometry(0.1, 2, 2);
        const leaf = make_instance(leaf_geo, 0xAFBD22, x, 2, z);
        leaf.rotation.x = 45;

        const head_geo = new THREE.SphereGeometry(1, 8, 8);
        make_instance(head_geo, 0x5C4033, x, 4.5, z);

        const plane_geo = new THREE.ConeGeometry(3, 1.5, 10);
        const plane = make_instance(plane_geo, 0xFFFFCD, x, 4.2, z);
        return plane;
    }

    const flowers_plane = [];

    flowers_plane.push(make_flower(12, 10));
    flowers_plane.push(make_flower(8, 3));
    flowers_plane.push(make_flower(10, -5));

    flowers_plane.push(make_flower(8, 15));
    flowers_plane.push(make_flower(2, 12));
    flowers_plane.push(make_flower(-4, 8));
    flowers_plane.push(make_flower(-10, 18));


    function update_sun( time ) {
        let hour = (time % DAY) / DAY;  // 0.0~1.0i
        let angle = hour * 2 * Math.PI;

        let y_d = Math.sin(angle);
        let z_d = Math.cos(angle);

        sun.position.y = y_d * SUN_DIST;
        sun.position.z = z_d * SUN_DIST;
        sun_light.position.set(0, y_d*SUNLIGHT_DIST, z_d*SUNLIGHT_DIST);

        flowers_plane.forEach( (plane, idx) => {
            plane.rotation.x = Math.abs(-angle+Math.PI) + Math.PI / 2;
        });

    }



    /* mill */
    const objLoader = new OBJLoader();
    const mtlLoader = new MTLLoader();
    {
        mtlLoader.load( 'resources/models/farm1.mtl', ( mtl ) => {

            mtl.preload();
            const objLoader = new OBJLoader();
            objLoader.setMaterials( mtl );
            objLoader.load( 'resources/models/farm1.obj', ( root ) => {

                root.scale.set(0.01, 0.01, 0.01);
                root.position.set(10, 0, -18);
                scene.add( root );

            } );

        } );
    }

    {
        mtlLoader.load( 'resources/models/farm2.mtl', ( mtl ) => {

            mtl.preload();
            const objLoader = new OBJLoader();
            objLoader.setMaterials( mtl );
            objLoader.load( 'resources/models/farm2.obj', ( root ) => {

                root.scale.set(0.0006, 0.0006, 0.0006);
                root.position.set(-10, 0, -15);
                scene.add( root );

            } );

        } );
    }


    /* updating */
    function render( time ) {
        time *= 0.001;  // time in sec

        // animate central block
        rotate_cube.rotation.x = time;
        rotate_cube.rotation.y = time;
        update_sun(time);

        renderer.render( scene, camera );
        requestAnimationFrame( render );

    }

    requestAnimationFrame( render );
}






main();
