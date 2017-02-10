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
        if (fs.existsSync(MASTERPASSWORD) == true && tokmanager.passwordIsSet() == false ) {
            this.showWindow('login');
            return;
        }
        tokmanager.save();
        var tokens = tokmanager.getTokensJson();
        var index = 0;
        var items = '';
        for (var i = 0; i < tokens.length; i++) {
            var b = u.toHexString(JSON.parse('[' + tokens[i].secret + ']'));
            var code = TOTP.gen({ hex: b },
                { algorithm: tokens[i].algo.toLowerCase() },
                { codeDigits: tokens[i].digits },
                { counter: tokens[i].counter },
                { time: tokens[i].period }
            );

            var item = '<div class="item" id="item' + i + '">' +
                '<div class="timer">-' +
                '</div>' +
                '<div class="otp">' +
                '<span class="otpcode">---------</span>' +
                '</div>' +
                '<div class="info">' + tokens[i].issuerExt + " " + tokens[i].label + '</div><br />' +
                '<input class="generator" type="button" onclick="o.generateCode(\'item' + i + '\')" value="Code" />' +
                '<input type="button" onclick="o.removeOTP(\'' + i + '\')" value="Remove" />' +
                '</div>';
            items = items + item;

        }
        $('#items').html(items);
        //Force new otp
        if (items == '') {
            this.showWindow('new');
        }

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
        var item = '<div class="timer">-' +
            '</div>' +
            '<div class="otp">' +
            '<span class="otpcode">' + code + '</span>' +
            '</div>' +
            '<div class="info">' + tokens[index_numeric].issuerExt + " " + tokens[index_numeric].label + '</div><br />' +
            '<input class="generator" type="button" onclick="o.stopGenerator(\'item' + index_numeric + '\')" value="Hide" />' +
            '<input type="button" onclick="o.removeOTP(\'' + index_numeric + '\')" value="Remove" />';

        $('#' + index).html(item);
        this.timerUpdate(tokens[index_numeric].period, index);
    }
    timerUpdate(period, index_string) {
        var event = setInterval(function (a) {
            var epoch = Math.round(new Date().getTime() / 1000.0);
            var countDown = period - (epoch % period);
            if (epoch % period == 1) a.generateCode(index_string);
            $('#' + index_string + ' .timer').html(period - (epoch % period))
        }, 1000, this);
        interval[index_string] = event;
    }
    stopGenerator(index_string) {
        $('#' + index_string + ' .timer').html('-');
        $('#' + index_string + ' .otpcode').html('---------');
        $('#' + index_string + ' .generator').attr('onclick', 'o.generateCode(\'' + index_string + '\')');
        $('#' + index_string + ' .generator').attr('value', 'Code');
        clearInterval(interval[index_string]);
    }
    createOTP() {
        var algo = $("#algo option:selected").text();
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
        this.showWindow('setpassword');
    }
    login() {
        if($('#password_login').val() == '' || $('#password_login').val() == undefined){
            return;
        }
        tokmanager.loadPassword($('#password_login').val());
        this.start();
        this.showWindow('items');
    }
    writePassword() {
        if ($('#password').val() == $('#password_rewrited').val() && $('#password_rewrited').val() != '') {
            tokmanager.enableMasterPassword($('#password').val());
        } else {
            $('#msg').html('<h1>Password not matched</h1>');
        }
        this.start();
        this.showWindow('items');
    }
    showWindow(window) {
        $('.window').css('display', 'none');
        $('#' + window).css('display', 'block');
    }
}

var o = new otpManager();
o.start()
