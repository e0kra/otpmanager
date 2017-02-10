var gui = require('nw.gui');
var win = gui.Window.get();
win.setResizable(false);

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

menubar.append(new nw.MenuItem({ label: 'File', submenu: fileMenu }));

var optionsMenu = new nw.Menu();
optionsMenu.append(new nw.MenuItem({
  label: 'Set Password',
  click: function () {
    o.setPassword();
  }
}));

menubar.append(new nw.MenuItem({ label: 'Options', submenu: optionsMenu }));

var helpMenu = new nw.Menu();
helpMenu.append(new nw.MenuItem({
  label: 'Author: Tailot',
  click: function () {
    window.location = 'mailto: tailot@gmail.com';
  }
}));
helpMenu.append(new nw.MenuItem({
  label: 'tailot@gmail.com',
  click: function () {
    window.location = 'mailto: tailot@gmail.com';
  }
}));
menubar.append(new nw.MenuItem({ label: '?', submenu: helpMenu }));

var win = nw.Window.get();
win.menu = menubar;