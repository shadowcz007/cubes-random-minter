/** Connect to Moralis server */
const serverUrl = "https://5ip9ljtq95ri.usemoralis.com:2053/server";
const appId = "FLIwJ8FTlPyVQ0bRrTomHvILmrkddeGRYTB9RuIz";
Moralis.start({ serverUrl, appId });
let user = Moralis.User.current();

const _isDev = parseParams('dev');

console.log(_isDev)

const _TITLE = window.location.pathname.slice(1, -1).replace(/\/.*/ig, '') || "nft-minter";
const _DES = window.location.hostname + window.location.pathname;
const _MAX_SIZE = 30;

window.cubes = [];
window.animateIsFinish = true;
window.createType = 'gif';
window.input_speed = 0.01;
window.nextMapIndex=1;
window.nextMapMaxIndex=2;


initApp();
checkUserStatus();

// 获取地址栏参数
function parseParams(name) {
    if (!name) return
    const paramsStr = window.location.search;
    const params = new URLSearchParams(paramsStr)
    return params.get(name)
}

// create timestamp
function createTimeStamp() {
    let t = new Date();
    return t.getFullYear() + '/' + (t.getMonth() + 1) + '/' + t.getDate() + ' ' + t.getHours() + ':' + (t.getMinutes()) + ':' + t.getSeconds()
}

/** Add from here down */
async function login() {
    if (document.querySelector("#login").innerText == 'LOGOUT') {
        await Moralis.User.logOut();
        user = null;
        userLogout();
        return;
    }
    document.querySelector(".loading").style.display = "flex";
    // user = await Moralis.authenticate({ signingMessage: "Welcome to "+_TITLE })
    if (!user) {
        try {
            user = await Moralis.authenticate({ signingMessage: "Welcome to " + _TITLE })
            initApp();
            userLogin();
        } catch (error) {
            console.log(error)
            document.querySelector(".loading").style.display = "none";
        }
    } else {
        Moralis.enableWeb3();
        userLogin();
        initApp();
    }

}

function checkUserStatus() {

    if (user) {
        Moralis.enableWeb3();
        userLogin();
        initApp();
    }
}

function userLogin() {
    document.querySelector("#login").innerText = 'LOGOUT';
    document.querySelector(".loading").style.display = "none";
    // document.querySelector("#submit_button").removeAttribute('disabled');
    document.querySelector(".container").classList.remove('blur');
}

function userLogout() {
    document.querySelector("#login").innerText = 'LOGIN';
    document.querySelector(".loading").style.display = "none";
    document.querySelector("#submit_button").setAttribute('disabled', true);
    document.querySelector(".container").classList.add('blur');
}

function initApp() {
    document.querySelector("#title").innerText = _TITLE;
    document.querySelector("#login").onclick = login;
    document.querySelector("#open_github").onclick = () => window.location.href = 'https://github.com/shadowcz007/cubes-random-minter';
    document.querySelector("#app").style.display = "flex";
    document.querySelector("#submit_button").onclick = submit;
    document.querySelector("#create").onclick = runAnimate;
    document.querySelector('#download').onclick = download;
    // document.querySelector("#target").onclick = () => document.querySelector("#create").click();
    document.querySelector("#set_gif").onclick = () => changeCreateType("gif");
    document.querySelector("#set_png").onclick = () => changeCreateType("png");


    // update cubes
    document.querySelector('#input_map').onclick = openFile;
    document.querySelector('#input_clear_map').onclick = clearMap;
    document.querySelector('#input_next').onclick=nextMap;
    document.querySelector('#input_padding').oninput = updatePadding;
    document.querySelector('#input_width').oninput = updateWidth;
    document.querySelector('#input_height').oninput = updateHeight;
    document.querySelector('#input_speed').oninput = updateSpeed;
    document.querySelector('#enable_rotation').oninput=updateRotation;
    document.querySelector('#enable_zindex').oninput=updateZindex;
    document.querySelector('#input_intensity').oninput=updateIntensity;

    window.input_width = parseInt(document.querySelector('#input_width').value);
    window.input_height = parseInt(document.querySelector('#input_height').value);
    window.input_padding = parseFloat(document.querySelector('#input_padding').value);
    window.enable_rotation = !!document.querySelector('#enable_rotation').checked;
    window.enable_zindex = !!document.querySelector('#enable_zindex').checked;
    window.input_intensity= Math.random() + 0.8;

    initDragAndDrop(document, loadFile);

    // your id
    const fpPromise =
        import ('https://openfpcdn.io/fingerprintjs/v3')
        .then(FingerprintJS => FingerprintJS.load())

    // Get the visitor identifier when you need it.
    fpPromise
        .then(fp => fp.get())
        .then(result => {
            document.querySelector("#input_id").innerText = result.visitorId;
            window.visitorId = result.visitorId;
            document.querySelector("#input_title").innerText = _TITLE;
            document.querySelector("#input_description").innerText = "Co-Creation: " + _DES + " + DEVICE ID";

            // timestamp
            window.timestamp = createTimeStamp();
            document.querySelector("#input_timestamp").innerText = window.timestamp;
            // drawText();
        });

    window.drawingCanvas = document.createElement('canvas');

    create();

};

function nextMap(){
    clearMap();
    // if(!window.nextMapIndex) window.nextMapIndex=1;
    window.nextMapIndex++;
    if(window.nextMapIndex>window.nextMapMaxIndex) window.nextMapIndex=1;
    window.mapImage=`images/${window.nextMapIndex}.png`;
    document.querySelector('#next_img_display').src=window.mapImage;
    updateTexture(window.mapImage);
}

function changeCreateType(t) {
    window.createType = t;
    if (t == 'gif') {
        document.querySelector("#set_gif").classList.add("select");
        document.querySelector("#set_png").classList.remove("select");
    } else {
        document.querySelector("#set_gif").classList.remove("select");
        document.querySelector("#set_png").classList.add("select");
    }
}

function disableCreateButtons() {
    document.querySelector("#set_gif").setAttribute('disabled', true);
    document.querySelector("#set_png").setAttribute('disabled', true);
    document.querySelector("#create").setAttribute('disabled', true);
    // document.querySelector("#submit_button").setAttribute('disabled', true);
    document.querySelector("#download").setAttribute('disabled', true);
    document.querySelector("#success_message").style.display = 'none';

}

function enableCreateButtons() {
    document.querySelector("#set_gif").removeAttribute('disabled');
    document.querySelector("#set_png").removeAttribute('disabled');
    document.querySelector("#create").removeAttribute('disabled');
    // document.querySelector("#submit_button").removeAttribute('disabled');
    document.querySelector("#download").removeAttribute('disabled');
};


function computeAnimate(from,to,duration=1500){
    // https://animejs.com/documentation/#JSobjProp
    let res=[];
    return new Promise((resolve,_)=>{
        anime({
            targets: from,
            ...to,
            easing: 'linear',
            round: 1,
            duration: duration,
            update: function() {
                // console.log(JSON.stringify(myObject2))
              res.push({...from})
            },
           complete:function(){
               resolve(res);
            }
          });
      })  
};

function seekAnimate(from,to,seek=0.1,duration=2500){
    let f={...from};
    let animation=anime({
        targets: f,
        ...to,
        easing: 'linear',
        round: 1,
        duration: duration,
    //     update: function() {
    //         // console.log(JSON.stringify(myObject2))
    //       res.push({...from})
    //     },
    //    complete:function(){
          
    //     }
      });
    animation.seek(animation.duration * seek);
    return f;
}


function runAnimate() {

    disableCreateButtons();
    window.animateTime = window.createType === 'gif' ? 1500 : 3500 + (3000 * Math.random());
    // window.animateIsFinish ? window.animateIsFinish = false : null;
    window.spherify = Math.random()>0.5?-1:1;
    window.twist = Math.random()>0.5?-1 :1;
    window.cubes = shuffle(window.cubes);

    if (window.createType === 'gif') {
        // window.ctxs = [];
        // window.fps = 12;
        createGifFromAnimate(window.animateTime || 1000).then(async() => {
            await createBase64ForResult()
            enableCreateButtons();
        })
    }else{
        createBase64ForResult().then(()=>enableCreateButtons());
    }

    // 动画终止
    // setTimeout(() => {
    //     window.animateIsFinish = true;
    //     if (window.createType === 'png') enableCreateButtons();
    // }, window.animateTime || 1000);


    // 打乱
    function shuffle(arr) {
        let arrNew = [...arr]
            //用Math.random()函数生成0~1之间的随机数与0.5比较，返回-1或1
        const randomsort = function(a, b) {
                return Math.random() > 0.5 ? -1 : 1
            }
            // var arr = [1, 2, 3, 4, 5];
        return [...arrNew.sort(randomsort)]
    }
}

async function createGifFromAnimate(t = 2000, fps = 12) {
    window.ctxs = [];
    window.fps = fps;
    
    for (var i = 0; i <= (t / 1000) * fps; i++) {
        await sleep(1000 / fps);
        // console.log(i,(t / 1000) * fps,i/((t / 1000) * fps))
        runAnimateInRender(i/((t / 1000) * fps))
        renderer.render(scene, camera);
        let ctx = canvasClone2Ctx(renderer.domElement);
        window.ctxs.push(ctx);
    };
    for (var i = 0; i <= fps/2; i++) {
        await sleep(1000 / fps);
        runAnimateInRender(1);
        renderer.render(scene, camera);
        let ctx = canvasClone2Ctx(renderer.domElement);
        window.ctxs.push(ctx);
    };
}

function canvasClone2Ctx(canvas) {
    let c = document.createElement('canvas');
    let ctx = c.getContext('2d');
    c.width = canvas.width;
    c.height = canvas.height;
    ctx.drawImage(canvas, 0, 0, c.width, c.height);
    return ctx;
}

function blobToBase64(blob) {
    return new Promise((resolve, _) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(blob);
    });
}

function sleep(m = 1000) {
    return new Promise(r => setTimeout(r, m))
}

function createGif(ctxs = [], delay = 200) {

    const encoder = new minigif.GIFEncoder();
    encoder.setRepeat(0); // loop forever
    encoder.setDelay(delay); // go to next frame every 100 ms
    encoder.start(); // write header

    for (const ctx of ctxs) {
        encoder.addFrame(ctx); // Render the frame from the canvas context.
    }

    encoder.finish(); // finsh
    const arr = encoder.stream().getUnit8Array(); //获取生成的Unit8Array
    // const file = new Blob([arr]);                  //生成文件
    // const url = URL.createObjectURL(new Blob([res],{type: 'image/gif'}));        //获取浏览器可用的地址

    return blobToBase64(new Blob([arr], { type: 'image/gif' }));
}

async function createBase64() {
    let base64;
    if (window.createType == 'gif' && window.ctxs && window.ctxs.length > 0) {
        base64 = await createGif(window.ctxs, 1000 / window.fps);
    }

    if (window.createType == 'png') base64 = getTargetResult();
    return base64;

}

async function createBase64ForResult(){
    let base64 = await createBase64();
    let img=new Image();
    img.src=base64;
    document.querySelector('#result').appendChild(img);
    img.alt=createTimeStamp();
    img.addEventListener('click',e=>{
        e.preventDefault();
        for (const im of document.querySelectorAll('#result img')) {
            im.classList.remove('select');
        };
        img.classList.add('select');
        document.querySelector('#display_timestamp').innerText=img.alt;
        document.querySelector('#submit_button').removeAttribute('disabled');
    })
}

async function download() {
    let base64 = await createBase64();
    let a = document.createElement('a')
    a.href = encodeURI(base64)
    a.setAttribute('name', _TITLE + '.' + window.createType)
    a.setAttribute('download', _TITLE + '.' + window.createType)
    a.click()
}

async function submit() {
    if (!animateIsFinish) return;
    let im=document.querySelector('#result .select');
    if(!im)return;
    disableCreateButtons();

    // try {

    // } catch(error) {

    // }

    let message = document.querySelector('#success_message');
    message.style.display = "block";

    let base64=im.src;

    // if (window.createType == 'gif' && window.ctxs && window.ctxs.length > 0) {
    //     // message.innerHTML = `- gif - create`;
    //     // await sleep(200);

    //     // base64 = await createGif(window.ctxs, 1000 / window.fps);
    // }

    // if (window.createType == 'png') base64 = getTargetResult();
    message.innerHTML = `- ipfs - init`;


    // let base64=getTargetResult();
    // const input = document.querySelector('#input_image');
    // let data = input.files[0]
    const imageFile = new Moralis.File(_TITLE + '.' + window.createType, { base64: base64 })
    await imageFile.saveIPFS();
    let imageHash = imageFile.hash();

    message.innerHTML = `- ipfs - image-${window.createType}-file-save`;

    let metadata = {
        // 仅支持英文
        title: _TITLE,
        description: "Co-Creation: " + _DES + " + DEVICE ID-" + window.visitorId,
        image: "/ipfs/" + imageHash,
        timestamp: im.alt,
        visitorId: window.visitorId
    }
    console.log(metadata);
    const jsonFile = new Moralis.File("metadata.json", { base64: btoa(JSON.stringify(metadata)) });
    await jsonFile.saveIPFS();
    console.log(jsonFile)
    message.innerHTML = `- ipfs - metadata.json -save`;

    let metadataHash = jsonFile.hash();
    console.log(jsonFile.ipfs())
    let res = await Moralis.Plugins.rarible.lazyMint({
        chain: _isDev ? 'rinkeby' : 'eth',
        userAddress: user.get('ethAddress'),
        tokenType: 'ERC721',
        tokenUri: 'ipfs://' + metadataHash,
        royaltiesAmount: 5, // 0.05% royalty. Optional
    })
    console.log(res);
    document.querySelector('#success_message').innerHTML =
        `NFT minted. <a target="_blank" href="https://${_isDev?'rinkeby.':''}rarible.com/token/${res.data.result.tokenAddress}:${res.data.result.tokenId}">View NFT`;
    document.querySelector('#success_message').style.display = "block";
    // setTimeout(() => {
    //     document.querySelector('#success_message').style.display = "none";

    // }, 1000)
    enableCreateButtons();
}

function createCube() {
    const geometry = createGeometry();
    const material = new THREE.MeshPhongMaterial({
        color: 0x808080,
        shininess: 70,
        dithering: true
    });
    // const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
    const cube = new THREE.Mesh(geometry, material);
    cube.position.y = 1.2;
    return cube;
}

function createCubesImage(width = 3, height = 3, padding = 0.1) {
    let cubes = [];
    let cube = createCube();
    for (let i = width / 2; i > -width / 2; i--) {
        let cubesChildren = [];
        let x = 0 + i + padding * i;
        for (let index = height / 2; index > -height / 2; index--) {
            let c = cube.clone();
            c.material = c.material.clone();
            c.userData.toPosition={
                x,
                y:0 + index + index * padding,
                z : -2
            };
            // c.position.x = Math.random()*100;
            // c.position.y = Math.random()*100;
            // c.position.z = -2;
            c.position.x=x;
            c.position.y=0 + index + index * padding;
            c.position.z =window.enable_zindex? Math.random()*100:-2;
            c.userData.fromPosition=c.position.clone();
            c.userData.time=0;
            // computeAnimate({
            //     x:Math.random()*100,
            //     y:Math.random()*100,
            //     z:Math.random()*100,
            // },c.userData.position).then(positions=>{
            //     c.userData.positions=positions;
            // })
                // scene.add(c);
            cubesChildren.push(c);
            c.userData._baseX = i;
            c.userData._baseY = index;
        };
        cubes.push(cubesChildren)
    }
    return cubes;
}

function updateCubesPosition(padding = 0.5) {
    for (const row of window.cubes) {
        for (const c of row) {
            c.position.x = c.userData._baseX + padding * c.userData._baseX;
            c.position.y = c.userData._baseY + padding * c.userData._baseY;
        }
    }
}

function updateCubesImage(width = 1, height = 1, padding = 0.1) {
    for (let cs of window.cubes) {
        for (let c of cs) {
            c.removeFromParent(window.scene)
        }
    };
    window.cubes = createCubesImage(width, height, padding);
    cubesAddScene(window.cubes, window.scene);
}

function cubesAddScene(cubes, scene) {
    for (const row of cubes) {
        for (const c of row) {
            scene.add(c);
        }
    }
}

function createGeometry() {

    const geometry = new THREE.BoxGeometry(1, 1, 1, 32, 32, 32);

    // create an empty array to  hold targets for the attribute we want to morph
    // morphing positions and normals is supported
    geometry.morphAttributes.position = [];

    // the original positions of the cube's vertices
    const positionAttribute = geometry.attributes.position;

    // for the first morph target we'll move the cube's vertices onto the surface of a sphere
    const spherePositions = [];

    // for the second morph target, we'll twist the cubes vertices
    const twistPositions = [];
    const direction = new THREE.Vector3(1, 0, 0);
    const vertex = new THREE.Vector3();

    for (let i = 0; i < positionAttribute.count; i++) {

        const x = positionAttribute.getX(i);
        const y = positionAttribute.getY(i);
        const z = positionAttribute.getZ(i);

        spherePositions.push(

            x * Math.sqrt(1 - (y * y / 2) - (z * z / 2) + (y * y * z * z / 3)),
            y * Math.sqrt(1 - (z * z / 2) - (x * x / 2) + (z * z * x * x / 3)),
            z * Math.sqrt(1 - (x * x / 2) - (y * y / 2) + (x * x * y * y / 3))

        );

        // stretch along the x-axis so we can see the twist better
        vertex.set(x * 2, y, z);

        vertex.applyAxisAngle(direction, Math.PI * x / 2).toArray(twistPositions, twistPositions.length);

    }

    // add the spherical positions as the first morph target
    geometry.morphAttributes.position[0] = new THREE.Float32BufferAttribute(spherePositions, 3);

    // add the twisted positions as the second morph target
    geometry.morphAttributes.position[1] = new THREE.Float32BufferAttribute(twistPositions, 3);

    return geometry;

}

function getSceneCenter(scene) {
    var minX = null,
        maxX = null,
        minY = null,
        maxY = null;
    for (let c of scene.children) {
        if (minX == null) {
            minX = c.position.x
            maxX = c.position.x
            minY = c.position.y;
            maxY = c.position.y;
        };
        minX = Math.min(minX, c.position.x);
        maxX = Math.max(maxX, c.position.x);
        minY = Math.min(minY, c.position.y);
        maxY = Math.max(maxY, c.position.y);
    };
    return [(minX + maxX) / 2, (minY + maxY) / 2]
}


function create() {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);

    let canvas = document.querySelector('#target'),
        width = parseInt(getComputedStyle(document.querySelector('#target')).width),
        height = parseInt(getComputedStyle(document.querySelector('#target')).height);

    let mouseX = 0,
        mouseY = 0;

    // console.log(windowHalfX,windowHalfY)
    // console.log(document.querySelector('#target').style.width)
    // canvas.width=width;
    // canvas.height=height;
    // canvas.width=

    var fov = 45;
    var near = 0.1;
    var far = 1000;

    const camera = new THREE.PerspectiveCamera(fov, width / height, near, far);

    const renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        preserveDrawingBuffer: true,
        canvas: document.querySelector('#target')
    });
    renderer.outputEncoding = THREE.LinearEncoding;
    renderer.setSize(width, height, false);
    renderer.setPixelRatio(2);
    // renderer.setSize( window.innerWidth, window.innerHeight );
    // document.body.appendChild( renderer.domElement );

    // scene.add( cube );

    // clone
    window.cubes = createCubesImage(window.input_width, window.input_height, window.input_padding);
    cubesAddScene(window.cubes, scene);

    // const geometry2 = new THREE.BoxGeometry(8,2,0.1);
    // const material2 = new THREE.MeshBasicMaterial( { color: 0xffffff } );
    // const cube2 = new THREE.Mesh( geometry2, material2 );
    // cube2.position.y=-2;
    // window.material=material2;
    // window.material.map = new THREE.CanvasTexture( window.drawingCanvas );
    // // cube2.position.x=-0
    // scene.add( cube2 );
    let distance = 100;
    //lights
    // const sphere = new THREE.SphereGeometry( 0.5, 16, 8 );
    light1 = new THREE.PointLight(0xff0040, 2, distance);
    // light1.add( new THREE.Mesh( sphere, new THREE.MeshBasicMaterial( { color: 0xff0040 } ) ) );
    scene.add(light1);

    light2 = new THREE.PointLight(0x0040ff, 2, distance);
    // light2.add( new THREE.Mesh( sphere, new THREE.MeshBasicMaterial( { color: 0x0040ff } ) ) );
    scene.add(light2);

    light3 = new THREE.PointLight(0x80ff80, 2, distance);
    // light3.add( new THREE.Mesh( sphere, new THREE.MeshBasicMaterial( { color: 0x80ff80 } ) ) );
    scene.add(light3);

    light4 = new THREE.PointLight(0xffaa00, 2, distance);
    // light4.add( new THREE.Mesh( sphere, new THREE.MeshBasicMaterial( { color: 0xffaa00 } ) ) );
    scene.add(light4);

    light5=new THREE.AmbientLight(0xffffff,window.input_intensity);
    scene.add(light5);

    camera.position.z = -100;

    // 官方实现的
    // Orbit controls allow the camera to orbit around a target.
    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.target.set(...getSceneCenter(scene), 0);
    controls.update();
    controls.enablePan = true;
    controls.enableDamping = true;
    // controls.listenToKeyEvents( renderer.domElement) 
    const raycaster = new THREE.Raycaster();
	const mouse = new THREE.Vector2( 1, 1 );

    function onPointerMove(event) {
        if (event.isPrimary === false) return;

        let bound=canvas.getBoundingClientRect()
        let windowHalfX = width / 2 + bound.x;
        let windowHalfY = height / 2 + bound.y;

        // console.log(event.clientX,event.clientY)
        mouseX = event.clientX - windowHalfX;
        mouseY =- (event.clientY - windowHalfY);
        // console.log(mouseX,mouseY)
        // console.log(event.clientX-canvas.offsetLeft)
        // 以画布中心为原点0，0； 右上角1，1；左下角 -1，-1
        mouse.x = ( (event.clientX-bound.x) / width ) * 2 - 1;
		mouse.y = - ( (event.clientY-bound.y) / height) * 2 + 1;
        // console.log(mouse)
        //  控制在画布范围内
        // closeChangeCamera=!!(mouseX>=width/2||mouseX<-width/2||mouseY>=height/2||mouseY<-height/2)

        // if(mouseX<0) mouseX=Math.min(mouseX,-width/2);
        // if(mouseY>=0) mouseY=Math.max(mouseY,height/2);
        // if(mouseY<0) mouseY=Math.min(mouseY,-height/2);
        // console.log(mouseX,mouseY)
    }


    function onWindowResize() {
        // let bound=canvas.getBoundingClientRect()
        // let windowHalfX = width / 2 + bound.x;
        // let windowHalfY = height / 2 + bound.y;

        // windowHalfX = width / 2 + canvas.offsetLeft;
        // windowHalfY = height / 2 + canvas.offsetTop;
        // camera.aspect = window.innerWidth / window.innerHeight;
        // camera.updateProjectionMatrix();
        // renderer.setSize( window.innerWidth, window.innerHeight );
    }

    function render() {
       
        controls.update();
      
        if(mouseX!=null && mouseY!=null){
            // camera.position.x += (mouseX - camera.position.x) * 0.00001;
            // camera.position.y += (-mouseY - camera.position.y) * 0.00001;
            // camera.rotation.x += (mouseX - camera.rotation.x) * 0.0000001;
            // camera.rotation.y += (-mouseY - camera.rotation.y) * 0.0000001;
        }
        

        // https://threejs.org/docs/index.html?q=raycast#api/en/core/Raycaster
        raycaster.setFromCamera( mouse, camera );
        const intersects = raycaster.intersectObjects( scene.children );
       
        for ( let i = 0; i < intersects.length; i ++ ) {
            // intersects[ i ].object.material.color.set( 0xff0000 );
            intersects[ i ].object.scale.set(1.5,1.5,1.5);
            // console.log(intersects[i].object)
            // uuids[intersects[i].object.uuid]=true;
        };
        for (const mesh of scene.children) {
            if(mesh.type=='Mesh'){
                // mesh.scale.set(1,1,1);
                if(mesh.scale.x>1&&mesh.scale.y>1&&mesh.scale.z>1){
                    mesh.scale.x-=0.1*window.input_speed;
                    mesh.scale.y-=0.1*window.input_speed;
                    mesh.scale.z-=0.1*window.input_speed;
                }
            }
        }

        // camera.lookAt( scene.position );
        // console.log(camera.position.x,camera.position.y)
        renderer.render(scene, camera);
    
    }

    function animate() {
        render();
        // 
        // if(!window.preTime) window.preTime=Date.now();
        // // 记录动画
        // if(window.ctxs&&window.ctxs.length<fps*window.animateTime/1000){
        //     if(Date.now()-window.preTime>(1000 / window.fps)){
        //         window.preTime=Date.now();
        //         renderer.render(scene, camera);
        //         let ctx=canvasClone2Ctx(renderer.domElement);
        //         window.ctxs.push(ctx);
        //     };
        // }else{
        //     window.animateIsFinish = true;
        //     enableCreateButtons();
        // };
    
        requestAnimationFrame(animate);
        // console.log(Date.now()-t1)
    };



    document.body.style.touchAction = 'none';
    document.body.addEventListener('pointermove', onPointerMove);
    // document.querySelector('#target').addEventListener('mousewheel', onMousewheel, false);
    window.addEventListener('resize', onWindowResize);

    animate();

    window.renderer = renderer;
    window.scene = scene;
    window.camera = camera;
};


function runAnimateInRender(step=0.1){
    let count = 30;
            if(window.enable_rotation){
                for (const row of window.cubes) {
                    for (const cube of row) {
                        cube.rotation.x += window.input_speed ;
                        cube.rotation.y += window.input_speed ;
                        // cube.position.z = Math.random()>0.5?-0.3:0;
                        if (count > 0) {
                            //cube.scale.x += Math.random()*(Math.random()>0.5?-0.02:0.02);
                            // Spherify
                            cube.morphTargetInfluences[0] += window.input_speed*window.spherify;
                            if(Math.abs(cube.morphTargetInfluences[0])>1)cube.morphTargetInfluences[0]/=Math.abs(cube.morphTargetInfluences[0]);
                                // Twist
                            cube.morphTargetInfluences[1] +=window.input_speed*window.twist;
                            if(Math.abs(cube.morphTargetInfluences[1])>1)cube.morphTargetInfluences[1]=Math.max(0,cube.morphTargetInfluences[1]/Math.abs(cube.morphTargetInfluences[1]));
                            // console.log(cube.morphTargetInfluences[0],cube.morphTargetInfluences[1])
                            count--;
                        };
                    }
                };
                // scene
                // scene.rotation.y+=window.input_speed * Math.random();
            };

            
            // position
            if(window.enable_zindex){
                for (const row of window.cubes) {
                    for (const cube of row) {
                        // cube.userData.positions[];
                        // cube.userData.time+=500*window.input_speed;
                        // let s=Math.min(cube.userData.time/window.animateTime,1);
                        // console.log(step)
                        if(step<1){
                            let newPos=seekAnimate(cube.userData.fromPosition,cube.userData.toPosition,step);
                            // cube.position.x=newPos.x;
                            // cube.position.y=newPos.y;
                            cube.position.z=newPos.z;
                        }else{
                            // cube.position.x=cube.userData.toPosition.x;
                            // cube.position.y=cube.userData.toPosition.y;
                            cube.position.z=cube.userData.toPosition.z;
                        }
                        
                    }
                };
                
            }
            
            
            const time = Date.now() * 0.0035;

            light1.position.x = Math.sin(time * 0.7) * 30;
            light1.position.y = Math.cos(time * 0.5) * 40;
            light1.position.z = Math.cos(time * 0.3) * 30;

            light2.position.x = Math.cos(time * 0.3) * 30;
            light2.position.y = Math.sin(time * 0.5) * 40;
            light2.position.z = Math.sin(time * 0.7) * 30;

            light3.position.x = Math.sin(time * 0.7) * 30;
            light3.position.y = Math.cos(time * 0.3) * 40;
            light3.position.z = Math.sin(time * 0.5) * 30;

            light4.position.x = Math.sin(time * 0.3) * 30;
            light4.position.y = Math.cos(time * 0.7) * 40;
            light4.position.z = Math.sin(time * 0.5) * 30;

            // let ctx = canvasClone2Ctx(renderer.domElement);
            // window.ctxs.push(ctx);
            
}


function drawText() {
    var drawingContext = drawingCanvas.getContext('2d');
    // draw white background
    drawingContext.fillStyle = 'rgba(0,0,0,1)';
    drawingContext.fillRect(0, 0, 300, 250);
    drawingContext.fillStyle = '#FFFFFF';
    drawingContext.fillText(window.timestamp, 20, 130)
    if (window.material) window.material.map.needsUpdate = true;
}

function getTargetResult() {
    let c = window.renderer.domElement;
    // let ctx = c.getContext('2d');
    // // console.log(ctx)
    // ctx.font = '14px Arial'
    // ctx.fillStyle = 'white'
    // ctx.fillText('by shadow', 24, c.height - 8)
    let png = c.toDataURL('image/png');
    return png
}

function initDragAndDrop(dom, callback) {
    dom.addEventListener('dragover', function(event) {
        event.preventDefault()
        event.dataTransfer.dropEffect = 'copy'
    })

    dom.addEventListener('drop', function(event) {
        event.preventDefault()

        callback(event.dataTransfer.files[0])
    })
}

function openFile() {
    let input = document.createElement('input')
    input.type = 'file'
    input.addEventListener('change', e => {
        const curFiles = input.files;
        loadFile(curFiles[0]);
        document.querySelector('#input_width').setAttribute('disabled', true);
        document.querySelector('#input_height').setAttribute('disabled', true);
    })
    input.click()
}

function clearMap() {
    document.querySelector('#input_map').innerText = 'OPEN';
    document.querySelector('#input_width').removeAttribute('disabled');
    document.querySelector('#input_height').removeAttribute('disabled');
    document.querySelector('#input_map').removeAttribute('disabled');
    window.mapImage = null;
    window.map_data = null;
    updateTexture(window.mapImage);
}

function loadFile(file) {
    const filename = file.name
    const extension = filename
        .split('.')
        .pop()
        .toLowerCase()

    if (['gif', 'png', 'jpeg', 'jpg', 'jfif'].includes(extension)) {
        // 'jpg', 'png'
        const reader = new FileReader()
        reader.addEventListener('load', function(event) {
            // console.log(event,event.target.result)
            window.mapImage = event.target.result
            updateTexture(window.mapImage)

        });
        reader.readAsDataURL(file)
    }
}

// gridSize 马赛克大小
function splitImage(img, gridSize = 10) {
    let canvas = document.createElement('canvas'),
        ctx = canvas.getContext('2d');

    let width = img.naturalWidth,
        height = img.naturalHeight;

    canvas.width = width;
    canvas.height = height;
    ctx.drawImage(img, 0, 0, width, height);

    let gw = parseInt(width / gridSize),
        gh = parseInt(height / gridSize);
    let gwStart = (width - gw * gridSize) / 2;
    let ghStart = (height - gh * gridSize) / 2;

    let res = [];
    for (let x = 0; x < gw; x++) {
        let xStart = gwStart + x * gridSize;
        let xEnd = xStart + gridSize;
        let ws = [];
        for (let y = 0; y < gh; y++) {
            let yStart = ghStart + y * gridSize;
            let yEnd = yStart + gridSize;
            // console.log(xStart,xEnd,yStart,yEnd)
            let imgData = ctx.getImageData(xStart, yStart, gridSize, gridSize);
            ws.push({
                imgData,
                x: xStart,
                width: gridSize,
                y: yStart,
                height: gridSize
            })
        };
        res.push(ws);
    };

    return { data: res, width: gw, height: gh };

};

function loadTexture(url) {
    return new Promise((resolve, _) => {
        let t = new THREE.TextureLoader();
        // 注意材质是异步的，需要在回调里render下
        let texture = t.load(url, res => {
            resolve(texture)
        });
    })
};

function createImageFromUrl(url) {
    return new Promise((resolve, _) => {
        let img = new Image();
        img.src = url;
        img.onload = () => {
            resolve(img);
        }
    });
}

function updateTexture(url) {
    if (!(window.cubes && window.cubes.length > 0)) return;
    if (!url) {
        updateCubesImage(window.input_width, window.input_height, window.input_padding);
    } else {
        createImageFromUrl(url).then(async im => {
            document.querySelector('#input_width').setAttribute('disabled',true);
            document.querySelector('#input_height').setAttribute('disabled',true);
            document.querySelector('#input_map').setAttribute('disabled',true);
            // if(Math.max(im.naturalHeight,im.naturalWidth)){}

            let si = splitImage(im, Math.max(im.naturalHeight,im.naturalWidth)/Math.max(Math.max(im.naturalHeight,im.naturalWidth)/10,_MAX_SIZE));
            let width = si.width,
                height = si.height;
            window.map_data = si.data;
            window.input_width = width;
            window.input_height = height;
            document.querySelector('#input_width').value = window.input_width;
            document.querySelector('#input_height').value = window.input_height;
            await updateCubesImageAndTextures(window.input_width, window.input_height, window.map_data)

        });
    }

}

async function updateCubesImageAndTextures(width, height, data) {

    updateCubesImage(width, height, window.input_padding);
    if (data) {
        // 批量处理纹理
        let textures = [];
        let count = width * height;
        for (let index = 0; index < data.length; index++) {
            for (let i = 0; i < data[index].length; i++) {
                // 可中断
                if(window.mapImage==null) return document.querySelector('#input_map').innerText='OPEN';

                let c = document.createElement('canvas'),
                    ctx = c.getContext('2d');
                c.width = data[index][i].width;
                c.height = data[index][i].height;
                // console.log(data[index][i].imgData)
                ctx.putImageData(data[index][i].imgData, 0, 0);
                
                if (!textures[index]) textures[index] = []

                if(!data[index][i].texture){
                    textures[index][i] = await loadTexture(c.toDataURL());
                    data[index][i].texture=textures[index][i];
                }else{
                    textures[index][i]=data[index][i].texture;
                }
                
                count--;
                document.querySelector('#input_map').innerText = (100 * (width * height - count) / (width * height)).toFixed(1) + '%'
            }
        };
        // 统一更新
        for (let index = 0; index < textures.length; index++) {
            for (let i = 0; i < textures[index].length; i++) {
                let texture = textures[index][i];
                updateMeshTexture(window.cubes[index][i], texture);
            }
        };
        window.map_data=data;
    }

    window.renderer.render(window.scene, window.camera);

}

function updateMeshTexture(mesh, texture) {
    if (mesh.material.map) mesh.material.map.dispose();
    mesh.material.map = texture;
    mesh.material.needsUpdate = true; // because the encoding can change
}

function updatePadding(e) {
    // console.log()
    window.input_padding = parseFloat(e.target.value);
    updateCubesPosition(window.input_padding)
}

async function updateWidth(e) {
    window.input_width = parseInt(e.target.value);
    // console.log(window.input_width, window.input_height, window.input_padding)
    await updateCubesImageAndTextures(window.input_width, window.input_height, window.map_data);
    // updateCubesImage(window.input_width, window.input_height, window.input_padding)
}

async function updateHeight(e) {
    window.input_height = parseInt(e.target.value);
    await updateCubesImageAndTextures(window.input_width, window.input_height, window.map_data);
    // console.log(window.input_width, window.input_height, window.input_padding)
    // updateCubesImage(window.input_width, window.input_height, window.input_padding)
}

function updateSpeed(e) {
    window.input_speed = parseFloat(e.target.value);
}

function updateRotation(e){
    window.enable_rotation=!!e.target.checked;
    if(window.enable_rotation||window.enable_rotation){
        document.querySelector('#input_speed').removeAttribute('disabled');
    }else{
        document.querySelector('#input_speed').setAttribute('disabled',true);
    }
}

async function updateZindex(e){
    window.enable_zindex=!!e.target.checked;
    if(window.enable_zindex||window.enable_rotation){
        document.querySelector('#input_speed').removeAttribute('disabled');
    }else{
        document.querySelector('#input_speed').setAttribute('disabled',true);
    };
    // updateCubesImage(window.input_width,window.input_height,window.input_padding);
    await updateCubesImageAndTextures(window.input_width, window.input_height, window.map_data);
}

function updateIntensity(e){
    window.input_intensity=parseFloat(e.target.value);
    light5.intensity=window.input_intensity;
}

// login();



// https://threejs.org/examples/?q=mor#webgl_morphtargets
//