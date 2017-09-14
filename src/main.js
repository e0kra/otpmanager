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
        $("#msg").html('');
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

            var item = '<div class="item card" id="item' + i + '">' +
                '<div class="otp">' +
                '<span class="otpcode badge badge-secondary">---------</span>' +
                '</div>' +
                '<div class="info">' + tokens[i].issuerExt + " " + tokens[i].label + '</div><br />' +
                '<input class="generator btn btn-primary" type="button" onclick="o.generateCode(\'item' + i + '\')" value="Code" />' +
                '<input class="btn btn-primary" type="button" onclick="o.removeOTP(\'' + i + '\')" value="Remove" />' +
                '</div>';
            items = items + item;

        }
        $('#items').html(items);
        //Force new otp
        if (items == '') {
            this.showWindow('new');
        }else{
            this.showWindow('items');
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
        var item = '<div class="progress">'+
            '<div class="progress-bar" role="progressbar" style="width: 0%" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100"></div>'+
            '</div>'+
            '<div class="otp">' +
            '<span class="otpcode badge-success">' + code + '</span>' +
            '</div>' +
            '<div class="info">' + tokens[index_numeric].issuerExt + " " + tokens[index_numeric].label + '</div><br />' +
            '<input class="generator btn btn-primary" type="button" onclick="o.stopGenerator(\'item' + index_numeric + '\')" value="Hide" />' +
            '<input class="btn btn-primary" type="button" onclick="o.removeOTP(\'' + index_numeric + '\')" value="Remove" />';

        $('#' + index).html(item);
        this.timerUpdate(tokens[index_numeric].period, index);
    }
    timerUpdate(period, index_string) {
        clearInterval(interval[index_string]);
        var event = setInterval(function (a) {
            var epoch = Math.round(new Date().getTime() / 1000.0);
            var countDown = period - (epoch % period);
            if (epoch % period == 1) a.generateCode(index_string);
            $('#' + index_string + ' .progress-bar').html((period - (epoch % period)));
            $('#' + index_string + ' .progress-bar').css('width',((period - (epoch % period)) * 100 ) / period + '%' );
            ///
        }, 1000, this);
        interval[index_string] = event;
    }
    stopGenerator(index_string) {
        $('#' + index_string + ' .progress-bar').remove();
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
        if (fs.existsSync(MASTERPASSWORD) == false) {
            this.showWindow('setpassword');
            return;
        }
    }
    login() {
        if($('#password_login').val() == '' || $('#password_login').val() == undefined){
            return;
        }
        var login = tokmanager.loadPassword($('#password_login').val());
        if(login == true){
            this.start();
            this.showWindow('items');
        }else{
            this.printMsg("Error");
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
        if (fs.existsSync(MASTERPASSWORD) == true && tokmanager.passwordIsSet() == false ) {
            window = 'login';
        }
        $('.window').css('display', 'none');
        $('#' + window).css('display', 'block');
    }
    checkVersion(){
        var jpackage = JSON.parse(fs.readFileSync('package.json', "utf-8"));
        
        var remote_jpackage = $.getJSON(REMOVE_VERSION,function(data){
            if(jpackage.version != data.version){
                this.printMsg('<a href="'+jpackage.repository.url+'">The new version is now available!</p>');
            }else{
                this.printMsg("<p>This is the latest version of OTPmanager</p>");
            }
        }.bind(this));

    }
    printMsg(msg){
        $("#msg").show(500);
        $("#msg").html(msg);
        $("#msg").hide(5000);
    }
}

var o = new otpManager();
o.start()
