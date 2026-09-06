import { modelRoutes } from './config.js';

let scene, camera, renderer, mixer, clock, currentModel, controls;
let animationsMap = {};
let currentAction = null;

function init3DScene(canvasWrapper) {
    clock = new THREE.Clock();
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x070e0a); // Nền tối hợp giao diện Emerald

    const width = canvasWrapper.clientWidth || 600;
    const height = 400;

    camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 15, 35);

    // Thêm ánh sáng
    const ambientLight = new THREE.AmbientLight(0xffffff, 2);
    scene.add(ambientLight);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    
    canvasWrapper.innerHTML = '';
    canvasWrapper.appendChild(renderer.domElement);

    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    function animate() {
        requestAnimationFrame(animate);
        const delta = clock.getDelta();
        if (mixer) mixer.update(delta);
        controls.update();
        renderer.render(scene, camera);
    }
    animate();
}

export function load3DModel(animalKey) {
    const canvasWrapper = document.getElementById('canvas3d-wrapper');
    if (!canvasWrapper) return;

    init3DScene(canvasWrapper);

    // CHẤT LIỆU WIREFRAME (Khung lưới dây 3D màu xanh lá cây Emerald)
    const wireframeMaterial = new THREE.MeshBasicMaterial({ 
        color: 0x00f090,     // Màu xanh lá sáng
        wireframe: true,     // Bật chế độ khung dây lưới 3D giống hình ví dụ
        wireframeLinewidth: 1
    });

    const loader = new THREE.GLTFLoader();
    const demoUrl = modelRoutes[animalKey] || modelRoutes['lion'];

    loader.load(
        demoUrl,
        (gltf) => {
            currentModel = gltf.scene;

            // Áp dụng khung lưới wireframe cho toàn bộ model
            currentModel.traverse((node) => {
                if (node.isMesh) {
                    node.material = wireframeMaterial;
                }
            });

            // Tự động căn chỉnh kích thước & góc nhìn
            const box = new THREE.Box3().setFromObject(currentModel);
            const size = box.getSize(new THREE.Vector3());
            const scale = 20 / Math.max(size.x, size.y, size.z);
            currentModel.scale.set(scale, scale, scale);

            const center = box.getCenter(new THREE.Vector3());
            currentModel.position.sub(center.multiplyScalar(scale));
            currentModel.position.y = 0;

            scene.add(currentModel);

            // Cấu hình Animation Ăn / Nghỉ / Đi lại
            const actionBtns = document.querySelectorAll('.btn-action');
            mixer = new THREE.AnimationMixer(currentModel);
            animationsMap = {};

            gltf.animations.forEach((clip) => {
                const action = mixer.clipAction(clip);
                const name = clip.name.toLowerCase();
                
                if (name.includes('walk') || name.includes('run')) animationsMap['walk'] = action;
                else if (name.includes('eat') || name.includes('attack')) animationsMap['eat'] = action;
                else if (name.includes('idle') || name.includes('rest')) animationsMap['rest'] = action;
                else if (!animationsMap['walk']) animationsMap['walk'] = action;
            });

            actionBtns.forEach(btn => {
                btn.onclick = () => {
                    const act = btn.getAttribute('data-action');
                    if (animationsMap[act]) {
                        if (currentAction) currentAction.fadeOut(0.3);
                        animationsMap[act].reset().fadeIn(0.3).play();
                        currentAction = animationsMap[act];
                    }
                };
            });

            if (animationsMap['walk']) {
                animationsMap['walk'].play();
                currentAction = animationsMap['walk'];
            }
        },
        undefined,
        (err) => console.log('Lỗi tải 3D:', err)
    );
}