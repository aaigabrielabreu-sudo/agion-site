/* Agion Wealth — Service Worker DEDICADO A NOTIFICACOES.
   IMPORTANTE: nao tem handler de 'fetch' de proposito.
   Isso evita cache "zumbi" (o problema que uma vez deixou os graficos em branco). */

self.addEventListener('install', function(e){ self.skipWaiting(); });
self.addEventListener('activate', function(e){ e.waitUntil(self.clients.claim()); });

self.addEventListener('push', function(event){
  var d = {};
  try { d = event.data ? event.data.json() : {}; } catch(e){ try{ d = {body: event.data.text()}; }catch(_){ d = {}; } }
  var titulo = d.title || 'Agion Wealth';
  var opcoes = {
    body: d.body || 'Você tem uma novidade na plataforma.',
    icon: d.icon || '/AppIcon-512@2x.png',
    badge: d.badge || '/icon-192.png',
    tag: d.tag || 'agion',
    renotify: true,
    data: { url: d.url || '/plataforma#crm' },
    vibrate: [120, 60, 120]
  };
  event.waitUntil(self.registration.showNotification(titulo, opcoes));
});

self.addEventListener('notificationclick', function(event){
  event.notification.close();
  var alvo = (event.notification.data && event.notification.data.url) || '/plataforma#crm';
  event.waitUntil(
    self.clients.matchAll({type:'window', includeUncontrolled:true}).then(function(lista){
      for (var i=0;i<lista.length;i++){
        var c = lista[i];
        if (c.url.indexOf('/plataforma') >= 0 && 'focus' in c){
          try { c.navigate(alvo); } catch(e){}
          return c.focus();
        }
      }
      if (self.clients.openWindow) return self.clients.openWindow(alvo);
    })
  );
});
