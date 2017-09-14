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
  label: 'Import from FreeOTP',
  click: function () {
    o.showWindow('import');
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
  label: 'Credits',
  click: function () {
    o.showWindow('credits');
  }
}));
helpMenu.append(new nw.MenuItem({
  label: 'Check version',
  click: function () {
    o.checkVersion();
  }
}));
menubar.append(new nw.MenuItem({ label: '?', submenu: helpMenu }));

var win = nw.Window.get();
win.menu = menubar;