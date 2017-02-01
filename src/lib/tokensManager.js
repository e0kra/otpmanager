
fs = require('fs');
xmldom = require('xmldom');

class tokensManager {
    /*
     * Init tokensManager
     */
    constructor() {
        if (fs.existsSync(TOKENS)) {
            this.tokens = fs.readFileSync(TOKENS, "utf-8");
        } else {
            this.tokens = "<?xml version='1.0' encoding='utf-8' standalone='yes' ?>\n" +
                "<map>\n" +
                "</map>";
            this.save();
        }
    }

    /*
     * Return a text xml/json file
     */
    getTokensString() {
        return this.tokens;
    }

    /*
     * Return an array of json for tokens file
     */
    getTokensJson() {
        var doc = new DOMParser().parseFromString(this.tokens, 'text/xml');
        var items = doc.documentElement.getElementsByTagName('string');
        var aItems = [];
        for (var i = 0; i < items.length; i++) {
            aItems.push(JSON.parse(items[i].innerHTML));
        }
        return aItems;
    }

    /*
     * Save tokens
     */
    save() {
        var doc = new DOMParser().parseFromString(this.tokens, 'text/xml');
        var items = doc.documentElement.getElementsByTagName('string');
        for (var i = 0; i < items.length; i++) {
            if (items[i].getAttribute('name') == 'tokenOrder') items[i].remove()
        }
        var newdoc = "<?xml version='1.0' encoding='utf-8' standalone='yes' ?>\n" +
            "<map>" +
            doc.documentElement.innerHTML +
            "</map>";
        this.tokens = newdoc;
        fs.writeFile(TOKENS, this.tokens, function (err) {
            if (err) {
                return console.log(err);
            }
        });
    }

    /*
     * Append child to map
     */
    appendItemMap(tokensString, itemString) {
        return tokensString.replace("</map>", itemString + '\n </map>');
    }

    /*
     *  Create a child map element for tokens.xml
     */
    createOTP(serviceName, accountName, algo, type, secret, counter, digits, period) {
        var item = '\t<string name="' + serviceName + ':' + accountName + '">' +
            '{"algo":"' + algo + '","type":"' + type + '","secret":[' + secret + '],"issuerExt":"' + serviceName + '","issuerInt":"' + serviceName + '","label":"' + accountName + '","counter":' + counter + ',"digits":' + digits + ',"period":' + period + '}' +
            '</string>';
        this.tokens = this.appendItemMap(this.tokens, item);
    }

    /*
     * Update item
     */
    updateOTP(index, serviceName, accountName, algo, type, secret, counter, digits, period) {
        var item = '{"algo":"' + algo + '","type":"' + type + '","secret":[' + secret + '],"issuerExt":"' + serviceName + '","issuerInt":"' + serviceName + '","label":"' + accountName + '","counter":' + counter + ',"digits":' + digits + ',"period":' + period + '}';
        var doc = new DOMParser().parseFromString(this.tokens, 'text/xml');
        var items = doc.documentElement.getElementsByTagName('string');
        items[index].innerHTML = item;
        var newdoc = "<?xml version='1.0' encoding='utf-8' standalone='yes' ?>\n" +
            "<map>" +
            doc.documentElement.innerHTML +
            "</map>";
        this.tokens = newdoc;
    }

    /*
     * Remove item
     */
    removeOTP(index) {
        var doc = new DOMParser().parseFromString(this.tokens, 'text/xml');
        var items = doc.documentElement.getElementsByTagName('string');
        items[index].remove();
        var newdoc = "<?xml version='1.0' encoding='utf-8' standalone='yes' ?>\n" +
            "<map>" +
            doc.documentElement.innerHTML +
            "</map>";
        this.tokens = newdoc;
    }

    /*
     *Import xml from FreeOTP
     */
    importFreeOTP() {
        var fileinput = document.querySelector('input[type=file]');
        var path = fileinput.value;

        // Read file with Node.js API
        var xml = fs.readFileSync(path, "utf-8");

        var doc = new DOMParser().parseFromString(xml, 'text/xml');
        var items = doc.documentElement.getElementsByTagName('string');

        if (items.length > 0) {
            this.tokens = xml;
            this.save();
        }
    }
}