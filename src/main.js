xmldom = require('xmldom');
OTP = require('otp.js');
require('./lib/tokensManager.js');

var TOTP = OTP.totp;
var HOTP = OTP.hotp;

var u = new utils();
var tokmanager = new tokensManager();
var interval = [];

class otpManager {
    start() {
        if (fs.existsSync(MASTERPASSWORD) == true && tokmanager.passwordIsSet() == false) {
            this.showWindow('login');
            return;
        }
        $('#msg').html('');
        tokmanager.save();
        var tokens = tokmanager.getTokensJson();
        var items = [];
        tokens.forEach((token, i) => {
            items.push({
                i: i,
                issuerExt: token.issuerExt,
                label: token.label
            })
        });
        var template = $('#itemsList').html();
        var render = Mustache.render(template, { items: items });
        $('#items').html(render);

        //Force new otp
        if (items == '') {
            this.showWindow('new');
        } else {
            this.showWindow('items');
        }

    }
    copyOTP(code) {
        var i = document.createElement('input');
        i.setAttribute('value', code);
        document.body.appendChild(i);
        i.select();
        document.execCommand('copy');
        document.body.removeChild(i);
        this.printMsg('Copied!');
    }
    removeOTP(index) {
        tokmanager.removeOTP(index);
        tokmanager.save();
        this.start();
    }
    generateCode(index) {
        var index_numeric = index.replace('item', '');
        var tokens = tokmanager.getTokensJson();
        if (tokens == undefined) return false;
        var b = u.toHexString(JSON.parse('[' + tokens[index_numeric].secret + ']'));
        var code = TOTP.gen({ hex: b },
            { algorithm: tokens[index_numeric].algo.toLowerCase() },
            { codeDigits: tokens[index_numeric].digits },
            { counter: tokens[index_numeric].counter },
            { time: tokens[index_numeric].period }
        );

        var item = {
            i: index_numeric,
            code: code,
            issuerExt: tokens[index_numeric].issuerExt,
            label: tokens[index_numeric].label
        };
        var template = $('#itemActive').html();
        var render = Mustache.render(template, item);
        $('#' + index).html(render);
        this.timerUpdate(tokens[index_numeric].period, index);
    }
    timerUpdate(period, index_string) {
        clearInterval(interval[index_string]);
        var event = setInterval(a => {
            var epoch = Math.round(new Date().getTime() / 1000.0);
            var countDown = period - (epoch % period);
            if (epoch % period == 1) a.generateCode(index_string);
            $('#' + index_string + ' .progress-bar').html((period - (epoch % period)));
            $('#' + index_string + ' .progress-bar').css('width', ((period - (epoch % period)) * 100) / period + '%');
        }, 1000, this);
        interval[index_string] = event;
    }
    stopGenerator(index_string) {
        $('#' + index_string + ' .progress-bar').remove();
        $('#' + index_string + ' .copy').remove();
        $('#' + index_string + ' .otpcode').html('---------');
        $('#' + index_string + ' .generator').attr('onclick', 'o.generateCode(\'' + index_string + '\')');
        $('#' + index_string + ' .generator').attr('value', 'Code');
        clearInterval(interval[index_string]);
    }
    createOTP() {
        var algo = $('#algo option:selected').text();
        var digits = $('input[name=digits]:radio:checked').val();
        var type = $('input[name=type]:radio:checked').val();
        var servicename = $('#servicename').val();
        var accountname = $('#accountname').val();
        var secret = $('#secret').val();
        if (secret == '' || secret.length == 1) {
            secret = u.decodeHexStringToByteArray('aa');
        } else {
            var hex = u.base32tohex(secret);
            secret = u.decodeHexStringToByteArray(hex);
        }
        tokmanager.createOTP(servicename, accountname, algo, type, secret, 0, digits, 30);
        tokmanager.save();

        // :-( TODO
        for (var i = 1; i < 99999; i++) {
            window.clearInterval(i);
        }

        this.start();
        this.showWindow('items');

    }
    importFreeOTP() {
        tokmanager.importFreeOTP();
        this.start();
        this.showWindow('items');
    }
    setPassword() {
        if (fs.existsSync(MASTERPASSWORD) == false) {
            this.showWindow('setpassword');
            return;
        }
    }
    login() {
        if ($('#password_login').val() == '' || $('#password_login').val() == undefined) {
            return;
        }
        var login = tokmanager.loadPassword($('#password_login').val());
        if (login == true) {
            this.start();
            this.showWindow('items');
        } else {
            this.printMsg('Error');
        }

    }
    writePassword() {
        if ($('#password').val() == $('#password_rewrited').val() && $('#password_rewrited').val() != '') {
            tokmanager.enableMasterPassword($('#password').val());
        } else {
            this.printMsg('<h1>Password not matched</h1>');
        }
        this.start();
        this.showWindow('items');
    }
    showWindow(window) {
        if (fs.existsSync(MASTERPASSWORD) == true && tokmanager.passwordIsSet() == false) {
            window = 'login';
        }
        $('.window').css('display', 'none');
        $('#' + window).css('display', 'block');
    }

    // https://www.w3schools.com/howto/tryit.asp?filename=tryhow_js_scroll_to_top
    scrollFunction() {
        if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
            document.getElementById('ontop').style.display = 'block';
        } else {
            document.getElementById('ontop').style.display = 'none';
        }
    }
    topFunction() {
        document.body.scrollTop = 0;
        document.documentElement.scrollTop = 0;
    }
    // --

    checkVersion() {
        var jpackage = JSON.parse(fs.readFileSync('package.json', 'utf-8'));

        var remote_jpackage = $.getJSON(REMOVE_VERSION, (data) => {
            if (jpackage.version != data.version) {
                this.printMsg('<a href="' + jpackage.repository.url + '">The new version is now available!</p>');
            } else {
                this.printMsg('<p>This is the latest version of OTPmanager</p>');
            }
        });

    }
    printMsg(msg) {
        $('#msg').show(500);
        $('#msg').html(msg);
        $('#msg').hide(5000);
    }
}

var o = new otpManager();
o.start()

//Init ontop button
window.onscroll = () => { o.scrollFunction() };