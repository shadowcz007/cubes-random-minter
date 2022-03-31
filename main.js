
/** Connect to Moralis server */
const serverUrl = "https://5ip9ljtq95ri.usemoralis.com:2053/server";
const appId = "FLIwJ8FTlPyVQ0bRrTomHvILmrkddeGRYTB9RuIz";
Moralis.start({ serverUrl, appId });
let user = Moralis.User.current();

const _isDev=parseParams('dev');

console.log(_isDev)

const _TITLE=window.location.pathname.slice(1,-1).replace(/\/.*/ig,'')||"nft-minter";
const _DES=window.location.hostname+window.location.pathname;

// 获取地址栏参数
function parseParams(name){
  if(!name)return
  const paramsStr=window.location.search;
  const params=new URLSearchParams(paramsStr)
  return params.get(name)
}

// create timestamp
function createTimeStamp(){
  let t=new Date();
  return t.getFullYear()+'/'+(t.getMonth()+1)+'/'+t.getDate()+' '+t.getHours()+':'+(t.getMinutes())+':'+t.getSeconds()
}

/** Add from here down */
async function login() {
  if (!user) {
   try {
      user = await Moralis.authenticate({ signingMessage: "Hello World!" })
      initApp();
   } catch(error) {
     console.log(error)
   }
  }
  else{
    Moralis.enableWeb3();
    initApp();
  }
}



function initApp(){
    document.querySelector("#app").style.display = "flex";
    document.querySelector("#submit_button").onclick = submit;
    // document.querySelector("#input_refresh").onclick = runAnimate;
    document.querySelector("#target").onclick = runAnimate;

    // your id
    const fpPromise = import('https://openfpcdn.io/fingerprintjs/v3')
      .then(FingerprintJS => FingerprintJS.load())

    // Get the visitor identifier when you need it.
    fpPromise
      .then(fp => fp.get())
      .then(result => {
      document.querySelector("#input_id").innerText= result.visitorId;
      window.visitorId= result.visitorId;
      document.querySelector("#input_title").innerText=_TITLE;
      document.querySelector("#input_description").innerText="Co-Creation: "+_DES+ " + DEVICE ID";

      // timestamp
      window.timestamp=createTimeStamp();
      document.querySelector("#input_timestamp").innerText=window.timestamp;
      // drawText();
      });

      window.drawingCanvas=document.createElement( 'canvas' );
      
      create();

};

async function submit(){
   
    let message=document.querySelector('#success_message');
    message.innerHTML = `- ipfs - init`;
    message.style.display = "block";

    let base64=getTargetResult();
    // const input = document.querySelector('#input_image');
    // let data = input.files[0]
    const imageFile = new Moralis.File(_TITLE+'.png', { base64: base64 })
    await imageFile.saveIPFS();
    let imageHash = imageFile.hash();

    message.innerHTML = `- ipfs - image-file-save`;

    let metadata = {
      // 仅支持英文
        title: _TITLE,
        description:"Co-Creation: "+_DES+ " + DEVICE ID-" + window.visitorId,
        image: "/ipfs/" + imageHash,
        timestamp:window.timestamp,
        visitorId:window.visitorId
    }
    console.log(metadata);
    const jsonFile = new Moralis.File("metadata.json", {base64 : btoa(JSON.stringify(metadata))});
    await jsonFile.saveIPFS();
    console.log(jsonFile)
    message.innerHTML = `- ipfs - metadata.json -save`;

    let metadataHash = jsonFile.hash();
    console.log(jsonFile.ipfs())
    let res = await Moralis.Plugins.rarible.lazyMint({
        chain:_isDev?'rinkeby':'eth',
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
}

window.cubes=[];

function createGeometry() {

				const geometry = new THREE.BoxGeometry(1,1, 1, 32, 32, 32 );

				// create an empty array to  hold targets for the attribute we want to morph
				// morphing positions and normals is supported
				geometry.morphAttributes.position = [];

				// the original positions of the cube's vertices
				const positionAttribute = geometry.attributes.position;

				// for the first morph target we'll move the cube's vertices onto the surface of a sphere
				const spherePositions = [];

				// for the second morph target, we'll twist the cubes vertices
				const twistPositions = [];
				const direction = new THREE.Vector3( 1, 0, 0 );
				const vertex = new THREE.Vector3();

				for ( let i = 0; i < positionAttribute.count; i ++ ) {

					const x = positionAttribute.getX( i );
					const y = positionAttribute.getY( i );
					const z = positionAttribute.getZ( i );

					spherePositions.push(

						x * Math.sqrt( 1 - ( y * y / 2 ) - ( z * z / 2 ) + ( y * y * z * z / 3 ) ),
						y * Math.sqrt( 1 - ( z * z / 2 ) - ( x * x / 2 ) + ( z * z * x * x / 3 ) ),
						z * Math.sqrt( 1 - ( x * x / 2 ) - ( y * y / 2 ) + ( x * x * y * y / 3 ) )

					);

					// stretch along the x-axis so we can see the twist better
					vertex.set( x * 2, y, z );

					vertex.applyAxisAngle( direction, Math.PI * x / 2 ).toArray( twistPositions, twistPositions.length );

				}

				// add the spherical positions as the first morph target
				geometry.morphAttributes.position[ 0 ] = new THREE.Float32BufferAttribute( spherePositions, 3 );

				// add the twisted positions as the second morph target
				geometry.morphAttributes.position[ 1 ] = new THREE.Float32BufferAttribute( twistPositions, 3 );

				return geometry;

			}

function create(){
      const scene = new THREE.Scene();
			const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

      let canvas=document.querySelector('#target'),
      width=parseInt(getComputedStyle(document.querySelector('#target')).width),
      height=parseInt(getComputedStyle(document.querySelector('#target')).height);

      let mouseX = 0, mouseY = 0;

      // 画布的中点
			let windowHalfX =  width/2 +canvas.offsetLeft;
			let windowHalfY =  height/2 +canvas.offsetTop;
      // console.log(windowHalfX,windowHalfY)
      // console.log(document.querySelector('#target').style.width)
      // canvas.width=width;
      // canvas.height=height;
      // canvas.width=
			const renderer = new THREE.WebGLRenderer({
              alpha: true,
              antialias: true,
              preserveDrawingBuffer: true,
              canvas:document.querySelector('#target')
      });
      renderer.outputEncoding = THREE.LinearEncoding;
      renderer.setSize(width, height, false);
      renderer.setPixelRatio(2);
			// renderer.setSize( window.innerWidth, window.innerHeight );
			// document.body.appendChild( renderer.domElement );

			const geometry = createGeometry();
      const material=new THREE.MeshPhongMaterial( { color: 0x808080, dithering: true } );
			// const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
			const cube = new THREE.Mesh( geometry, material );
      cube.position.y=1.2;
			// scene.add( cube );

      // clone
      for (let i = -100; i <100; i++) {
       let x=cube.position.x+(i+1)*2;
        for (let index = -10; index < 10; index++) {
           let c=cube.clone();
           c.position.x=x;
          c.position.y=cube.position.y+(index+1)*2;
           c.position.z=-2
          scene.add(c);
          window.cubes.push(c);
        }
      
        
      }
      

      // const geometry2 = new THREE.BoxGeometry(8,2,0.1);
			// const material2 = new THREE.MeshBasicMaterial( { color: 0xffffff } );
			// const cube2 = new THREE.Mesh( geometry2, material2 );
      // cube2.position.y=-2;
      // window.material=material2;
      // window.material.map = new THREE.CanvasTexture( window.drawingCanvas );
      // // cube2.position.x=-0
			// scene.add( cube2 );

      //lights
        const sphere = new THREE.SphereGeometry( 0.5, 16, 8 );
				light1 = new THREE.PointLight( 0xff0040, 2, 50 );
				light1.add( new THREE.Mesh( sphere, new THREE.MeshBasicMaterial( { color: 0xff0040 } ) ) );
				scene.add( light1 );

				light2 = new THREE.PointLight( 0x0040ff, 2, 50 );
				light2.add( new THREE.Mesh( sphere, new THREE.MeshBasicMaterial( { color: 0x0040ff } ) ) );
				scene.add( light2 );

				light3 = new THREE.PointLight( 0x80ff80, 2, 50 );
				light3.add( new THREE.Mesh( sphere, new THREE.MeshBasicMaterial( { color: 0x80ff80 } ) ) );
				scene.add( light3 );

				light4 = new THREE.PointLight( 0xffaa00, 2, 50 );
				light4.add( new THREE.Mesh( sphere, new THREE.MeshBasicMaterial( { color: 0xffaa00 } ) ) );
				scene.add( light4 );
        
        scene.add( new THREE.AmbientLight( 0x8FBCD4, 0.4 ) );

			camera.position.z = 5;

      function onPointerMove( event ) {
				if ( event.isPrimary === false ) return;
        // console.log(event.clientX,event.clientY)
         mouseX = event.clientX - windowHalfX;
				 mouseY = event.clientY - windowHalfY;
         
        //  控制在画布范围内
        // closeChangeCamera=!!(mouseX>=width/2||mouseX<-width/2||mouseY>=height/2||mouseY<-height/2)
         
        // if(mouseX<0) mouseX=Math.min(mouseX,-width/2);
        // if(mouseY>=0) mouseY=Math.max(mouseY,height/2);
        // if(mouseY<0) mouseY=Math.min(mouseY,-height/2);
        // console.log(mouseX,mouseY)
			}

      function onWindowResize() {
				windowHalfX =  width/2 +canvas.offsetLeft;
			  windowHalfY =  height/2 +canvas.offsetTop;
				// camera.aspect = window.innerWidth / window.innerHeight;
				// camera.updateProjectionMatrix();
				// renderer.setSize( window.innerWidth, window.innerHeight );
			}

      function render(){
        // console.log('animate')
        if(!window.animateIsFinish){
          
          let count=30;
            for (const cube of window.cubes) {
              cube.rotation.x += 0.01*Math.random();
              cube.rotation.y += 0.01*Math.random();
              // cube.position.z = Math.random()>0.5?-0.3:0;
              if(count>0){
                //cube.scale.x += Math.random()*(Math.random()>0.5?-0.02:0.02);
                // Spherify
                cube.morphTargetInfluences[ 0 ] = window.spherify
                // Twist
                cube.morphTargetInfluences[ 1 ] =window.twist;
                count--;
              };
            }
            const time = Date.now() * 0.0025;

            light1.position.x = Math.sin( time * 0.7 ) * 30;
            light1.position.y = Math.cos( time * 0.5 ) * 40;
            light1.position.z = Math.cos( time * 0.3 ) * 30;

            light2.position.x = Math.cos( time * 0.3 ) * 30;
            light2.position.y = Math.sin( time * 0.5 ) * 40;
            light2.position.z = Math.sin( time * 0.7 ) * 30;

            light3.position.x = Math.sin( time * 0.7 ) * 30;
            light3.position.y = Math.cos( time * 0.3 ) * 40;
            light3.position.z = Math.sin( time * 0.5 ) * 30;

            light4.position.x = Math.sin( time * 0.3 ) * 30;
            light4.position.y = Math.cos( time * 0.7 ) * 40;
            light4.position.z = Math.sin( time * 0.5 ) * 30;
            if(!window.checkAnimate){
              setTimeout(()=>window.animateIsFinish=true,3500+(3000*Math.random()));
              window.checkAnimate=true;
            }
            
            camera.position.x += ( mouseX - camera.position.x ) * 0.0001;
            camera.position.y += ( - mouseY - camera.position.y ) * 0.0001;
            camera.rotation.x += ( mouseX - camera.rotation.x ) * 0.000001;
            camera.rotation.y += ( - mouseY - camera.rotation.y ) * 0.000001;
        }

				// camera.lookAt( scene.position );
      // console.log(camera.position.x,camera.position.y)
        renderer.render( scene, camera );

      }
			function animate() {
        requestAnimationFrame( animate );
        render();
			};



      document.body.style.touchAction = 'none';
			document.body.addEventListener( 'pointermove', onPointerMove );
      window.addEventListener( 'resize', onWindowResize );

			animate();

      window.renderer=renderer;
      window.scene=scene;
      window.camera=camera;
};



function runAnimate(){
  window.animateIsFinish?window.animateIsFinish=false:null;
  window.checkAnimate?window.checkAnimate=false:null;
  window.spherify=Math.random()*1.2;
  window.twist=Math.random()*1.2;
  window.cubes=shuffle(window.cubes);
  // 打乱
  function shuffle (arr) {
    let arrNew = [...arr]
    //用Math.random()函数生成0~1之间的随机数与0.5比较，返回-1或1
    const randomsort = function (a, b) {
      return Math.random() > 0.5 ? -1 : 1
    }
    // var arr = [1, 2, 3, 4, 5];
    return [...arrNew.sort(randomsort)]
  }
}

function drawText(){
    var drawingContext = drawingCanvas.getContext( '2d' );
			// draw white background
			drawingContext.fillStyle = 'rgba(0,0,0,1)';
			drawingContext.fillRect(0, 0, 300,250);
      drawingContext.fillStyle = '#FFFFFF';
      drawingContext.fillText(window.timestamp,20,130)
    if(window.material)window.material.map.needsUpdate = true;
}

function getTargetResult(){
    let c = window.renderer.domElement;
    // let ctx = c.getContext('2d');
    // // console.log(ctx)
    // ctx.font = '14px Arial'
    // ctx.fillStyle = 'white'
    // ctx.fillText('by shadow', 24, c.height - 8)
    let png = c.toDataURL('image/png');
    return png
}

login();



// https://threejs.org/examples/?q=mor#webgl_morphtargets
// 