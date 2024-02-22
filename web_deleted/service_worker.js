'use strict';
/**
 * service_worker.js
 */

const appName = "prueba1"

const preFetchedAssets = [
  "/images/acueducto.jpg",
  "/images/foto2.jpg",
  "/images/foto3.jpg",
  "/images/foto4.jpg"];


function getVersion( cacheOption ){
  console.log(`getting ${cacheOption} version of the application`);
  return new Promise( (resolve, reject ) => {
    return fetch( "version.json", {
      method: "GET", 
      cache: cacheOption
    })
    .then( (response) => {
      if( response.ok ) {
        response.json()
        .then( (jsonResponse) => {
          console.log( `la version ${cacheOption} es: ${jsonResponse.version}`);
          console.log( jsonResponse.version );
          resolve( jsonResponse.version );  
        });
      }else
        reject( response.statusText );
    })
    .catch( (reason) => reject( reason ) );  
  });
}

function getLocalVersionOfApplication(){
  return getVersion("force-cache");
}

function getRemoteVersionOfApplication(){
  return getVersion("no-cache");
}

self.addEventListener("install", (event) => {
  console.log('fired install event');

  event.waitUntil(
    caches
      .open(appName)
      .then((cache) => {

        // añadimos una colección de estáticos 
        // en el servidor
        cache.addAll( preFetchedAssets );
        return cache;
      }),
  );
});

self.addEventListener("activate", (event) => {
  console.log("this is the registration event of the service worker");
  // verificamos la versión de la 
  // aplicación y si se ha actualizado
  // entonces hacemos que se marquen 
  // todos los activos de la caché como 
  // desactualizados
  caches.match( 'version.json' )
    .then( (responseFromCache) => {
      console.log('la respuesta de caché es:', responseFromCache);
      getRemoteVersionOfApplication();
    })
  // getLocalVersionOfApplication();
});

self.addEventListener("fetch", (event) => {
  console.log( "fetch event" ); 
  console.log( event.request );

  // Get the request
  let request = event.request;

  // Bug fix for certain Chromium versions if the 
  // web page is opened twice in different tabs
  // https://stackoverflow.com/a/49719964
  if(event.request.cache === 'only-if-cached' && event.request.mode !== 'same-origin') return;

  let acceptHeader = event.request.headers.get("Accept");
  if ( acceptHeader.includes('image')) {
    event.respondWith( 
      caches.match( request )
        .then(  response => {
          console.log( "image found in cache, returning it" );
          return response || fetch( request )
            .then( response => response );
        })
    );
  }

});

