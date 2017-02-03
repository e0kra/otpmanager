class utils {
    /*
     * Convert base32 to hex http://jsfiddle.net/russau/ch8PK/
     */
    base32tohex(base32) {
        var base32chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
        var bits = "";
        var hex = "";

        for (var i = 0; i < base32.length; i++) {
            var val = base32chars.indexOf(base32.charAt(i).toUpperCase());
            bits += this.leftpad(val.toString(2), 5, '0');
        }

        for (var i = 0; i+4 <= bits.length; i+=4) {
            var chunk = bits.substr(i, 4);
            hex = hex + parseInt(chunk, 2).toString(16) ;
        }
        return hex;

    }
    leftpad(str, len, pad) {
        if (len + 1 >= str.length) {
            str = Array(len + 1 - str.length).join(pad) + str;
        }
        return str;
    }

  /*
   * Convert byte array to hex string http://stackoverflow.com/a/34310051
   */
  toHexString(byteArray) {
    return byteArray.map(function (byte) {
      return ('0' + (byte & 0xFF).toString(16)).slice(-2);
    }).join('')
  }

  /*
   * Convert a hex string to a byte array http://stackoverflow.com/a/33241674
   */
  decodeHexStringToByteArray(hexString) {
    var result = [];
    while (hexString.length >= 2) {
      if (isNaN(parseInt(hexString.substring(0, 2), 16)) == true) return [0];
      result.push(parseInt(hexString.substring(0, 2), 16));
      hexString = hexString.substring(2, hexString.length);
    }
    return result;
  }

}
