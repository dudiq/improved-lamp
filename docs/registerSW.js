if('serviceWorker' in navigator) {window.addEventListener('load', () => {navigator.serviceWorker.register('/improved-lamp/sw.js', { scope: '/improved-lamp/' })})}