import './style.css';
import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import * as dat from 'lil-gui';

/**
 * Base
 */
// Debug
const gui = new dat.GUI();
// Canvas
const canvas = document.querySelector('canvas.webgl');

// Scene
const scene = new THREE.Scene();

// 增加 雾 效果
// 颜色 最近距离 最远距离
// 距离大于活动摄像机“far”个单位的物体将不会被雾所影响
const fog = new THREE.Fog('#262837', 1, 15);
scene.fog = fog;
/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader();
const gouTexture = textureLoader.load('/textures/head.jpg');
const doorColorTexture = textureLoader.load('/textures/door/color.jpg');
const doorAlphaTexture = textureLoader.load('/textures/door/alpha.jpg');
const doorAmbientOcclusionTexture = textureLoader.load('/textures/door/ambientOcclusion.jpg');
const doorHeightTexture = textureLoader.load('/textures/door/height.jpg');
const doorNormalTexture = textureLoader.load('/textures/door/normal.jpg');
const doorMetalnessTexture = textureLoader.load('/textures/door/metalness.jpg');
const doorRoughnessTexture = textureLoader.load('/textures/door/roughness.jpg');

const bricksColorTexture = textureLoader.load('/textures/bricks/color.jpg');
const bricksAmbientOcclusionTexture = textureLoader.load('/textures/bricks/ambientOcclusion.jpg');
const bricksNormalTexture = textureLoader.load('/textures/bricks/normal.jpg');
const bricksRoughnessTexture = textureLoader.load('/textures/bricks/roughness.jpg');

const grassColorTexture = textureLoader.load('/textures/grass/color.jpg');
const grassAmbientOcclusionTexture = textureLoader.load('/textures/grass/ambientOcclusion.jpg');
const grassNormalTexture = textureLoader.load('/textures/grass/normal.jpg');
const grassRoughnessTexture = textureLoader.load('/textures/grass/roughness.jpg');
grassColorTexture.repeat.set(8, 8);
grassColorTexture.wrapS = THREE.RepeatWrapping;
grassColorTexture.wrapT = THREE.RepeatWrapping;
grassAmbientOcclusionTexture.repeat.set(8, 8);
grassAmbientOcclusionTexture.wrapS = THREE.RepeatWrapping;
grassAmbientOcclusionTexture.wrapT = THREE.RepeatWrapping;
grassNormalTexture.repeat.set(8, 8);
grassNormalTexture.wrapS = THREE.RepeatWrapping;
grassNormalTexture.wrapT = THREE.RepeatWrapping;
grassRoughnessTexture.repeat.set(8, 8);
grassRoughnessTexture.wrapS = THREE.RepeatWrapping;
grassRoughnessTexture.wrapT = THREE.RepeatWrapping;

/**
 * House
 */
const house = new THREE.Group();
scene.add(house);
// walls
const walls = new THREE.Mesh(
  // x y z 上的深度
  new THREE.BoxGeometry(4, 2.5, 4),
  new THREE.MeshStandardMaterial({
    map: bricksColorTexture,
    aoMap: bricksAmbientOcclusionTexture,
    normalMap: bricksNormalTexture,
    roughness: bricksRoughnessTexture
  })
);
walls.geometry.setAttribute(
  'uv2',
  new THREE.Float32BufferAttribute(walls.geometry.attributes.uv.array, 2)
);
walls.position.y = 1.25;
house.add(walls);
// roof 屋顶
const roof = new THREE.Mesh(
  // 半径 高度 份数（份数越多越园）  金字塔 ==> 圆锥
  new THREE.ConeBufferGeometry(3.5, 1, 4),
  new THREE.MeshStandardMaterial({color: '#b35f45'})
);
roof.position.y = 2.5 + 0.5;
roof.rotation.y = Math.PI / 4;
house.add(roof);
// door
const door = new THREE.Mesh(
  // 宽 高 宽度份数 高度份数
  new THREE.PlaneBufferGeometry(2.2, 2.2, 100, 100),
  new THREE.MeshStandardMaterial({
    map: doorColorTexture,
    transparent: true,
    // 用于隐藏掉多余不需要的纹理
    alphaMap: doorAlphaTexture, // 白色显示，黑色隐藏
    // 设置ao必须为geometry指定uv2的坐标
    aoMap: doorAmbientOcclusionTexture, // 设置门框的纹理，阴影等
    // aoMapIntensity: 10, // 阴影强度
    displacementMap: doorHeightTexture, // 设置层次感，必须要设置gmometry的宽高份数
    displacementScale: 0.1, // 层次感强度
    normalMap: doorNormalTexture, // 添加部分细节
    metalnessMap: doorMetalnessTexture, // 金属纹理
    roughnessMap: doorRoughnessTexture // 粗糙程度
  })
);
door.geometry.setAttribute(
  'uv2',
  new THREE.Float32BufferAttribute(door.geometry.attributes.uv.array, 2)
);
door.position.z = 2 + 0.01;
door.position.y = 1;
house.add(door);
// 灌木丛
const bushGeometry = new THREE.SphereBufferGeometry(1, 16, 16);
const bushMaterial = new THREE.MeshStandardMaterial({color: '#89c854'});
const bush1 = new THREE.Mesh(bushGeometry, bushMaterial);
bush1.scale.set(0.5, 0.5, 0.5);
bush1.position.set(0.8, 0.2, 2.2);
const bush2 = new THREE.Mesh(bushGeometry, bushMaterial);
bush2.scale.set(0.25, 0.25, 0.25);
bush2.position.set(1.4, 0.1, 2.1);
const bush3 = new THREE.Mesh(bushGeometry, bushMaterial);
bush3.scale.set(0.4, 0.4, 0.4);
bush3.position.set(-0.8, 0.1, 2.2);
const bush4 = new THREE.Mesh(bushGeometry, bushMaterial);
bush4.scale.set(0.15, 0.15, 0.15);
bush4.position.set(-1, 0.05, 2.6);
house.add(bush1, bush2, bush3, bush4);

// 坟墓
const graves = new THREE.Group();
scene.add(graves);
const graveGeometry = new THREE.BoxGeometry(0.6, 0.8, 0.2);
const graveMaterial = new THREE.MeshStandardMaterial({color: '#b2b6b1'});
for (let i = 0; i < 50; i++) {
  const angle = Math.random() * Math.PI * 2;
  const radius = 3 + Math.random() * 6; // 半径需要超过房子宽度的一半
  const x = Math.sin(angle) * radius;
  const z = Math.cos(angle) * radius;
  const grave = new THREE.Mesh(graveGeometry, graveMaterial);
  grave.castShadow = true;
  grave.position.set(x, 0.3, z);
  grave.rotation.y = (Math.random() - 0.5) * 0.4;
  grave.rotation.z = (Math.random() - 0.5) * 0.4;
  graves.add(grave);
}

// Floor
const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(20, 20),
  new THREE.MeshStandardMaterial({
    map: grassColorTexture,
    aoMap: grassAmbientOcclusionTexture,
    normalMap: grassNormalTexture,
    roughness: grassRoughnessTexture
  })
);
floor.geometry.setAttribute(
  'uv2',
  new THREE.Float32BufferAttribute(floor.geometry.attributes.uv.array, 2)
);
floor.rotation.x = -Math.PI * 0.5;
floor.position.y = 0;
scene.add(floor);

// goodgame
const agou = new THREE.Group();
agou.castShadow = true;
agou.position.z = 4;
agou.position.y = 1;
scene.add(agou);
const basicGeo = new THREE.SphereBufferGeometry(1, 16, 16);
const basicMat = new THREE.MeshBasicMaterial({color: 'pink', map: gouTexture});
const gouHead = new THREE.Mesh(basicGeo, basicMat);
gouHead.scale.set(0.2, 0.2, 0.2);
gouHead.position.y = -0.01;
const gouBody = new THREE.Mesh(
  new THREE.CylinderGeometry(0.3, 0.3, 0.5),
  new THREE.MeshBasicMaterial({color: 0xffff00})
);
gouBody.position.y = -0.5;
const gouleft = new THREE.Mesh(
  new THREE.ConeGeometry(0.1, 0.4),
  new THREE.MeshBasicMaterial({color: 'red'})
);
gouleft.rotation.x = Math.PI / 2;
gouleft.position.y = -0.4;
gouleft.position.z = 0.4;
const gouright = new THREE.Mesh(
  new THREE.ConeGeometry(0.1, 0.4),
  new THREE.MeshBasicMaterial({color: 'red'})
);
gouright.rotation.x = -Math.PI / 2;
gouright.position.y = -0.4;
gouright.position.z = -0.4;

const gouBottomLeft = new THREE.Mesh(
  new THREE.BoxGeometry(0.1, 0.4, 0.1),
  new THREE.MeshBasicMaterial({color: 'blue'})
);
gouBottomLeft.position.y = -0.9;
gouBottomLeft.position.z = 0.1;
const gouBottomRight = new THREE.Mesh(
  new THREE.BoxGeometry(0.1, 0.4, 0.1),
  new THREE.MeshBasicMaterial({color: 'blue'})
);
gouBottomRight.position.y = -0.9;
gouBottomRight.position.z = -0.1;
// gouBottomLeft.rotation.z = .7;
agou.add(gouHead, gouBody, gouleft, gouright, gouBottomLeft, gouBottomRight);
/**
 * Lights
 */
// Ambient light
const ambientLight = new THREE.AmbientLight('#b9d5ff', 0.12);
gui.add(ambientLight, 'intensity').min(0).max(1).step(0.001);
scene.add(ambientLight);

// Directional light
const moonLight = new THREE.DirectionalLight('#b9d5ff', 0.12);
moonLight.position.set(4, 5, -2);
gui.add(moonLight, 'intensity').min(0).max(1).step(0.001);
gui.add(moonLight.position, 'x').min(-5).max(5).step(0.001);
gui.add(moonLight.position, 'y').min(-5).max(5).step(0.001);
gui.add(moonLight.position, 'z').min(-5).max(5).step(0.001);
scene.add(moonLight);
// door light
const doorLight = new THREE.PointLight('#ff7d46', 1, 7);
doorLight.position.set(0, 2.2, 2.7);
scene.add(doorLight);

const doorLightHelper = new THREE.CameraHelper(doorLight.shadow.camera);
doorLightHelper.visible = false;
scene.add(doorLightHelper);
// 幽灵效果
const ghost1 = new THREE.PointLight('#ff00ff', 3, 3);
scene.add(ghost1);
const ghost2 = new THREE.PointLight('#00ffff', 3, 3);
scene.add(ghost2);
const ghost3 = new THREE.PointLight('#ff7800', 3, 3);
scene.add(ghost3);
/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight
};

window.addEventListener('resize', () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100);
camera.position.x = 4;
camera.position.y = 2;
camera.position.z = 5;
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setClearColor('#262837'); // 将整个页面背景设置为雾同色
// 添加阴影效果
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap; // 该类型阴影更好
moonLight.castShadow = true;
doorLight.castShadow = true;
ghost1.castShadow = true;
ghost2.castShadow = true;
ghost3.castShadow = true;
walls.castShadow = true;
bush1.castShadow = true;
bush2.castShadow = true;
bush3.castShadow = true;
floor.receiveShadow = true;

doorLight.shadow.mapSize.width = 256;
doorLight.shadow.mapSize.height = 256;
doorLight.shadow.camera.far = 7;

ghost1.shadow.mapSize.width = 256;
ghost1.shadow.mapSize.height = 256;
ghost1.shadow.camera.far = 7;
ghost2.shadow.mapSize.width = 256;
ghost2.shadow.mapSize.height = 256;
ghost2.shadow.camera.far = 7;
ghost3.shadow.mapSize.width = 256;
ghost3.shadow.mapSize.height = 256;
ghost3.shadow.camera.far = 7;
/**
 * Animate
 */
const clock = new THREE.Clock();

let isgo = true;
let timer = null;
const tick = () => {
  const elapsedTime = clock.getElapsedTime();

  // 更新幽灵位置
  const ghost1Angle = elapsedTime * 0.5;
  ghost1.position.x = Math.cos(ghost1Angle) * 4;
  ghost1.position.z = Math.sin(ghost1Angle) * 4;
  ghost1.position.y = Math.sin(elapsedTime * 3);
  const ghost2Angle = -elapsedTime * 0.32;
  ghost2.position.x = Math.cos(ghost2Angle) * 5;
  ghost2.position.z = Math.sin(ghost2Angle) * 5;
  ghost2.position.y = Math.sin(elapsedTime * 4) + Math.sin(elapsedTime * 2.5);
  const ghost3Angle = -elapsedTime * 0.18;
  ghost3.position.x = Math.cos(ghost3Angle) * (7 + Math.sin(elapsedTime * 0.32));
  ghost3.position.z = Math.sin(ghost3Angle) * (7 + Math.sin(elapsedTime * 0.5));
  ghost3.position.y = Math.sin(elapsedTime * 5) + Math.sin(elapsedTime * 2);

  if (isgo) {
    gouBottomLeft.rotation.z = 0.7;
    gouBottomRight.rotation.z = -0.7;
  } else {
    gouBottomLeft.rotation.z = -0.7;
    gouBottomRight.rotation.z = 0.7;
  }
  isgo = !isgo;
  agou.position.x = Math.cos(ghost1Angle) * 4;
  agou.position.z = Math.sin(ghost1Angle) * 4;
  // Update controls
  controls.update();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
