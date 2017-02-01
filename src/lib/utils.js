class utils {
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
