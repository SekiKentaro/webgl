import { WebGLRenderer, Scene, AnimationMixer, LoopOnce, DirectionalLight, AmbientLight } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

let renderer;
let scene;
let gltfLoader;
let camera;
let mixer;
let animations;

// glbのurlを指定
const url = '/blender-camera-jinja/3d/mycity.glb';

const canvas = document.getElementById('canvas');

// ウィンドウサイズ設定
const width = window.innerWidth;
const height = window.innerHeight;

window.addEventListener('DOMContentLoaded', init);
window.addEventListener('resize', onResize);

function init() {
  renderer = new WebGLRenderer({
    canvas: canvas,
    alpha: true,
  });

  renderer.setPixelRatio(1);
  renderer.setSize(width, height);

  scene = new Scene();

  // Load GLTF or GLB
  gltfLoader = new GLTFLoader();

  new Promise((resolve) => {
    gltfLoader.load(url, (gltf) => {
      animations = gltf.animations;
      const model = gltf.scene;

      if (animations && animations.length) {
        mixer = new AnimationMixer(gltf.scene);
        for (let i = 0; i < animations.length; i++) {
          const action = mixer.clipAction(animations[i]);
          //ループ設定（1回のみで終わらせる。これをコメントアウトするとループになる）
          action.setLoop(LoopOnce);
          //アニメーションの最後のフレームでアニメーションが終了（これがないと、最初の位置に戻って終了する）
          action.clampWhenFinished = true;
          action.play();
        }
      }
      scene.add(model);
      resolve(model);
    });
  }).then(() => {
    render();
  });
}

// gltfロード後の処理
function render() {
  createCamera();
  createLight();
  // 最初の状態を表示
  renderer.render(scene, camera);
}

function createCamera() {
  // blenderのカメラを取り出す
  camera = scene.children[0].children.find((child) => {
    return child.name === 'camera';
  });
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
}

function createLight() {
  const directionalLight = new DirectionalLight(0xfffacd);
  const ambientLight = new AmbientLight(0xffffff, 0.1);
  directionalLight.position.set(55, 70, 120);
  scene.add(directionalLight);
  scene.add(ambientLight);
}

function onResize() {
  // サイズを取得
  const width = window.innerWidth;
  const height = window.innerHeight;

  // レンダラーのサイズを調整する
  renderer.setSize(width, height);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.render(scene, camera);

  // カメラのアスペクト比を正す
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
}

window.addEventListener('scroll', function () {
  const scrollY = window.scrollY;
  const scrollYEl = document.getElementById('scrollY');
  const cameraAnimation = animations.find((animation) => {
    return animation.name === 'cameraAction';
  });

  let action = mixer.existingAction(cameraAnimation);
  action.reset();
  mixer?.setTime(scrollY / 1000);
  renderer.render(scene, camera);
  scrollYEl.textContent = String(scrollY);
});