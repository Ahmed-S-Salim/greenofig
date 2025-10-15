'use strict';
const MANIFEST = 'flutter-app-manifest';
const TEMP = 'flutter-temp-cache';
const CACHE_NAME = 'flutter-app-cache';

const RESOURCES = {".git/COMMIT_EDITMSG": "a2cacf61df9a2c73cf8e2a35b15b0ace",
".git/config": "9cb4371ea73a85b86ed8187cf46d4656",
".git/description": "a0a7c3fff21f2aea3cfa1d0316dd816c",
".git/HEAD": "5ab7a4355e4c959b0c5c008f202f51ec",
".git/hooks/applypatch-msg.sample": "ce562e08d8098926a3862fc6e7905199",
".git/hooks/commit-msg.sample": "579a3c1e12a1e74a98169175fb913012",
".git/hooks/fsmonitor-watchman.sample": "a0b2633a2c8e97501610bd3f73da66fc",
".git/hooks/post-update.sample": "2b7ea5cee3c49ff53d41e00785eb974c",
".git/hooks/pre-applypatch.sample": "054f9ffb8bfe04a599751cc757226dda",
".git/hooks/pre-commit.sample": "5029bfab85b1c39281aa9697379ea444",
".git/hooks/pre-merge-commit.sample": "39cb268e2a85d436b9eb6f47614c3cbc",
".git/hooks/pre-push.sample": "2c642152299a94e05ea26eae11993b13",
".git/hooks/pre-rebase.sample": "56e45f2bcbc8226d2b4200f7c46371bf",
".git/hooks/pre-receive.sample": "2ad18ec82c20af7b5926ed9cea6aeedd",
".git/hooks/prepare-commit-msg.sample": "2b5c047bdb474555e1787db32b2d2fc5",
".git/hooks/push-to-checkout.sample": "c7ab00c7784efeadad3ae9b228d4b4db",
".git/hooks/sendemail-validate.sample": "4d67df3a8d5c98cb8565c07e42be0b04",
".git/hooks/update.sample": "647ae13c682f7827c22f5fc08a03674e",
".git/index": "95ea052eeeb4c8deb567b7b6107f162d",
".git/info/exclude": "036208b4a1ab4a235d75c181e685e5a3",
".git/logs/HEAD": "d62fcda64b8010cc86064abeba54f6e4",
".git/logs/refs/heads/gh-pages": "d62fcda64b8010cc86064abeba54f6e4",
".git/logs/refs/remotes/origin/gh-pages": "06eaeefba06eacbfc1cd5bb7b8eaae5a",
".git/objects/01/0c6d294813d250573c750a39bbf463690f8d6b": "bc2d9fb98c2ff8468f6452ec095662f5",
".git/objects/06/5a156ad876ae75d08bca0aabc8c1e01f285abb": "1338ac20d12542d14345378e2fe2be26",
".git/objects/09/3c21a59af3293a0f8add48be2e6ba8bf56b02b": "bec738ccbb995c0fea9822b6c3907464",
".git/objects/10/ec44ea45eb719f5162eef7c5d42b68c84d63f9": "3343c10bb249c2beb72742d4f1553ef2",
".git/objects/1a/d7683b343914430a62157ebf451b9b2aa95cac": "94fdc36a022769ae6a8c6c98e87b3452",
".git/objects/1b/2e06a7b7f0d054fbe0b458741bbfd8a08e6993": "3056e1e78f0eeecee840cb1557cd884e",
".git/objects/1e/d9a81ce69d7be62f88d11b02cd1217d9c6181c": "c37f3455a1eba48d93ec3655bca8e6d6",
".git/objects/23/5c6d7bff4e3679227ad805ac2da65e32236f2d": "258e079c2ed527d9d9d78c4e51d9354e",
".git/objects/2b/d453dd10ab88f3ca645e70d123fb6884803251": "e512a861cba1419e000a08b3051b0b2d",
".git/objects/2d/0471ef9f12c9641643e7de6ebf25c440812b41": "d92fd35a211d5e9c566342a07818e99e",
".git/objects/2d/e4f6d08be7a813236495e042a4fef62f6c6f84": "7bf98c8c4e8c3f4ceced55c7d37e3007",
".git/objects/33/077d271a1ae713bff7e4cbfbab85b0b8203fbd": "7d10ff4b0833505d991a64d856bdecd5",
".git/objects/36/2667e650570f053329845b93d9acd81ab21e5c": "540da48bc355fbdcdcbd351d41b5298b",
".git/objects/37/653cf38071c61fa17074ab9e81881eb2827422": "b3c34005238f65dba3b7461e0c6216c5",
".git/objects/3a/bf18c41c58c933308c244a875bf383856e103e": "30790d31a35e3622fd7b3849c9bf1894",
".git/objects/3b/b0860a0981211a1ab11fced3e6dad7e9bc1834": "3f00fdcdb1bb283f5ce8fd548f00af7b",
".git/objects/3f/230dc1afe7f2ab21c0a1ae606c516f409bc406": "2c239e0ab5b37d0f4bc1e58b110c8c4c",
".git/objects/44/b8d91d4c51d4435dd343a04b8b6f962fc0e95a": "7923087afb2b6aae537f66b74d11d4a9",
".git/objects/47/3cf4baefca8dc6235a96e81e8903330080a6fd": "c5a1b57b3250a922dd394672ec99dcbc",
".git/objects/48/8888c24301de6aaf5ae8c9b3f1d4f17a037aba": "696fb085c1289260ca38821dc38d7d8f",
".git/objects/4b/2111da9a1449bb384529bca0c0e334496cec0d": "4753e830218946e586ae9f51a726327d",
".git/objects/4c/51fb2d35630595c50f37c2bf5e1ceaf14c1a1e": "a20985c22880b353a0e347c2c6382997",
".git/objects/50/82470218ee675fe44a398ce02e936d63570381": "01ae611aff99ecfa3de7806018eca760",
".git/objects/51/932985d1f6711e99e13587e46d142d3f2ee3ba": "ff8ca7f1794d9a868a1896bd8443f718",
".git/objects/53/18a6956a86af56edbf5d2c8fdd654bcc943e88": "a686c83ba0910f09872b90fd86a98a8f",
".git/objects/53/3d2508cc1abb665366c7c8368963561d8c24e0": "4592c949830452e9c2bb87f305940304",
".git/objects/56/570b6d9a4f0efb9a486d8309668d3f9303ecf3": "89e3492412b187dc7652b3dfe5b310c3",
".git/objects/5d/05b338db83522ba0bc93802334db47ab3d83c9": "262b5b43a21ff640d89d11ec6ec81c7a",
".git/objects/5e/eaf6c2ecfadccbaae31960b9640de5504eb1fc": "c49a9b85f9c3c38f8d1bc19a6fe622a8",
".git/objects/6a/e97509cf702172edbc3af845c81d8d430fb08f": "e29b4c3129c07c7d7dbaa76ba9955d83",
".git/objects/6b/f33a9ac906c44dfd95f50fba5feaf0cda27774": "10f29b252011869580c46a85427f1f98",
".git/objects/6c/8712955da126c385c13065516f1c848c981658": "a45b6acd387e2a85a51cefd84c760e54",
".git/objects/70/a234a3df0f8c93b4c4742536b997bf04980585": "d95736cd43d2676a49e58b0ee61c1fb9",
".git/objects/73/b7a15723e08bc89d4ab8fa060d5cb0c96802ba": "45b060adad7c6486fc19b2526e80a9e2",
".git/objects/73/c63bcf89a317ff882ba74ecb132b01c374a66f": "6ae390f0843274091d1e2838d9399c51",
".git/objects/7a/39bd6e940b528186b4d7c00fb563c6352c2fb6": "46b269536c82c18282b85c53f671441d",
".git/objects/7e/1f13bc724639067aa8035773415f31ea8c756f": "839c5c2d2cd28ab1d2c4adb39a7e05ef",
".git/objects/88/efde34189d746ddcb11c5830f63236379f8a2b": "3bba53699afcfd8f5fb6dc38aca6cef3",
".git/objects/89/043050737bb4aeeff4cb52d5263c883d4f9058": "7350a589c005a0bd9701b10a926ac038",
".git/objects/8a/1e5b319b0665bdec8886a99327a52c25d7f12b": "e1b53f7b9a943b1e8fa016f9b0c3eff4",
".git/objects/8e/3c7d6bbbef6e7cefcdd4df877e7ed0ee4af46e": "025a3d8b84f839de674cd3567fdb7b1b",
".git/objects/97/a2561e5c19b2f357d092ed3e0fa76db132450d": "a4da31cfc8cc89e2d81c4aa484b434f8",
".git/objects/99/6f1e98955919e82f0fd6e03446e5669fce9f7f": "060c984bb2227f945b353424ee7390d5",
".git/objects/9b/d3accc7e6a1485f4b1ddfbeeaae04e67e121d8": "784f8e1966649133f308f05f2d98214f",
".git/objects/a6/a3b3737ecd03375db784c826a7f01e239e3789": "3ca0731959f5ca0dc1da7d3a2a86c6cf",
".git/objects/a6/b6b0c7970e585b322c45540821c2532c29b3fd": "217635d932b024d49b6af279cab7d78d",
".git/objects/b1/21045b9b465d5217fd18242e60bff74eae6b3c": "a1fff3ef92f4aab3e01c453e4c4c2dfe",
".git/objects/b2/c4caf23c4f248da4b87f1fc72d01ec092d3b64": "fc426b614c2e19d9f5072ba3f5be7a16",
".git/objects/b4/2dd2f4fe640c321aed37d1974679f31d554628": "e6035d74a54e92478b154f92f887d73b",
".git/objects/b9/6a5236065a6c0fb7193cb2bb2f538b2d7b4788": "4227e5e94459652d40710ef438055fe5",
".git/objects/bb/357f00f513071855c4bf712dc3e5ae9f7d04a5": "a619ac4af6531cf0fb58e69e84dc1677",
".git/objects/be/bf0cfac0fa9492be41df93c01fce195df6bb97": "226e6b0b639b4b694323f60d3e890739",
".git/objects/c0/740b4d35a9e27a688fed0468cd8ab7f50e2b47": "469bf83edcc503896c1f99d08cfd384a",
".git/objects/c0/aa2d36b9789d2309093925803670af01d45271": "f4f261c9e57aab160a0e93f7c78e58ef",
".git/objects/c5/f04ac3ac89fa609916689178b6a42fc45fe19c": "8a4075ebe0e9f5ea59f0707af38b68b0",
".git/objects/c7/7663172ca915a99a594ca17d06f527db05657d": "6335b074b18eb4ebe51f3a2c609a6ecc",
".git/objects/c8/08fb85f7e1f0bf2055866aed144791a1409207": "92cdd8b3553e66b1f3185e40eb77684e",
".git/objects/cb/c2c804db34fb32fa5d96f7a245ed2a9b7fcdc7": "b4ecf52ba4c3b29fd3449a3678c6e333",
".git/objects/cf/827adfb1889937578a03ec38ba6e0cf4b20ba9": "d5c0915dfae8de828ce754b43d919c6f",
".git/objects/d4/3532a2348cc9c26053ddb5802f0e5d4b8abc05": "3dad9b209346b1723bb2cc68e7e42a44",
".git/objects/d9/dc0146cdddb01b9097204945fce07c29a8ac98": "5b8383d7c7584bd77c422740b7cc503b",
".git/objects/db/16989ce28f4e4867121f59aaf0deed2b392238": "e638d2a47334b666cf96f9edf8908c08",
".git/objects/dc/11fdb45a686de35a7f8c24f3ac5f134761b8a9": "761c08dfe3c67fe7f31a98f6e2be3c9c",
".git/objects/e0/14d1bef10070e0f28f224748b3772f3e7891e8": "0583dd222c414f86b86bd42ac4d87c59",
".git/objects/e0/7ac7b837115a3d31ed52874a73bd277791e6bf": "74ebcb23eb10724ed101c9ff99cfa39f",
".git/objects/e1/0f9c22b5399f6bb843d49e8c2fffd8d42dc3e3": "b2ba8512c55a049eac25c2dfed034c1f",
".git/objects/f2/04823a42f2d890f945f70d88b8e2d921c6ae26": "6b47f314ffc35cf6a1ced3208ecc857d",
".git/objects/f6/127f086edd1255a44a3b1a54bff34f6bec3e93": "ee699b1a92899db0ce30fa227e17bf16",
".git/refs/heads/gh-pages": "c715794d10f1f22fc159f72113deed3c",
".git/refs/remotes/origin/gh-pages": "c715794d10f1f22fc159f72113deed3c",
"assets/AssetManifest.bin": "9536ff0ab8379e79e12f2aa8cad564fa",
"assets/AssetManifest.bin.json": "216169c5766b6075235c87c802f5f7ab",
"assets/AssetManifest.json": "1380c0c5c0415eb400669c2773a3af4c",
"assets/assets/images/greenofig-logo.png": "c0d883608d4ce0b8987f41cf703e899b",
"assets/assets/images/img_app_logo.svg": "52e0f13a4898fcb7e2e6b785bc50d3e8",
"assets/assets/images/logosize-1760369987243.png": "92225bf1b72079249d818c31158c69e3",
"assets/assets/images/no-image.jpg": "1a5d2f8e2ae237e2dd853bd7b3fa7287",
"assets/assets/images/Remove_background_project-1760373401381.png": "c0d883608d4ce0b8987f41cf703e899b",
"assets/assets/images/Remove_background_project-1760377849271.png": "c0d883608d4ce0b8987f41cf703e899b",
"assets/assets/images/sad_face.svg": "4eccb4273d492e76924127c7520b7890",
"assets/FontManifest.json": "7b2a36307916a9721811788013e65289",
"assets/fonts/MaterialIcons-Regular.otf": "899d577f74f92dd21bc49d1257fe7d9d",
"assets/NOTICES": "b4a55c3fec2b9e002a8d02ee5bfb40bf",
"assets/packages/fluttertoast/assets/toastify.css": "a85675050054f179444bc5ad70ffc635",
"assets/packages/fluttertoast/assets/toastify.js": "56e2c9cedd97f10e7e5f1cebd85d53e3",
"assets/packages/record_web/assets/js/record.fixwebmduration.js": "1f0108ea80c8951ba702ced40cf8cdce",
"assets/packages/record_web/assets/js/record.worklet.js": "6d247986689d283b7e45ccdf7214c2ff",
"assets/shaders/ink_sparkle.frag": "ecc85a2e95f5e9f53123dcaf8cb9b6ce",
"canvaskit/canvaskit.js": "728b2d477d9b8c14593d4f9b82b484f3",
"canvaskit/canvaskit.js.symbols": "bdcd3835edf8586b6d6edfce8749fb77",
"canvaskit/canvaskit.wasm": "7a3f4ae7d65fc1de6a6e7ddd3224bc93",
"canvaskit/chromium/canvaskit.js": "8191e843020c832c9cf8852a4b909d4c",
"canvaskit/chromium/canvaskit.js.symbols": "b61b5f4673c9698029fa0a746a9ad581",
"canvaskit/chromium/canvaskit.wasm": "f504de372e31c8031018a9ec0a9ef5f0",
"canvaskit/skwasm.js": "ea559890a088fe28b4ddf70e17e60052",
"canvaskit/skwasm.js.symbols": "e72c79950c8a8483d826a7f0560573a1",
"canvaskit/skwasm.wasm": "39dd80367a4e71582d234948adc521c0",
"favicon.png": "c0d883608d4ce0b8987f41cf703e899b",
"flutter.js": "83d881c1dbb6d6bcd6b42e274605b69c",
"flutter_bootstrap.js": "76e9eb912e35b295287d2ed4e736491d",
"flutter_plugins.js": "6684cb33494c8738c33f1132c62f52dc",
"icons/Icon-192.png": "c0d883608d4ce0b8987f41cf703e899b",
"icons/Icon-512.png": "c0d883608d4ce0b8987f41cf703e899b",
"icons/Icon-maskable-192.png": "c0d883608d4ce0b8987f41cf703e899b",
"icons/Icon-maskable-512.png": "c0d883608d4ce0b8987f41cf703e899b",
"index.html": "43718ba45e940e8d9354ed59c0fa4b3c",
"/": "43718ba45e940e8d9354ed59c0fa4b3c",
"install.html": "a9eacfe9e21e7019deac39e00f9790d7",
"main.dart.js": "73d817b41d63368dbed9ff4f67b61cad",
"manifest.json": "1ffae4b362acca395e6c45278405d5e6",
"version.json": "2ea0ce669cab5b8d1c9cf9e107906ea7"};
// The application shell files that are downloaded before a service worker can
// start.
const CORE = ["main.dart.js",
"index.html",
"flutter_bootstrap.js",
"assets/AssetManifest.bin.json",
"assets/FontManifest.json"];

// During install, the TEMP cache is populated with the application shell files.
self.addEventListener("install", (event) => {
  self.skipWaiting();
  return event.waitUntil(
    caches.open(TEMP).then((cache) => {
      return cache.addAll(
        CORE.map((value) => new Request(value, {'cache': 'reload'})));
    })
  );
});
// During activate, the cache is populated with the temp files downloaded in
// install. If this service worker is upgrading from one with a saved
// MANIFEST, then use this to retain unchanged resource files.
self.addEventListener("activate", function(event) {
  return event.waitUntil(async function() {
    try {
      var contentCache = await caches.open(CACHE_NAME);
      var tempCache = await caches.open(TEMP);
      var manifestCache = await caches.open(MANIFEST);
      var manifest = await manifestCache.match('manifest');
      // When there is no prior manifest, clear the entire cache.
      if (!manifest) {
        await caches.delete(CACHE_NAME);
        contentCache = await caches.open(CACHE_NAME);
        for (var request of await tempCache.keys()) {
          var response = await tempCache.match(request);
          await contentCache.put(request, response);
        }
        await caches.delete(TEMP);
        // Save the manifest to make future upgrades efficient.
        await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
        // Claim client to enable caching on first launch
        self.clients.claim();
        return;
      }
      var oldManifest = await manifest.json();
      var origin = self.location.origin;
      for (var request of await contentCache.keys()) {
        var key = request.url.substring(origin.length + 1);
        if (key == "") {
          key = "/";
        }
        // If a resource from the old manifest is not in the new cache, or if
        // the MD5 sum has changed, delete it. Otherwise the resource is left
        // in the cache and can be reused by the new service worker.
        if (!RESOURCES[key] || RESOURCES[key] != oldManifest[key]) {
          await contentCache.delete(request);
        }
      }
      // Populate the cache with the app shell TEMP files, potentially overwriting
      // cache files preserved above.
      for (var request of await tempCache.keys()) {
        var response = await tempCache.match(request);
        await contentCache.put(request, response);
      }
      await caches.delete(TEMP);
      // Save the manifest to make future upgrades efficient.
      await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
      // Claim client to enable caching on first launch
      self.clients.claim();
      return;
    } catch (err) {
      // On an unhandled exception the state of the cache cannot be guaranteed.
      console.error('Failed to upgrade service worker: ' + err);
      await caches.delete(CACHE_NAME);
      await caches.delete(TEMP);
      await caches.delete(MANIFEST);
    }
  }());
});
// The fetch handler redirects requests for RESOURCE files to the service
// worker cache.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== 'GET') {
    return;
  }
  var origin = self.location.origin;
  var key = event.request.url.substring(origin.length + 1);
  // Redirect URLs to the index.html
  if (key.indexOf('?v=') != -1) {
    key = key.split('?v=')[0];
  }
  if (event.request.url == origin || event.request.url.startsWith(origin + '/#') || key == '') {
    key = '/';
  }
  // If the URL is not the RESOURCE list then return to signal that the
  // browser should take over.
  if (!RESOURCES[key]) {
    return;
  }
  // If the URL is the index.html, perform an online-first request.
  if (key == '/') {
    return onlineFirst(event);
  }
  event.respondWith(caches.open(CACHE_NAME)
    .then((cache) =>  {
      return cache.match(event.request).then((response) => {
        // Either respond with the cached resource, or perform a fetch and
        // lazily populate the cache only if the resource was successfully fetched.
        return response || fetch(event.request).then((response) => {
          if (response && Boolean(response.ok)) {
            cache.put(event.request, response.clone());
          }
          return response;
        });
      })
    })
  );
});
self.addEventListener('message', (event) => {
  // SkipWaiting can be used to immediately activate a waiting service worker.
  // This will also require a page refresh triggered by the main worker.
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
    return;
  }
  if (event.data === 'downloadOffline') {
    downloadOffline();
    return;
  }
});
// Download offline will check the RESOURCES for all files not in the cache
// and populate them.
async function downloadOffline() {
  var resources = [];
  var contentCache = await caches.open(CACHE_NAME);
  var currentContent = {};
  for (var request of await contentCache.keys()) {
    var key = request.url.substring(origin.length + 1);
    if (key == "") {
      key = "/";
    }
    currentContent[key] = true;
  }
  for (var resourceKey of Object.keys(RESOURCES)) {
    if (!currentContent[resourceKey]) {
      resources.push(resourceKey);
    }
  }
  return contentCache.addAll(resources);
}
// Attempt to download the resource online before falling back to
// the offline cache.
function onlineFirst(event) {
  return event.respondWith(
    fetch(event.request).then((response) => {
      return caches.open(CACHE_NAME).then((cache) => {
        cache.put(event.request, response.clone());
        return response;
      });
    }).catch((error) => {
      return caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((response) => {
          if (response != null) {
            return response;
          }
          throw error;
        });
      });
    })
  );
}
