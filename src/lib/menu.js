var gui = require('nw.gui');
var win = gui.Window.get();
win.setResizable(false);
win.toggleFullscreen();

//Tray
var tray = new nw.Tray({ title: 'otpManager', icon: 'logo.png' });
var menubar = new nw.Menu({
  type: 'menubar'
});

var fileMenu = new nw.Menu();
tray.menu = fileMenu;


fileMenu.append(new nw.MenuItem({
  label: 'New OTP',
  click: function () {
    o.showWindow('new');
  }
}));

fileMenu.append(new nw.MenuItem({
  label: 'List OTP',
  click: function () {
    o.showWindow('items');
  }
}));

var openRecentMenu = new nw.Menu();

openRecentMenu.append(new nw.MenuItem({
  label: 'Recente File X',
  click: function () {
    alert('Clicked to open a recent file');
  }
}));

menubar.append(new nw.MenuItem({ label: 'File', submenu: fileMenu }));


var win = nw.Window.get();
win.menu = menubar;