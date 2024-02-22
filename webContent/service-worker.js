


self.addEventListener('install', event => {
  console.log('this is the install event');
});

self.addEventListener('activate', event => {
  console.log('this is the activate event');
});

self.addEventListener('fetch', event => {
  setTimeout( () => {
    console.log( event.request.url.endsWith("version.json") );
    console.log( event );
  }, 2000 );
  if( event.request.url.endsWith("version.json") ){
    console.log( "VERSION.JSON ES EXCEPCIONADO" );
    event.respondWith( fetch( event.request, { cache: 'no-cache'}));
  }else{
    event.respondWith( 
      caches.match( event.request )
        .then( response => response || fetch( event.request ) )
    );
  }
});





